import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PADDING = 16;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - PADDING * 2 - CARD_MARGIN * 2) / 2;

export default function RecipeRecommendations({ route, navigation }) {
  const { detectedObjects = [] } = route?.params || {};
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    if (!detectedObjects.length) {
      setLoading(false);
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/detect/recommend-by-keyword/${detectedObjects.join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );
      setRecommendations(response.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      Alert.alert(
        'Error',
        'Unable to fetch recipe recommendations. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBadges = () => {
    if (!detectedObjects.length) {
      return (
        <Text style={styles.noObjectsText}>No objects identified</Text>
      );
    }

    return (
      <View style={styles.badgesContainer}>
        {detectedObjects.map((object, index) => (
          <View 
            key={index} 
            style={[
              styles.badge,
              { backgroundColor: getBadgeColor(index) }
            ]}
          >
            <Text style={styles.badgeText}>{object}</Text>
          </View>
        ))}
      </View>
    );
  };

  const getBadgeColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    return colors[index % colors.length];
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id_recipe });
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
    >
      <Image
        source={{
          uri: item.image
            ? `${process.env.EXPO_PUBLIC_DOMAIN}api/file/get-file/recipes/${item.image}`
            : null,
        }}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.recipeGradient} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.name_recipe}
        </Text>
        <View style={styles.recipeMetaData}>
          <View style={styles.metaItem}>
            <MaterialIcons name="restaurant" size={16} color="#FFF" />
            <Text style={styles.metaText}>{item.type}</Text>
          </View>
          {item.status === 'Published' && (
            <View style={styles.statusBadge}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </View>
      </View>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText} numberOfLines={2}>
          {item.summary}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="restaurant" size={64} color="#DDD" />
      <Text style={styles.emptyText}>There are no recommended dishes</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Finding recipes for you...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommended dishes</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.detectedObjectsContainer}>
        <Text style={styles.sectionTitle}>Identifying object:</Text>
        {renderBadges()}
      </View>
      
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Recommended dishes:</Text>
        <FlatList
          data={recommendations}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id_recipe.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchRecommendations}
          refreshing={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
  },
  headerRight: {
    width: 40,
  },
  detectedObjectsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333333',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  noObjectsText: {
    color: '#555555',
    fontSize: 14,
    fontStyle: 'italic',
  },
  recommendationsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 16,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recipeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  recipeMetaData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: 12,
  },
  summaryContainer: {
    padding: 8,
    backgroundColor: '#FFF',
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});