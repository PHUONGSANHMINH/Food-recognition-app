import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import axios from 'axios'; // Thêm import axios
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = {
  // Sử dụng biến môi trường cho URL
  
  async fetchRecipes(page = 1, limit = 10, search = '') {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/recipe`, {
        params: { page, limit, search }, // Sử dụng params để truyền tham số
      });
      return response.data; // Trả về dữ liệu từ response
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }
};

const Header = ({ onSearch, onLogout }) => {
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();

  const debouncedSearch = useCallback(
    debounce((text) => {
      onSearch(text);
    }, 500),
    []
  );

  const handleSearchChange = (text) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleLogout = async () => {
    try {
      // Xóa token khỏi AsyncStorage
      await AsyncStorage.removeItem('access_token');

      // Chuyển hướng đến màn hình đăng nhập
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Logout failed: ', error);
      // Xử lý lỗi nếu cần thiết
    }
  };

  const handleContributionPress = () => {
    setShowModal(false);
    navigation.navigate('Contribution');
  };

  const handleFavouritesPress = () => {
    setShowModal(false);
    navigation.navigate('Favourites');
  };

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Image
            source={require('../assets/loupe.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm công thức..."
            value={searchText}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setShowModal(true)}
        >
          <Image
            source={require('../assets/chef.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.logoutContainer}>
            <View style={styles.additionalButtonsContainer}>
              <TouchableOpacity style={styles.squareButton}
                onPress={handleContributionPress}
              >
                <Image 
                  source={require('../assets/star.png')} 
                  style={styles.squareButtonIcon} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.squareButton}>
                <Image 
                  source={require('../assets/blender.png')} 
                  style={styles.squareButtonIcon} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.squareButton}
                onPress={handleFavouritesPress}
              >
                <Image 
                  source={require('../assets/favourite.png')} 
                  style={styles.squareButtonIcon} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.squareButton}>
                <Image 
                  source={require('../assets/chef.png')} 
                  style={styles.squareButtonIcon} 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

const RecipeItem = ({ item }) => (
  <View style={styles.recipeContainer}>
    <Image 
      source={{ uri: item.image }}
      style={styles.recipeImage}
      defaultSource={require('../assets/food-placeholder.png')}
    />
    <View style={styles.recipeContent}>
      <Text style={styles.recipeTitle}>{item.name_recipe}</Text>
      <Text style={styles.recipeSummary} numberOfLines={2}>
        {item.summary}
      </Text>
      <View style={styles.recipeFooter}>
        <Text style={styles.recipeType}>{item.type}</Text>
        {item.status.includes('featured') && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

const SkeletonItem = () => (
  <View style={styles.recipeContainer}>
    <View style={styles.skeletonImage}>
      <LinearGradient
        colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.skeletonGradient}
      />
    </View>
    <View style={styles.recipeContent}>
      <View style={[styles.skeletonText, { width: '80%' }]}>
        <LinearGradient
          colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.skeletonGradient}
        />
      </View>
      <View style={[styles.skeletonText, { width: '60%' }]}>
        <LinearGradient
          colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.skeletonGradient}
        />
      </View>
    </View>
  </View>
);

const RecipeList = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const loadRecipes = async (pageNum = 1, search = '') => {
    try {
      const data = await api.fetchRecipes(pageNum, 10, search);
      
      if (pageNum === 1) {
        setRecipes(data);
      } else {
        setRecipes(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 10);
      setError(null);
    } catch (err) {
      setError('Cannot load data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadRecipes(1, "");
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadRecipes(nextPage, searchQuery);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setPage(1);
    setLoading(true);
    loadRecipes(1, text);
  };

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#ee4d2d" />
      </View>
    );
  };

  const renderEmptyList = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recipes found</Text>
        <Text style={styles.emptySubText}>
          Try adjusting your search or add a new recipe using the camera button
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => <RecipeItem item={item} />;

  if (loading && page === 1) {
    return (
      <View style={styles.container}>
        <Header onSearch={handleSearch} />
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonItem />}
          keyExtractor={(item) => item.toString()}
        />
        <View style={styles.bounceButtonContainer}>
          <TouchableOpacity style={styles.bounceButton} onPress={handleCameraPress}>
            <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header onSearch={handleSearch} />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadRecipes(page, searchQuery)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_recipe.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#ee4d2d']}
            />
          }
        />
      )}
      <View style={styles.bounceButtonContainer}>
        <TouchableOpacity style={styles.bounceButton} onPress={handleCameraPress}>
          <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  additionalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  squareButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  squareButtonIcon: {
    width: 30,
    height: 30,
  },
  bounceButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  bounceButton: {
    backgroundColor: '#ee4d2d',
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cameraIcon: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 40,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  recipeContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  recipeContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recipeSummary: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recipeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recipeType: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadge: {
    marginLeft: 8,
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 12,
    color: 'white',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  logoutContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    padding: 16,
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    overflow: 'hidden',
  },
  skeletonGradient: {
    flex: 1,
    width: '300%',
    opacity: 0.8,
  },
});

export default RecipeList;