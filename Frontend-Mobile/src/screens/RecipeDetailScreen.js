import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecipeDetail({ route }) {
  const navigation = useNavigation();
  const { recipe, recipeId } = route.params;
  const [activeTab, setActiveTab] = useState('ingredients');
  const [customRecipe, setCustomRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (recipeId) {
      const fetchRecipeDetail = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          const response = await axios.get(
            `${process.env.EXPO_PUBLIC_DOMAIN}api/recipe/${recipeId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCustomRecipe(response.data);
        } catch (err) {
          setError('Unable to load recipe details');
        } finally {
          setLoading(false);
        }
      };

      fetchRecipeDetail();
    } else {
      setLoading(false);
    }
  }, [recipeId]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#ee4d2d" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const displayRecipe = customRecipe || recipe;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dish details</Text>
        <View style={styles.headerRight} />
      </View>
      <Image
        source={{
          uri: displayRecipe.image
            ? `${process.env.EXPO_PUBLIC_DOMAIN}api/file/get-file/recipes/${displayRecipe.image}`
            : null
        }}
        style={styles.image}
        defaultSource={require('../assets/food-placeholder.png')}
      />
      <Text style={styles.title}>{displayRecipe.title || displayRecipe.name_recipe}</Text>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'ingredients' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('ingredients')}
        >
          <Text style={styles.tabText}>Ingredients</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'nutrition' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('nutrition')}
        >
          <Text style={styles.tabText}>Nutrition</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'instructions' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('instructions')}
        >
          <Text style={styles.tabText}>Instructions</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.tabContent}>
        {activeTab === 'ingredients' && (
          <View style={styles.section}>
            {displayRecipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBadge}>
                  <Text style={styles.ingredientAmount}>{ingredient.amount || ingredient.quantity}</Text>
                  <Text style={styles.ingredientUnit}>{ingredient.unit}</Text>
                </View>
                <Text style={styles.ingredientName}>{ingredient.name || ingredient.name_ingredient}</Text>
              </View>
            ))}
          </View>
        )}
        {activeTab === 'nutrition' && (
          <View style={styles.section}>
            {customRecipe ? (
              <View>
                <Text style={styles.text}>Calories: {customRecipe.nutrition.calories}</Text>
                <Text style={styles.text}>Fat: {customRecipe.nutrition.fat}</Text>
                {/* Add other nutrition details here */}
              </View>
            ) : (
              displayRecipe.nutrients.map((nutrient, index) => (
                <View key={index} style={styles.nutrientItem}>
                  <Text style={styles.nutrientName}>{nutrient.name}</Text>
                  <Text style={styles.nutrientAmount}>
                    {nutrient.amount.toFixed(2)} {nutrient.unit}
                  </Text>
                  <Text style={styles.nutrientPercentage}>
                    ({nutrient.percentOfDailyNeeds.toFixed(2)}%)
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
        {activeTab === 'instructions' && (
          <View style={styles.section}>
            {customRecipe
              ? customRecipe.steps.map((step, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{step.step_number}</Text>
                    </View>
                    <Text style={styles.instructionText}>{step.content}</Text>
                  </View>
                ))
              : displayRecipe.instructions.map((step, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{step.step_number}</Text>
                    </View>
                    <Text style={styles.instructionText}>{step.instruction}</Text>
                  </View>
                ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginVertical: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  ingredientBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 12,
    width: 120,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ingredientUnit: {
    fontSize: 14,
    color: '#666',
  },
  ingredientName: {
    fontSize: 16,
  },
  nutrientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  nutrientName: {
    fontSize: 16,
    flex: 1,
  },
  nutrientAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  nutrientPercentage: {
    fontSize: 14,
    color: '#666',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  instructionNumber: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  instructionText: {
    fontSize: 16,
    flex: 1,
  },
});
