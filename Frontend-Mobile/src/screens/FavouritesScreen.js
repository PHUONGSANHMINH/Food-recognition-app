import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const FavouriteRecipes = () => {
  const navigation = useNavigation();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavourites = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/recipe/favourites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavourites(response.data.recipes);
      setLoading(false);
    } catch (err) {
      setError('Unable to load favorites list');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavourites().then(() => setRefreshing(false));
  };

  const renderFavouriteItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id_recipe })}
    >
      <Image 
        source={{
          uri: item.image
            ? `${process.env.EXPO_PUBLIC_DOMAIN}api/file/get-file/recipes/${item.image}`
            : null
        }}
        style={styles.recipeImage} 
        defaultSource={require('../assets/food-placeholder.png')}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name_recipe}</Text>
        <Text style={styles.recipeType}>{item.type}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => {/* Implement remove from favourites logic */}}
      >
        <Image 
          source={require('../assets/favourite.png')} 
          style={styles.removeIcon} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#ee4d2d" />;
    }

    if (favourites.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite recipe yet</Text>
          <Text style={styles.emptySubtext}>Feel free to add recipes you like</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={favourites}
        renderItem={renderFavouriteItem}
        keyExtractor={(item) => item.id_recipe.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#ee4d2d']}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../assets/arrow_back.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourite recipes</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipeType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  removeIcon: {
    width: 24,
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default FavouriteRecipes;