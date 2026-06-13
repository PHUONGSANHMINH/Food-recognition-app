import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

const calcPct = (intake, goal) => {
  if (!goal || goal === 0) return 0;
  return clamp((intake / goal) * 100);
};

const getAvatarUri = (imagePath, API_URL) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}/api/file/get-file/${imagePath}`;
};

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width * 0.85;
const SLIDE_SPACING = 10;

const PROMO_SLIDES = [
  { id: '1', image: require('../../assets/slide 1.png') },
  { id: '2', image: require('../../assets/slide 2.png') },
  { id: '3', image: require('../../assets/slide 3.png') },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = React.useRef(null);

  // ── Animation Scroll ───────────────────────────────────────────────────────
  const scrollX = React.useRef(new Animated.Value(0)).current;

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || PROMO_SLIDES.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentSlideIndex + 1) % PROMO_SLIDES.length;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * (SLIDE_WIDTH + SLIDE_SPACING),
        animated: true,
      });
      setCurrentSlideIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSlideIndex, loading]);

  // ── Fetch data every time screen comes into focus ──────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) { setLoading(false); return; }
      const headers = { Authorization: `Bearer ${token}` };

      console.log('Fetching Home data individually...');

      // User Info
      fetch(`${API_URL}/api/user/info`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(u => {
          if (u) {
            setUsername(u.username || '');
            setAvatar(u.avatar_image || null);
          }
        }).catch(e => console.log('User Info error:', e));

      // Goals
      fetch(`${API_URL}/api/nutrition-user/calories`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(g => {
          if (g) {
            setGoals({
              calories: g.calories_goal || 2000,
              protein: g.protein_goal || 150,
              carbs: g.carbohydrate_goal || 250,
              fat: g.fat_goal || 55,
            });
          }
        }).catch(e => console.log('Goals error:', e));

      // Log
      fetch(`${API_URL}/api/nutrition-log/today`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(l => {
          if (l) {
            setIntakes({
              calories: l.calories_intake || 0,
              protein: l.protein_intake || 0,
              carbs: l.carb_intake || 0,
              fat: l.fat_intake || 0,
            });
          }
        }).catch(e => console.log('Log error:', e));

      // Meal Plan
      fetch(`${API_URL}/api/detect/daily-meal-plan`, { headers })
        .then(async res => {
          console.log('Meal plan status:', res.status);
          if (res.ok) {
            const m = await res.json();
            console.log('Meal plan data:', m);
            if (m.daily_meal_plan) {
              setRecommendedMeals([
                { ...m.daily_meal_plan.breakfast, type_label: 'Breakfast' },
                { ...m.daily_meal_plan.lunch, type_label: 'Lunch' },
                { ...m.daily_meal_plan.dinner, type_label: 'Dinner' }
              ]);
            }
          } else {
            const txt = await res.text();
            console.log('Meal plan error:', txt);
          }
        }).catch(e => console.log('Meal Plan fetch error:', e));

      // Top Rated
      fetch(`${API_URL}/api/recipe/top-rated`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(t => {
          if (t && t.recommendations) {
            setTopRecipes(t.recommendations);
          }
        }).catch(e => console.log('Top Rated error:', e));

    } catch (err) {
      console.error('HomeScreen fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived percentages ────────────────────────────────────────────────────
  const caloriesPct = calcPct(intakes.calories, goals.calories);
  const proteinPct = calcPct(intakes.protein, goals.protein);
  const carbsPct = calcPct(intakes.carbs, goals.carbs);
  const fatPct = calcPct(intakes.fat, goals.fat);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#3F805A']} />
        }
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            {avatar ? (
              <Image source={{ uri: getAvatarUri(avatar, API_URL) }} style={styles.profileImage} />
            ) : (
              <Image source={require('../../assets/Food.png')} style={styles.profileImage} />
            )}
            <Text style={styles.welcomeText}>
              Welcome{username ? `, ${username}` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Nutrition Card */}
        <LinearGradient
          colors={['#0acb54ff', '#00901fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nutritionCard}
        >
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
                <Image
                  source={require('../../assets/Exclude.png')}
                  style={styles.excludeIcon}
                />
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
        </LinearGradient>

        {/* Promo Slider */}
        <View style={styles.sliderContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={PROMO_SLIDES}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false}
            snapToAlignment="center"
            decelerationRate="fast"
            snapToInterval={SLIDE_WIDTH + SLIDE_SPACING}
            contentContainerStyle={styles.sliderContent}
            keyExtractor={(item) => item.id}
            getItemLayout={(_, index) => ({
              length: SLIDE_WIDTH + SLIDE_SPACING,
              offset: index * (SLIDE_WIDTH + SLIDE_SPACING),
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (SLIDE_WIDTH + SLIDE_SPACING));
              if (newIndex !== currentSlideIndex) {
                setCurrentSlideIndex(newIndex);
              }
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * (SLIDE_WIDTH + SLIDE_SPACING),
                index * (SLIDE_WIDTH + SLIDE_SPACING),
                (index + 1) * (SLIDE_WIDTH + SLIDE_SPACING),
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.9, 1, 0.9],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.7, 1, 0.7],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View style={[styles.slideCard, { transform: [{ scale }], opacity }]}>
                  <TouchableOpacity activeOpacity={0.9}>
                    <Image source={item.image} style={styles.slideImage} />
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />
        </View>

        {/* Recommended Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Meals</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {recommendedMeals.map((meal, index) => (
            <TouchableOpacity
              key={`meal-${index}`}
              style={styles.mealCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('RecipeDetailScreen', {
                recipe: {
                  id_recipe: meal.id_recipe,
                  name_recipe: meal.recipe_name,
                  image: meal.image,
                  calories: meal.calories,
                }
              })}
            >
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
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Suggested Recipes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Recipes</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {topRecipes.map((recipe, index) => (
            <TouchableOpacity
              key={`recipe-${index}`}
              style={styles.recipeCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('RecipeDetailScreen', { recipe })}
            >
              <View style={styles.recipeImageContainer}>
                <Image
                  source={recipe.image ? { uri: `${API_URL}/api/file/get-file/recipes/${recipe.image}` } : require('../../assets/Food.png')}
                  style={styles.recipeImage}
                />
                <TouchableOpacity style={styles.heartBtn} onPress={(e) => e.stopPropagation()}>
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
            </TouchableOpacity>
          ))}

          {/* See more card */}
          {topRecipes.length > 0 && (
            <TouchableOpacity
              style={styles.seeMoreCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Recipes')}
            >
              <View style={styles.seeMoreCircle}>
                <Ionicons name="arrow-forward" size={30} color="#3F805A" />
              </View>
              <Text style={styles.seeMoreText}>See all</Text>
            </TouchableOpacity>
          )}
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
  scrollContent: { paddingBottom: 110 },

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
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 25,
    marginTop: 10,
    shadowColor: '#1F914B',
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
    position: 'relative',
  },
  excludeIcon: {
    marginBottom: 40,
    position: 'absolute',
    width: 70,
    height: 70,
    resizeMode: 'contain',
    zIndex: 10,
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
    marginTop: 5,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  seeAllText: { fontSize: 14, color: '#3F805A', fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20 },
  horizontalScrollContent: { paddingRight: 20, paddingBottom: 15, paddingTop: 5 },

  // Meal Card
  mealCard: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  mealImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  recipeImageContainer: { position: 'relative' },
  recipeImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
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
  seeMoreCard: {
    width: 100,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  seeMoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5F3EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3F805A',
  },

  // Promo Slider Styles
  sliderContainer: {
    height: 200,
    marginTop: 20,
    marginBottom: 5,
  },
  sliderContent: {
    paddingHorizontal: (width - SLIDE_WIDTH) / 2,
  },
  slideCard: {
    width: SLIDE_WIDTH,
    height: 180,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginRight: SLIDE_SPACING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
