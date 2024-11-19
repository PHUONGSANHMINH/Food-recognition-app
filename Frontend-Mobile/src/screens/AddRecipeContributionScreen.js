import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const AddRecipeContributionScreen = () => {
  const navigation = useNavigation();
  const [recipeName, setRecipeName] = useState('');
  const [recipeType, setRecipeType] = useState('');
  const [recipeSummary, setRecipeSummary] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredients, setIngredients] = useState([{ name_ingredient: '', quantity: '', unit: '' }]);
  const [ingredientImages, setIngredientImages] = useState([]);
  const [steps, setSteps] = useState([{ step_number: 1, content: '' }]);
  const [nutrition, setNutrition] = useState({
    calories: null,
    fat: null,
    saturated_fat: null,
    carbohydrates: null,
    sugar: null,
    cholesterol: null,
    sodium: null,
    protein: null,
    alcohol: null
  });
  const [vitamins, setVitamins] = useState([{
    protein: null, 
    calcium: null, 
    iron: null, 
    vitamin_a: null, 
    vitamin_c: null,
    vitamin_d: null,
    vitamin_e: null,
    vitamin_k: null,
    vitamin_b1: null,
    vitamin_b2: null,
    vitamin_b3: null,
    vitamin_b5: null,
    vitamin_b6: null,
    vitamin_b12: null,
    fiber: null
  }]);

  const pickRecipeImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setRecipeImage(result.assets[0]);
    }
  };

  const pickIngredientImage = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = [...ingredientImages];
      newImages[index] = result.assets[0];
      setIngredientImages(newImages);
    }
  };

  const removeIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      step_number: i + 1, // Cập nhật lại số bước
    }));
    setSteps(updatedSteps);
  };

  const submitRecipe = async () => {
    // Validate inputs
    if (!recipeName || !recipeType || !recipeSummary) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate ingredients
    const hasValidIngredients = ingredients.some(ing => ing.name_ingredient && ing.quantity);
    if (!hasValidIngredients) {
      Alert.alert('Error', 'Please add at least one valid ingredient');
      return;
    }

    // Validate steps
    const hasValidSteps = steps.some(step => step.content.trim() !== '');
    if (!hasValidSteps) {
      Alert.alert('Error', 'Please add at least one cooking step');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const formData = new FormData();
      
      // Add recipe image (optional)
      if (recipeImage) {
        formData.append('image', {
          uri: recipeImage.uri,
          name: 'recipe_image.jpg',
          type: 'image/jpeg'
        });
      }

      // Add ingredient images (optional)
      ingredientImages.forEach((img, index) => {
        if (img) {
          formData.append('ingredients_images', {
            uri: img.uri,
            name: `ingredient_image_${index}.jpg`,
            type: 'image/jpeg'
          });
        }
      });

      // Prepare recipe data
      const recipeData = {
        name_recipe: recipeName,
        type: recipeType,
        summary: recipeSummary,
        status: 'public', // Default status
        ingredients: ingredients.filter(ing => ing.name_ingredient && ing.quantity),
        steps: steps.filter(step => step.content.trim() !== ''),
        nutrition: nutrition, // Send even if values are null
        vitamins: [vitamins[0]] // Send the first set of vitamins
      };

      formData.append('recipe_data', JSON.stringify(recipeData));

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/recipe/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      Alert.alert('Success', 'Recipe added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting recipe:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add recipe');
    }
  };

  const renderIngredientInputs = () => {
    return ingredients.map((ingredient, index) => (
      <View key={index} style={styles.ingredientRow}>
        <TextInput
          style={styles.ingredientInput}
          placeholder="Ingredient Name"
          value={ingredient.name_ingredient}
          onChangeText={(text) => {
            const newIngredients = [...ingredients];
            newIngredients[index].name_ingredient = text;
            setIngredients(newIngredients);
          }}
        />
        <TextInput
          style={styles.quantityInput}
          placeholder="Qty"
          value={ingredient.quantity}
          keyboardType="numeric"
          onChangeText={(text) => {
            const newIngredients = [...ingredients];
            newIngredients[index].quantity = text;
            setIngredients(newIngredients);
          }}
        />
        <TextInput
          style={styles.unitInput}
          placeholder="Unit"
          value={ingredient.unit}
          onChangeText={(text) => {
            const newIngredients = [...ingredients];
            newIngredients[index].unit = text;
            setIngredients(newIngredients);
          }}
        />
        <TouchableOpacity onPress={() => pickIngredientImage(index)}>
        {ingredientImages[index] ? (
          <Image
            source={{ uri: ingredientImages[index].uri }}
            style={{ width: 50, height: 50, borderRadius: 5, marginRight: 8 }}
          />
        ) : (
          <Ionicons name="camera" size={24} color="#ee4d2d" />
        )}
      </TouchableOpacity>
        <TouchableOpacity onPress={() => removeIngredient(index)}>
            <Ionicons name="trash" size={24} color="#ee4d2d" />
        </TouchableOpacity>
      </View>
    ));
  };

  const renderStepInputs = () => {
    return steps.map((step, index) => (
      <View key={index} style={styles.stepRow}>
        <Text style={styles.stepNumber}>Step {index + 1}</Text>
        <TextInput
          style={styles.stepInput}
          placeholder="Step description"
          multiline
          value={step.content}
          onChangeText={(text) => {
            const newSteps = [...steps];
            newSteps[index].content = text;
            newSteps[index].step_number = index + 1;
            setSteps(newSteps);
          }}
        />
        <TouchableOpacity onPress={() => removeStep(index)}>
            <Ionicons name="trash" size={24} color="#ee4d2d" />
        </TouchableOpacity>
      </View>
    ));
  };

  // Render the rest of the component remains the same as in the original code
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
        <Text style={styles.headerTitle}>Add Recipe</Text>
      </View>
      <ScrollView>
        <View style={styles.formContainer}>
          {/* Recipe Image */}
          <TouchableOpacity onPress={pickRecipeImage} style={styles.imagePicker}>
            {recipeImage ? (
              <Image source={{ uri: recipeImage.uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={48} color="#ee4d2d" />
                <Text>Add Recipe Image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Basic Recipe Info */}
          <TextInput
            style={styles.input}
            placeholder="Recipe Name"
            value={recipeName}
            onChangeText={setRecipeName}
          />
          <TextInput
            style={styles.input}
            placeholder="Recipe Type"
            value={recipeType}
            onChangeText={setRecipeType}
          />
          <TextInput
            style={styles.multilineInput}
            placeholder="Recipe Summary"
            multiline
            value={recipeSummary}
            onChangeText={setRecipeSummary}
          />

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {renderIngredientInputs()}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIngredients([...ingredients, { name_ingredient: '', quantity: '', unit: '' }])}
          >
            <Text style={styles.addButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>

          {/* Steps */}
          <Text style={styles.sectionTitle}>Cooking Steps</Text>
          {renderStepInputs()}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setSteps([...steps, { step_number: steps.length + 1, content: '' }])}
          >
            <Text style={styles.addButtonText}>+ Add Step</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={submitRecipe}>
            <Text style={styles.submitButtonText}>Submit Recipe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  formContainer: {
    padding: 16,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#ee4d2d',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginRight: 4,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginRight: 4,
  },
  unitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginRight: 4,
  },
  stepRow: {
    marginBottom: 16,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
  },
  addButton: {
    backgroundColor: '#ee4d2d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#ee4d2d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddRecipeContributionScreen;