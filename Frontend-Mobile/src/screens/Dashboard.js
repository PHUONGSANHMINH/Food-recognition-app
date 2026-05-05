import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = {
  async fetchDailyMealPlan() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/detect/daily-meal-plan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.daily_meal_plan;
    } catch (error) {
      console.error('Error fetching daily meal plan:', error);
      throw error;
    }
  },
};

const RecipeList = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMealPlan, setCurrentMealPlan] = useState(null);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [error, setError] = useState(null);

  const loadWeeklyMealPlan = async () => {
    try {
      setLoading(true);

      // Tính ngày hôm nay
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Tính số ngày chênh lệch để lùi về Thứ Hai
      const diffToMonday = dayOfWeek === 0 ? -6 : 2 - dayOfWeek;

      // Tính ngày bắt đầu tuần (Thứ Hai gần nhất)
      const startOfWeek = new Date(today.getTime());
      startOfWeek.setDate(today.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00

      // Log kiểm tra
      // console.log("Ngày bắt đầu tuần (Thứ Hai):", startOfWeek);

      // Lưu trữ theo tuần
      const storageKey = `weeklyMealPlan_${startOfWeek.toISOString().split('T')[0]}`;
      const storedWeeklyData = await AsyncStorage.getItem(storageKey);

      // Lấy thông tin tuần hiện tại
      const storedStartOfWeek = storedWeeklyData ? JSON.parse(storedWeeklyData).startOfWeek : null;
      const currentStartOfWeek = startOfWeek.toISOString().split('T')[0];

      // Xóa dữ liệu tuần cũ nếu cần
      if (!storedWeeklyData || storedStartOfWeek !== currentStartOfWeek) {
        await AsyncStorage.removeItem(storageKey); // Xóa dữ liệu tuần cũ nếu có
      }

      // Chuẩn bị dữ liệu tuần mới
      let weeklyData = storedWeeklyData ? JSON.parse(storedWeeklyData) : {};

      if (Object.keys(weeklyData).length < 7) {
        for (let i = 0; i <= 7; i++) { // Bắt đầu từ 1 để bỏ qua ngày hôm nay
          const currentDate = new Date(startOfWeek.getTime());
          currentDate.setDate(startOfWeek.getDate() + i);
          const dateString = currentDate.toISOString().split('T')[0];

          if (!weeklyData[dateString]) {
            const dailyMealPlan = await api.fetchDailyMealPlan(targetCalories);
            weeklyData[dateString] = dailyMealPlan;
          }
        }

        // Lưu lại dữ liệu tuần
        // console.log("Dữ liệu tuần:", weeklyData);
        await AsyncStorage.setItem(storageKey, JSON.stringify(weeklyData));
      }

      // Cập nhật state
      setWeeklyMeals(weeklyData);

      // Set meal plan cho ngày hôm nay
      const todayString = today.toISOString().split('T')[0];
      setCurrentMealPlan(weeklyData[todayString]);
      setSelectedDate(todayString);

    } catch (err) {
      setError('Cannot load weekly meal plan. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadWeeklyMealPlan();
  }, []);

  const handleDayPress = (day) => {
    const selectedMealPlan = weeklyMeals[day.dateString];
    setSelectedDate(day.dateString);
    setCurrentMealPlan(selectedMealPlan);
  };

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  const handleContributionPress = () => {
    navigation.navigate('Contribution');
  };

  const handleFavouritesPress = () => {
    navigation.navigate('Favourites');
  };

  const handleListRecipesPress = () => {
    navigation.navigate('ListRecipes');
  };

  const handleUserInfoPress = () => {
    navigation.navigate('UserInfo');
  };

  const handleRecipePress = async (recipeId) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/recipe/${recipeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Navigate to the Recipe Detail screen and pass the recipe data
      navigation.navigate('RecipeDetail', { 
        recipeId: recipeId,
        recipeDetails: response.data 
      });
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      alert('Failed to fetch recipe details. Please try again.');
    }
  };
  
  const MealPlanItem = ({ item, mealType }) => (
    <TouchableOpacity onPress={() => handleRecipePress(item.recipe_id)}>
    <View style={styles.mealPlanContainer}>
      <View style={styles.recipeContainer}>
        {item.image && (
          <Image
            source={{
              uri: item.image
                ? `${process.env.EXPO_PUBLIC_DOMAIN}api/file/get-file/recipes/${item.image}`
                : null
            }}
            style={styles.mealImage}
            defaultSource={require('../assets/food-placeholder.png')}
          />
        )}
        <View style={styles.recipeContent}>
          <View style={styles.mealTypeHeader}>
            <Text style={styles.mealTypeText}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          </View>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.recipe_name}
          </Text>
          <View style={styles.nutritionDetailsEnhanced}>
            <View style={styles.nutritionColumn}>
              <Text style={styles.nutritionLabelText}>Calories</Text>
              <Text style={styles.nutritionValueText}>
                {Math.round(item.calories)} kcal
              </Text>
            </View>
            <View style={styles.nutritionColumn}>
              <Text style={styles.nutritionLabelText}>Protein</Text>
              <Text style={styles.nutritionValueText}>
                {Math.round(item.protein)}g
              </Text>
            </View>
            <View style={styles.nutritionColumn}>
              <Text style={styles.nutritionLabelText}>Carbs</Text>
              <Text style={styles.nutritionValueText}>
                {Math.round(item.carbohydrates)}g
              </Text>
            </View>
            <View style={styles.nutritionColumn}>
              <Text style={styles.nutritionLabelText}>Fat</Text>
              <Text style={styles.nutritionValueText}>
                {Math.round(item.fat)}g
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );

  const renderMealPlanItems = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
          <Text style={styles.loadingText}>Loading Meal Plan...</Text>
        </View>
      );
    }

    if (!currentMealPlan) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No meal plan available</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[
          { ...currentMealPlan.breakfast, mealType: 'breakfast' },
          { ...currentMealPlan.lunch, mealType: 'lunch' },
          { ...currentMealPlan.dinner, mealType: 'dinner' },
        ]}
        renderItem={({ item }) => (
          <MealPlanItem item={item} mealType={item.mealType} />
        )}
        keyExtractor={(item) => item.recipe_id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadWeeklyMealPlan}
            colors={['#ee4d2d']}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header />

      <View style={styles.flatListContainer}>
        <FlatList
          data={Array.from({ length: 7 }, (_, i) => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

            const currentDate = new Date(today);
            
            currentDate.setDate(today.getDate() + diffToMonday + i);
            return {
              date: currentDate.toISOString().split('T')[0],
              label: currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            };
          })}
          horizontal
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.flatListContentContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dayItem,
                selectedDate === item.date && styles.selectedDay,
              ]}
              onPress={() => handleDayPress({ dateString: item.date })}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === item.date && styles.selectedDayText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.mealPlanSummary}>
        <Text style={styles.mealPlanSummaryText}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })} Meal Plan
        </Text>
        {currentMealPlan && (
          <Text style={styles.mealPlanCaloriesText}>
            Total Calories: {Math.round(currentMealPlan.total_calories)} kcal
          </Text>
        )}
      </View>

      {renderMealPlanItems()}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.squareButton}
          onPress={handleContributionPress}
        >
          <Image
            source={require('../assets/star.png')}
            style={styles.squareButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton}
          onPress={handleListRecipesPress}
        >
          <Image
            source={require('../assets/blender.png')}
            style={styles.squareButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bounceButton} onPress={handleCameraPress}>
          <Image
            source={require('../assets/camera.png')}
            style={styles.cameraIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton}
          onPress={handleFavouritesPress}
        >
          <Image
            source={require('../assets/favourite.png')}
            style={styles.squareButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton}
          onPress={handleUserInfoPress}
        >
          <Image
            source={require('../assets/chef.png')}
            style={styles.squareButtonIcon}
          />
        </TouchableOpacity>
      </View>

    </View>
  );
};

const Header = ({ onSearch, onLogout }) => {

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          {/* <Image
            source={require('../assets/loupe.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm công thức..."
            value={searchText}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          /> */}
          <Text style={styles.title}>Food Recognition</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarContainer}
        >
          <Image
            source={require('../assets/chef.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  additionalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff', // Màu nền trắng cho menu
    borderTopWidth: 1,
    borderTopColor: '#eeeeee', // Đường viền trên
    elevation: 4, // Đổ bóng cho menu
  },

  squareButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 30, // Bo tròn hoàn toàn
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    transition: 'background-color 0.3s', // Hiệu ứng chuyển màu
  },

  squareButtonIcon: {
    width: 30,
    height: 30,
  },

  // Thêm hiệu ứng hover cho các nút (chỉ hoạt động trên web)
  squareButtonHover: {
    backgroundColor: '#ee4d2d', // Màu nền khi hover
  },

  bounceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7F32', // Màu nền cho nút chính
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    transform: [{ scale: 1 }],
    animation: 'bounceAnimation 1s infinite',
  },
  cameraIcon: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 40,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  recipeContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  recipeContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recipeSummary: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recipeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recipeType: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadge: {
    marginLeft: 8,
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 12,
    color: 'white',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  logoutContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    padding: 16,
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    overflow: 'hidden',
  },
  skeletonGradient: {
    flex: 1,
    width: '300%',
    opacity: 0.8,
  },

  // New styles for meal plan
  mealPlanContainer: {
    marginBottom: 12,
    marginHorizontal: 12,
    backgroundColor: '#ffffff', // Màu nền trắng
    borderRadius: 12, // Bo tròn các góc
    elevation: 4, // Bóng đổ cho item
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 16, // Thêm padding để tạo khoảng cách
  },
  mealTypeHeader: {
    flexDirection: 'row', // Đặt hướng của các phần tử con
    justifyContent: 'flex-end', // Đẩy nội dung sang bên phải
    alignItems: 'center', // Căn giữa theo chiều dọc
  },
  mealTypeText: {
    width: 90,
    color: 'white', // Màu chữ
    backgroundColor: 'green', // Màu nền của badge
    fontSize: 12, // Kích thước font
    fontWeight: 'bold', // Chữ đậm
    paddingVertical: 4, // Khoảng cách dọc bên trong badge
    paddingHorizontal: 8, // Khoảng cách ngang bên trong badge
    borderRadius: 12, // Bo tròn góc
    textAlign: 'center',
  },
  recipeContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 12, // Bo tròn hình ảnh
    marginRight: 12,
  },
  recipeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nutritionDetailsEnhanced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: '#f9f9f9', // Màu nền nhẹ cho chi tiết dinh dưỡng
    borderRadius: 8,
    padding: 8,
  },
  nutritionColumn: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionLabelText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  nutritionValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nutritionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  mealPlanSummary: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 0, // Xóa bất kỳ khoảng cách thừa nào
  },
  mealPlanSummaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mealPlanCaloriesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  flatListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dayItem: {
    width: 60,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50, // Đảm bảo mỗi item có kích thước tối thiểu
  },
  selectedDay: {
    backgroundColor: '#FF7F32', // Màu nền cam cho ngày được chọn
    borderRadius: 12,  // Tạo viền bo tròn cho ngày được chọn
  },
  dayText: {
    color: '#333',  // Màu chữ ngày mặc định
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#fff',  // Màu chữ trắng khi ngày được chọn
  },
  flatListContentContainer: {
    alignItems: 'center', // Canh giữa các item
  },
  mealImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  nutritionDetailsEnhanced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  nutritionColumn: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionLabelText: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
  },
  nutritionValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    color: '#ed5c01',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipeList;