import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BackButton from '../components/BackButton';

export default function RecipeDetail({ route, navigation }) {
  const { recipe } = route.params;
  
  // Cung cấp giá trị mặc định nếu không có dữ liệu
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton goBack={navigation.goBack} />
        <Text style={styles.headerTitle}>Recipe Details</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        
        <View style={styles.recipeInfoContainer}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.recipeMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="timer" size={20} color="#666" />
              <Text style={styles.metaText}>{recipe.readyInMinutes} minutes</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="people" size={20} color="#666" />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionContent}>{recipe.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.length > 0 ? (
            ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.sectionContent}>
                - {ingredient}
              </Text>
            ))
          ) : (
            <Text style={styles.sectionContent}>No ingredients listed.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {instructions.length > 0 ? (
            instructions.map((instruction, index) => (
              <Text key={index} style={styles.sectionContent}>
                {index + 1}. {instruction}
              </Text>
            ))
          ) : (
            <Text style={styles.sectionContent}>No instructions listed.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeInfoContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});
