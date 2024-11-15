import React from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PADDING = 16;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - PADDING * 2 - CARD_MARGIN * 2) / 2;

export default function RecipeRecommendations({ route, navigation }) {
  const { detectedObjects = [], recommendations = [] } = route?.params || {};

  if (!route?.params) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

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
    console.log(recipe)
    navigation.navigate('RecipeDetail', { recipe });
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)} // Pass the item as a parameter here
    >
      <Image
        source={{ uri: item.image }}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.recipeGradient} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.recipeMetaData}>
          <View style={styles.metaItem}>
            <MaterialIcons name="timer" size={16} color="#FFF" />
            <Text style={styles.metaText}>{item.cookingMinutes}m</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="whatshot" size={16} color="#FFF" />
            <Text style={styles.metaText}>{item.calories}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="restaurant" size={64} color="#DDD" />
      <Text style={styles.emptyText}>There are no recommended dishes</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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

      {/* Detected Objects Section */}
      <View style={styles.detectedObjectsContainer}>
        <Text style={styles.sectionTitle}>Identifying object:</Text>
        {renderBadges()}
      </View>
      
      {/* Recommendations Section */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Recommended dishes:</Text>
        <FlatList
          data={recommendations}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          numColumns={2}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  detectedObjectsContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noObjectsText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  recommendationsContainer: {
    flex: 1,
    padding: 16,
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
    height: 150,
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
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
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