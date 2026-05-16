import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecipesScreen() {
  const renderRecipeCard = (isFavorite) => (
    <View style={styles.recipeCard}>
      <View style={styles.recipeImageContainer}>
        <Image source={require('../../assets/Food.png')} style={styles.recipeImage} />
        <TouchableOpacity style={styles.heartBtn}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#EF4444" : "white"} />
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require('../../assets/Food.png')} style={styles.profileImage} />
        <Text style={styles.headerTitle}>Recipes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#3F805A" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <Text style={styles.sectionTitle}>Recommender for you</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {renderRecipeCard(false)}
          {renderRecipeCard(false)}
        </ScrollView>

        <Text style={styles.sectionTitle}>Your favorites</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {renderRecipeCard(true)}
          {renderRecipeCard(true)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAECEE',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  horizontalScroll: {
    paddingLeft: 20,
    marginBottom: 25,
  },
  recipeCard: {
    width: 240,
    backgroundColor: 'white',
    borderRadius: 25,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recipeImageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  recipeInfo: {
    padding: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#E5F3EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    color: '#3F805A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tagOrange: {
    backgroundColor: '#FEF3C7',
  },
  tagTextOrange: {
    color: '#F59E0B',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeTime: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
  },
  recipeCaloriesText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
  }
});
