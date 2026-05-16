import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image source={require('../../assets/Food.png')} style={styles.profileImage} />
            <Text style={styles.welcomeText}>Welcome, ABC</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Nutrition Card */}
        <View style={styles.nutritionCard}>
          <View style={styles.circleProgressContainer}>
            <View style={styles.circleProgress}>
              <Text style={styles.caloriesText}>1500 kcal</Text>
              <Text style={styles.targetText}>/2000 kcal</Text>
            </View>
          </View>

          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={styles.macroBarBg}><View style={[styles.macroBarFill, { backgroundColor: '#FFC107', width: '80%' }]} /></View>
              <Text style={styles.macroValue}>45g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={styles.macroBarBg}><View style={[styles.macroBarFill, { backgroundColor: '#FFB6C1', width: '60%' }]} /></View>
              <Text style={styles.macroValue}>10g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={styles.macroBarBg}><View style={[styles.macroBarFill, { backgroundColor: '#A5D6A7', width: '40%' }]} /></View>
              <Text style={styles.macroValue}>20g</Text>
            </View>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <View style={styles.mealCard}>
            <Image source={require('../../assets/Food.png')} style={styles.mealImage} />
            <View style={styles.mealInfo}>
              <Text style={styles.mealTitle}>Avocado Toast Bowl</Text>
              <View style={styles.mealDetails}>
                <Text style={styles.mealCalories}>420 kcal</Text>
                <Text style={styles.mealType}>Breakfast</Text>
              </View>
            </View>
          </View>
          <View style={styles.mealCard}>
            <Image source={require('../../assets/Food.png')} style={styles.mealImage} />
            <View style={styles.mealInfo}>
              <Text style={styles.mealTitle}>Avocado Toast Bowl</Text>
              <View style={styles.mealDetails}>
                <Text style={styles.mealCalories}>420 kcal</Text>
                <Text style={styles.mealType}>Lunch</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Suggested Recipes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Recipes</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <View style={styles.recipeCard}>
            <View style={styles.recipeImageContainer}>
              <Image source={require('../../assets/Food.png')} style={styles.recipeImage} />
              <TouchableOpacity style={styles.heartBtn}>
                <Ionicons name="heart-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.recipeInfo}>
              <View style={styles.tagsContainer}>
                <View style={styles.tag}><Text style={styles.tagText}>KETO</Text></View>
                <View style={[styles.tag, styles.tagOrange]}><Text style={[styles.tagText, styles.tagTextOrange]}>EASY</Text></View>
              </View>
              <Text style={styles.recipeTitle}>Lemon Herb Salmon</Text>
              <View style={styles.recipeDetails}>
                <Ionicons name="time-outline" size={14} color="#9ca3af" />
                <Text style={styles.recipeTime}>20 min</Text>
                <Ionicons name="flame-outline" size={14} color="#9ca3af" style={{marginLeft: 10}} />
                <Text style={styles.recipeCaloriesText}>340 kcal</Text>
              </View>
            </View>
          </View>
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd' },
  welcomeText: { marginLeft: 12, fontSize: 16, fontWeight: 'bold', color: '#333' },
  notificationBtn: { padding: 5 },
  nutritionCard: { backgroundColor: '#3F805A', marginHorizontal: 20, borderRadius: 25, padding: 25, marginTop: 10, shadowColor: '#3F805A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  circleProgressContainer: { alignItems: 'center', justifyContent: 'center', height: 160, marginBottom: 20 },
  circleProgress: { width: 140, height: 140, borderRadius: 70, borderWidth: 8, borderColor: 'white', borderTopColor: '#A5D6A7', borderRightColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center' },
  caloriesText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  targetText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  macrosContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroLabel: { color: 'white', fontSize: 12, marginBottom: 8 },
  macroBarBg: { width: '80%', height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 8 },
  macroBarFill: { height: '100%', borderRadius: 2 },
  macroValue: { color: 'white', fontSize: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  seeAllText: { fontSize: 14, color: '#3F805A', fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20 },
  mealCard: { width: 220, backgroundColor: 'white', borderRadius: 20, marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  mealImage: { width: '100%', height: 120, resizeMode: 'cover' },
  mealInfo: { padding: 15 },
  mealTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  mealDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealCalories: { fontSize: 14, color: '#9ca3af' },
  mealType: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },
  recipeCard: { width: 220, backgroundColor: 'white', borderRadius: 20, marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  recipeImageContainer: { position: 'relative' },
  recipeImage: { width: '100%', height: 140, resizeMode: 'cover' },
  heartBtn: { position: 'absolute', top: 10, right: 10, padding: 8 },
  recipeInfo: { padding: 15 },
  tagsContainer: { flexDirection: 'row', marginBottom: 8 },
  tag: { backgroundColor: '#E5F3EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  tagText: { color: '#3F805A', fontSize: 10, fontWeight: 'bold' },
  tagOrange: { backgroundColor: '#FEF3C7' },
  tagTextOrange: { color: '#F59E0B' },
  recipeTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  recipeDetails: { flexDirection: 'row', alignItems: 'center' },
  recipeTime: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  recipeCaloriesText: { fontSize: 12, color: '#9ca3af', marginLeft: 4 }
});
