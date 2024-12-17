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
  Alert,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const AddRecipeContributionScreen = () => {
  const navigation = useNavigation();
  const [isRecipeTypeModalVisible, setIsRecipeTypeModalVisible] = useState(false);
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [showVitaminForm, setShowVitaminForm] = useState(false);
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
      aspect: [9, 6],
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
      aspect: [9, 6],
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

    // Remove the corresponding ingredient image
    const updatedIngredientImages = [...ingredientImages];
    updatedIngredientImages.splice(index, 1);
    setIngredientImages(updatedIngredientImages);
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
        status: 'Pending', // Default status
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
      <View key={index} style={styles.ingredientContainer}>
        <View style={styles.ingredientHeader}>
          <Text style={styles.ingredientNumber}>Ingredient #{index + 1}</Text>
          <TouchableOpacity
            onPress={() => removeIngredient(index)}
            style={styles.deleteIngredientButton}
          >
            <Ionicons name="trash-outline" size={24} color="#ee4d2d" />
          </TouchableOpacity>
        </View>
        <View style={styles.ingredientDetailsRow}>
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
        </View>
        <View style={styles.ingredientActionRow}>
          <TouchableOpacity
            onPress={() => pickIngredientImage(index)}
            style={styles.ingredientImagePicker}
          >
            {ingredientImages[index] ? (
              <Image
                source={{ uri: ingredientImages[index].uri }}
                style={styles.ingredientImagePreview}
              />
            ) : (
              <View style={styles.ingredientImagePlaceholder}>
                <Ionicons name="camera" size={32} color="#ee4d2d" />
                <Text style={styles.ingredientImageText}>Add Ingredient Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderStepInputs = () => {
    return steps.map((step, index) => (
      <View key={index} style={styles.stepRow}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepNumber}>Step {index + 1}</Text>
          <TouchableOpacity
            onPress={() => removeStep(index)}
            style={styles.deleteStepButton}
          >
            <Ionicons name="trash" size={24} color="#ee4d2d" />
          </TouchableOpacity>
        </View>
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
          {/* Tạo TouchableOpacity thay thế Picker trực tiếp */}
      <TouchableOpacity 
        style={[styles.input, styles.pickerContainer]}
        onPress={() => setIsRecipeTypeModalVisible(true)}
      >
        <Text style={styles.selectedValueText}>
          {recipeType ? recipeType.charAt(0).toUpperCase() + recipeType.slice(1) : 'Select Recipe Type'}
        </Text>
      </TouchableOpacity>

      {/* Modal chứa Picker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRecipeTypeModalVisible}
        onRequestClose={() => setIsRecipeTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Recipe Type</Text>
            <Picker
              selectedValue={recipeType}
              onValueChange={(itemValue) => {
                setRecipeType(itemValue);
                setIsRecipeTypeModalVisible(false);
              }}
              style={styles.pickerStyle}
            >
              <Picker.Item label="Breakfast" value="breakfast" />
              <Picker.Item label="Lunch" value="lunch" />
              <Picker.Item label="Dinner" value="dinner" />
            </Picker>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsRecipeTypeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
          <View style={styles.nutritionSection}>
            <TouchableOpacity
              style={styles.nutritionHeader}
              onPress={() => setShowNutritionForm(!showNutritionForm)}
            >
              <Text style={styles.sectionTitle}>Nutrition Information</Text>
              <Ionicons
                name={showNutritionForm ? "chevron-up" : "chevron-down"}
                size={24}
                color="#ee4d2d"
              />
            </TouchableOpacity>

            {showNutritionForm && (
              <View style={styles.nutritionForm}>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Calories (kcal)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.calories?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        calories: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.fat?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        fat: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Saturated Fat (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.saturated_fat?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        saturated_fat: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Carbohydrates (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.carbohydrates?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        carbohydrates: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Sugar (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.sugar?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        sugar: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Cholesterol (mg)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.cholesterol?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        cholesterol: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Sodium (mg)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.sodium?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        sodium: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.protein?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        protein: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>

                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Alcohol (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={nutrition.alcohol?.toString()}
                    onChangeText={(text) => {
                      setNutrition({
                        ...nutrition,
                        alcohol: text ? parseFloat(text) : null
                      });
                    }}
                  />
                </View>
              </View>
            )}
          </View>
          <View style={styles.vitaminSection}>
            <TouchableOpacity
              style={styles.vitaminHeader}
              onPress={() => setShowVitaminForm(!showVitaminForm)}
            >
              <Text style={styles.sectionTitle}>Vitamin Information</Text>
              <Ionicons
                name={showVitaminForm ? "chevron-up" : "chevron-down"}
                size={24}
                color="#ee4d2d"
              />
            </TouchableOpacity>

            {showVitaminForm && (
              <View style={styles.vitaminForm}>
                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Calcium (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].calcium?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        calcium: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Iron (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].iron?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        iron: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin A (IU)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_a?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_a: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin C (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_c?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_c: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin D (IU)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_d?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_d: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin E (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_e?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_e: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin K (mcg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_k?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_k: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin B1 (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_b1?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_b1: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin B2 (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_b2?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_b2: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin B3 (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_b3?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_b3: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin B5 (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_b5?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_b5: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin B6 (mg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_b6?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_b6: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Vitamin B12 (mcg)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].vitamin_b12?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        vitamin_b12: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>

                <View style={styles.vitaminRow}>
                  <Text style={styles.vitaminLabel}>Fiber (g)</Text>
                  <TextInput
                    style={styles.vitaminInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={vitamins[0].fiber?.toString()}
                    onChangeText={(text) => {
                      setVitamins([{
                        ...vitamins[0],
                        fiber: text ? parseFloat(text) : null
                      }]);
                    }}
                  />
                </View>
              </View>
            )}
          </View>

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '90%',
    height: 250,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ee4d2d',
  },
  imagePlaceholder: {
    width: '90%',
    height: 250,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ee4d2d',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    marginRight: 4,
    borderRadius: 6,
    height: 40,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    marginRight: 4,
    borderRadius: 6,
  },
  unitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    marginRight: 4,
    borderRadius: 6,
  },
  ingredientContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientDetailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ingredientActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientHeader: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  ingredientNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  ingredientImagePicker: {
    flex: 1,
    marginRight: 10,
  },
  ingredientImagePlaceholder: {
    width: '100%',
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ee4d2d',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
  },
  ingredientImageText: {
    marginTop: 8,
    color: '#ee4d2d',
  },
  ingredientImagePreview: {
    width: '100%',
    height: 100,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ee4d2d',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  deleteIngredientButton: {
    backgroundColor: '#fff0f0',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepRow: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ee4d2d',
  },
  stepInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    borderRadius: 6,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  deleteStepButton: {
    backgroundColor: '#fff0f0',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vitaminSection: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vitaminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vitaminForm: {
    marginTop: 16,
  },
  vitaminRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitaminLabel: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  vitaminInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    borderRadius: 6,
    textAlign: 'right',
  },
  nutritionSection: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionForm: {
    marginTop: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionLabel: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  nutritionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    borderRadius: 6,
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: '#ee4d2d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#ee4d2d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  pickerStyle: {
    height: 55,
    width: '100%',
    color: 'orange',
  },
  pickerContainer: {
    justifyContent: 'center',
  },
  selectedValueText: {
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  pickerStyle: {
    width: '100%',
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default AddRecipeContributionScreen;