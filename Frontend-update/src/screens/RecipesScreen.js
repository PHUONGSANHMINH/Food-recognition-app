import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, Image,
  TouchableOpacity, Platform, StatusBar, ActivityIndicator,
  TextInput, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;   // 2 cột, padding 16 mỗi bên + gap 16

export default function RecipesScreen({ navigation }) {
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState(new Set()); // id_recipe đã yêu thích

  const getImageUri = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    // DB lưu chỉ filename (VD: butter_chicken.jpg), file nằm trong uploads/recipes/
    if (imagePath.includes('/')) {
      return `${API_URL}/api/file/get-file/${imagePath}`;
    }
    return `${API_URL}/api/file/get-file/recipes/${imagePath}`;
  };

  const fetchData = useCallback(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');

        // Lấy lịch sử tìm kiếm
        if (token) {
          const histRes = await fetch(`${API_URL}/api/recipe/search-history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (histRes.ok) {
            const histData = await histRes.json();
            setSearchHistory((histData.history || []).map(h => h.keyword));
          }

          // Lấy danh sách favourites để hiển thị tim đỏ
          const favRes = await fetch(`${API_URL}/api/detect/favourites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (favRes.ok) {
            const favData = await favRes.json();
            const ids = new Set(
              (favData.favourites || [])
                .filter(f => f.id_recipe)
                .map(f => f.id_recipe)
            );
            setFavouriteIds(ids);
          }
        }

        // Lấy top-rated recipes
        setLoadingRec(true);
        const recRes = await fetch(`${API_URL}/api/recipe/top-rated?limit=10`);
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingRec(false);
      }
    };
    load();
  }, []);


  useFocusEffect(fetchData);

  const handleDeleteHistory = async (kw) => {
    setSearchHistory(prev => prev.filter(h => h !== kw));
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_URL}/api/recipe/search-history/${encodeURIComponent(kw)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* ignore */ }
  };

  // Header của FlatList (search bar + recent search + section title)
  const ListHeader = () => (
    <View>
      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SearchScreen', {})}
      >
        <Ionicons name="search-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} />
        <Text style={styles.searchPlaceholder}>Search recipes...</Text>
      </TouchableOpacity>

      {/* Recent Search */}
      {searchHistory.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Recent research</Text>
          <View style={styles.historyWrap}>
            {searchHistory.map((kw) => (
              <TouchableOpacity
                key={kw}
                style={styles.historyChip}
                onPress={() => navigation.navigate('SearchScreen', { initialKeyword: kw })}
                onLongPress={() => handleDeleteHistory(kw)}
              >
                <Text style={styles.historyText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Section title Recommender */}
      <Text style={styles.sectionTitle}>Recommender for you</Text>
    </View>
  );

  // Toggle favourite ngay trên card
  const toggleFavourite = async (item) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_URL}/api/recipe/${item.id_recipe}/favourite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavouriteIds(prev => {
          const next = new Set(prev);
          if (next.has(item.id_recipe)) next.delete(item.id_recipe);
          else next.add(item.id_recipe);
          return next;
        });
      }
    } catch { /* ignore */ }
  };

  // Card món ăn — thiết kế theo ảnh
  const RecipeCard = ({ item }) => {
    const imageUri = getImageUri(item.image);
    const isFav = favouriteIds.has(item.id_recipe);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('RecipeDetailScreen', {
          recipe: {
            id_recipe: item.id_recipe,
            name_recipe: item.name_recipe,
            image: item.image,
            calories: item.calories,
          }
        })}
      >
        {/* Ảnh */}
        <View style={styles.cardImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.imageFallback]}>
              <Ionicons name="restaurant-outline" size={36} color="#ccc" />
            </View>
          )}
          {/* Heart icon — đỏ nếu đã yêu thích */}
          <TouchableOpacity
            style={[styles.heartOverlay, isFav && styles.heartOverlayFav]}
            onPress={() => toggleFavourite(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? '#EF4444' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name_recipe}</Text>
          <View style={styles.metaRow}>
            {item.calories != null && (
              <>
                <Ionicons name="flame-outline" size={13} color="#6B7280" />
                <Text style={styles.metaText}>{Math.round(item.calories)} kcal</Text>
              </>
            )}
            {item.avg_rating != null && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{Number(item.avg_rating).toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2F5" />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/Food.png')} style={styles.avatar} />
        <Text style={styles.headerTitle}>Recipes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FavoriteScreen')}>
          <Ionicons name="heart" size={26} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Grid 2 cột */}
      {loadingRec ? (
        <View>
          <ListHeader />
          <ActivityIndicator color="#3F805A" style={{ marginTop: 30 }} />
        </View>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id_recipe.toString()}
          renderItem={({ item }) => <RecipeCard item={item} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#F0F2F5',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },

  listContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // Search bar
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 16, height: 48,
    marginBottom: 20, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  searchPlaceholder: { fontSize: 16, color: '#9CA3AF' },

  // Section title
  sectionTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#000',
    marginBottom: 14,
  },

  // History chips — dạng pill xanh nhạt
  historyWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginBottom: 20, gap: 10,
  },
  historyChip: {
    backgroundColor: '#E6F2EB',
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  historyText: { fontSize: 14, color: '#3F805A', fontWeight: '500' },

  // Grid row
  row: { justifyContent: 'space-between', marginBottom: 16 },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: CARD_WIDTH * 0.85, resizeMode: 'cover' },
  imageFallback: {
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  heartOverlay: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20, padding: 5,
  },
  heartOverlayFav: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#111', marginBottom: 6, lineHeight: 18 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B7280' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 8 },
  ratingText: { fontSize: 12, color: '#6B7280' },
});
