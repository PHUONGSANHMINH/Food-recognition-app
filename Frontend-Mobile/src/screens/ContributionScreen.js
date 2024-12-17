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
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ContributionScreen = () => {
  const navigation = useNavigation();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  const fetchContributions = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/recipe/contributions`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setContributions(response.data.contributions);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchContributions();
    }, []) // Mảng phụ thuộc rỗng để chỉ thực hiện khi màn hình được focus
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchContributions().then(() => setRefreshing(false));
  };

  const confirmDelete = (id_recipe) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this contribution?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedContribution(null)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(id_recipe)
        }
      ]
    );
  };

  const handleDelete = async (id_recipe) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.delete(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/recipe/delete/${id_recipe}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setContributions(contributions.filter((item) => item.id_recipe !== id_recipe));
      setSelectedContribution(null);
    } catch (err) {
      setError('Unable to delete contribution');
    }
  };

  const renderContributionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id_recipe })}
      onLongPress={() => {
        if (!item.accept_contribution) {
          setSelectedContribution(item.id_recipe);
        }
      }}
    >
      <Image
        source={{
          uri: item.image
            ? `${process.env.EXPO_PUBLIC_DOMAIN}api/file/get-file/recipes/${item.image}`
            : null,
        }}
        style={styles.recipeImage}
        defaultSource={require('../assets/food-placeholder.png')}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName} numberOfLines={2}>{item.name_recipe}</Text>
        <Text
          style={[
            styles.recipeType,
            item.accept_contribution ? styles.approvedStatus : styles.pendingStatus,
          ]}
        >
          {item.accept_contribution ? 'Approved' : 'Waiting Review'}
        </Text>
      </View>
      {item.accept_contribution && (
        <Ionicons name="checkmark-circle" size={24} color="green" style={styles.tickIcon} />
      )}
      {!item.accept_contribution && selectedContribution === item.id_recipe && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id_recipe)}
        >
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#ee4d2d" />;
    }

    if (contributions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contributions yet</Text>
          <Text style={styles.emptySubtext}>Feel free to add your recipes</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={contributions}
        renderItem={renderContributionItem}
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
        <Text style={styles.headerTitle}>My Contributions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddRecipeContribution')}
        >
          <Ionicons name="add" size={24} color="#ee4d2d" />
        </TouchableOpacity>
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
    justifyContent: 'space-between', // Change to space-between
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    // Add style for the add button
    padding: 8,
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
    marginTop: 4,
  },
  approvedStatus: {
    color: '#4CAF50',
  },
  pendingStatus: {
    color: '#FFC107',
  },
  tickIcon: { // Thêm style cho icon tick
    marginLeft: 8,
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
  deleteButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 16,
    elevation: 2,
  },
});

export default ContributionScreen;
