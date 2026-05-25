import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Progress from 'react-native-progress';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

const calcPct = (intake, goal) => {
  if (!goal || goal === 0) return 0;
  return clamp((intake / goal) * 100);
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 55,
  });

  const [intakes, setIntakes] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [recommendedMeals, setRecommendedMeals] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);

  // ── Fetch data every time screen comes into focus ──────────────────────────
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) { setLoading(false); return; }
          const headers = { Authorization: `Bearer ${token}` };

          const [userRes, goalsRes, logRes, mealPlanRes, topRatedRes] = await Promise.all([
            fetch(`${API_URL}/api/user/info`, { headers }),
            fetch(`${API_URL}/api/nutrition-user/calories`, { headers }),
            fetch(`${API_URL}/api/nutrition-log/today`, { headers }),
            fetch(`${API_URL}/api/detect/daily-meal-plan`, { headers }),
            fetch(`${API_URL}/api/recipe/top-rated`, { headers }),
          ]);

          if (userRes.ok) {
            const u = await userRes.json();
            setUsername(u.username || '');
          }

          if (goalsRes.ok) {
            const g = await goalsRes.json();
            setGoals({
              calories: g.calories_goal || 2000,
              protein: g.protein_goal || 150,
              carbs: g.carbohydrate_goal || 250,
              fat: g.fat_goal || 55,
            });
          }

          if (logRes.ok) {
            const l = await logRes.json();
            setIntakes({
              calories: l.calories_intake || 0,
              protein: l.protein_intake || 0,
              carbs: l.carb_intake || 0,
              fat: l.fat_intake || 0,
            });
          }

          if (mealPlanRes.ok) {
            const m = await mealPlanRes.json();
            if (m.daily_meal_plan) {
              setRecommendedMeals([
                { ...m.daily_meal_plan.breakfast, type_label: 'Breakfast' },
                { ...m.daily_meal_plan.lunch, type_label: 'Lunch' },
                { ...m.daily_meal_plan.dinner, type_label: 'Dinner' }
              ]);
            }
          }

          if (topRatedRes.ok) {
            const t = await topRatedRes.json();
            if (t.recommendations) {
              setTopRecipes(t.recommendations);
            }
          }
        } catch (err) {
          console.error('HomeScreen fetch error:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [API_URL])
  );

  // ── Derived percentages ────────────────────────────────────────────────────
  const caloriesPct = calcPct(intakes.calories, goals.calories);
  const proteinPct = calcPct(intakes.protein, goals.protein);
  const carbsPct = calcPct(intakes.carbs, goals.carbs);
  const fatPct = calcPct(intakes.fat, goals.fat);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image source={require('../../assets/Food.png')} style={styles.profileImage} />
            <Text style={styles.welcomeText}>
              Welcome{username ? `, ${username}` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Nutrition Card */}
        <View style={styles.nutritionCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
            </View>
          ) : (
            <>
              {/* Circle Progress */}
              <View style={styles.circleProgressContainer}>
                <Progress.Circle
                  size={150}
                  progress={caloriesPct / 100}
                  thickness={10}
                  color="#A5D6A7"
                  unfilledColor="rgba(255,255,255,0.25)"
                  borderWidth={0}
                  showsText={false}
                  animated
                >
                  <View style={styles.circleInner}>
                    <Text style={styles.caloriesText}>{Math.round(intakes.calories)} kcal</Text>
                    <Text style={styles.targetText}>/{Math.round(goals.calories)} kcal</Text>
                    <Text style={styles.caloriesPctText}>{caloriesPct}%</Text>
                  </View>
                </Progress.Circle>
              </View>

              {/* Macro bars */}
              <View style={styles.macrosContainer}>
                {/* Protein */}
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { backgroundColor: '#FFC107', width: `${proteinPct}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.macroValue}>
                    {Math.round(intakes.protein)}g
                  </Text>
                  <Text style={styles.macroPct}>{proteinPct}%</Text>
                </View>

                {/* Carbs */}
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { backgroundColor: '#FFB6C1', width: `${carbsPct}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.macroValue}>
                    {Math.round(intakes.carbs)}g
                  </Text>
                  <Text style={styles.macroPct}>{carbsPct}%</Text>
                </View>

                {/* Fat */}
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { backgroundColor: '#A5D6A7', width: `${fatPct}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.macroValue}>
                    {Math.round(intakes.fat)}g
                  </Text>
                  <Text style={styles.macroPct}>{fatPct}%</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Recommended Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Meals</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {recommendedMeals.map((meal, index) => (
            <View key={`meal-${index}`} style={styles.mealCard}>
              <Image
                source={meal.image ? { uri: `${API_URL}/api/file/get-file/recipes/${meal.image}` } : require('../../assets/Food.png')}
                style={styles.mealImage}
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealTitle} numberOfLines={1}>{meal.recipe_name}</Text>
                <View style={styles.mealDetails}>
                  <Text style={styles.mealCalories}>{Math.round(meal.calories)} kcal</Text>
                  <Text style={styles.mealType}>{meal.type_label}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Suggested Recipes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Recipes</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {topRecipes.map((recipe, index) => (
            <View key={`recipe-${index}`} style={styles.recipeCard}>
              <View style={styles.recipeImageContainer}>
                <Image
                  source={recipe.image ? { uri: `${API_URL}/api/file/get-file/recipes/${recipe.image}` } : require('../../assets/Food.png')}
                  style={styles.recipeImage}
                />
                <TouchableOpacity style={styles.heartBtn}>
                  <Ionicons name="heart-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.recipeInfo}>
                <View style={styles.tagsContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{recipe.type ? recipe.type.toUpperCase() : 'RECIPE'}</Text>
                  </View>
                  <View style={[styles.tag, styles.tagOrange]}>
                    <Text style={[styles.tagText, styles.tagTextOrange]}>★ {recipe.avg_rating}</Text>
                  </View>
                </View>
                <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.name_recipe}</Text>
                <View style={styles.recipeDetails}>
                  <Ionicons name="flame-outline" size={14} color="#9ca3af" />
                  <Text style={styles.recipeCaloriesText}>{Math.round(recipe.calories)} kcal</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { paddingBottom: 50 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd' },
  welcomeText: { marginLeft: 12, fontSize: 16, fontWeight: 'bold', color: '#333' },
  notificationBtn: { padding: 5 },

  // Nutrition Card
  nutritionCard: {
    backgroundColor: '#3F805A',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 25,
    marginTop: 10,
    shadowColor: '#3F805A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  loadingBox: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Circle
  circleProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  targetText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  caloriesPctText: {
    color: '#A5D6A7',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },

  // Macros
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 6,
  },
  macroBarBg: {
    width: '85%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValue: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  macroPct: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 2,
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  seeAllText: { fontSize: 14, color: '#3F805A', fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20 },

  // Meal Card
  mealCard: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  mealImage: { width: '100%', height: 120, resizeMode: 'cover' },
  mealInfo: { padding: 15 },
  mealTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCalories: { fontSize: 14, color: '#9ca3af' },
  mealType: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },

  // Recipe Card
  recipeCard: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImageContainer: { position: 'relative' },
  recipeImage: { width: '100%', height: 140, resizeMode: 'cover' },
  heartBtn: { position: 'absolute', top: 10, right: 10, padding: 8 },
  recipeInfo: { padding: 15 },
  tagsContainer: { flexDirection: 'row', marginBottom: 8 },
  tag: {
    backgroundColor: '#E5F3EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: { color: '#3F805A', fontSize: 10, fontWeight: 'bold' },
  tagOrange: { backgroundColor: '#FEF3C7' },
  tagTextOrange: { color: '#F59E0B' },
  recipeTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  recipeDetails: { flexDirection: 'row', alignItems: 'center' },
  recipeTime: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  recipeCaloriesText: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
});
