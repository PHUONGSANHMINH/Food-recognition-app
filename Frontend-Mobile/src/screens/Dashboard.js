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
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const [hasCalorieGoal, setHasCalorieGoal] = useState(true);

  // States for Calorie Goal Popup
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [calorieTab, setCalorieTab] = useState('manual'); // 'manual' or 'calculate'
  const [targetCaloriesInput, setTargetCaloriesInput] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male'); // 'male' or 'female'

  useEffect(() => {
    const checkNewUser = async () => {
      try {
        const isNew = await AsyncStorage.getItem('isNewlyRegistered');
        if (isNew === 'true') {
          setShowCalorieModal(true);
          await AsyncStorage.removeItem('isNewlyRegistered');
        }
      } catch (e) {
        console.error('Failed to check isNewlyRegistered flag', e);
      }
    };
    checkNewUser();
  }, []);

  const handleCalculateCalories = () => {
    if (!weight || !height || !age) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ cân nặng, chiều cao và tuổi.');
      return;
    }
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (isNaN(w) || isNaN(h) || isNaN(a)) {
      Alert.alert('Lỗi', 'Thông số không hợp lệ.');
      return;
    }

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // TDEE = BMR * 1.2 (Ít vận động)
    const tdee = bmr * 1.2;

    // Giảm 500 calo để giảm cân
    const suggestedCalories = Math.round(tdee - 500);
    const minCalories = gender === 'male' ? 1500 : 1200;
    const finalCalories = suggestedCalories < minCalories ? minCalories : suggestedCalories;

    setTargetCaloriesInput(finalCalories.toString());
    Alert.alert('Đề xuất', `Mục tiêu Calo đề xuất để giảm cân của bạn là ${finalCalories} kcal/ngày.`);
  };

  const handleSaveCalorieGoal = async () => {
    if (!targetCaloriesInput) {
      Alert.alert('Lỗi', 'Vui lòng nhập mục tiêu Calo.');
      return;
    }

    const calories = parseInt(targetCaloriesInput);
    if (isNaN(calories) || calories <= 0) {
      Alert.alert('Lỗi', 'Mục tiêu Calo không hợp lệ.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.post(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/nutrition-user/update`,
        { calories_goal: calories },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTargetCalories(calories);
      setShowCalorieModal(false);
      Alert.alert('Thành công', 'Đã lưu mục tiêu Calo của bạn.');

      // Xóa cache meal plan và tải lại
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(today.getTime());
      startOfWeek.setDate(today.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      const storageKey = `weeklyMealPlan_${startOfWeek.toISOString().split('T')[0]}`;
      await AsyncStorage.removeItem(storageKey);

      loadWeeklyMealPlan();
    } catch (error) {
      console.error('Error saving calorie goal:', error);
      Alert.alert('Lỗi', 'Không thể lưu mục tiêu Calo.');
    }
  };

  const loadWeeklyMealPlan = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      try {
        const goalResponse = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/nutrition-user/calories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTargetCalories(goalResponse.data.calories_goal);
        setHasCalorieGoal(true);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setHasCalorieGoal(false);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

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
      let parsedData = storedWeeklyData ? JSON.parse(storedWeeklyData) : {};
      const storedStartOfWeek = parsedData.startOfWeek || null;
      const currentStartOfWeek = startOfWeek.toISOString().split('T')[0];

      // Kiểm tra tính hợp lệ của cache
      let isCacheValid = true;
      if (!storedWeeklyData || storedStartOfWeek !== currentStartOfWeek) {
        isCacheValid = false;
      }

      // Nếu mục tiêu calo trên backend khác với cache, thì cache bị lỗi thời
      if (parsedData.targetCalories && parsedData.targetCalories !== goalResponse.data.calories_goal) {
        isCacheValid = false;
      }

      // Xóa dữ liệu tuần cũ nếu cần
      if (!isCacheValid) {
        await AsyncStorage.removeItem(storageKey); // Xóa dữ liệu cũ
        parsedData = {};
      }

      // Chuẩn bị dữ liệu tuần mới
      let weeklyData = parsedData;

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
        weeklyData.startOfWeek = currentStartOfWeek;
        weeklyData.targetCalories = goalResponse.data.calories_goal;
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


  useFocusEffect(
    useCallback(() => {
      loadWeeklyMealPlan();
    }, [])
  );

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

      {hasCalorieGoal ? (
        <>
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
        </>
      ) : (
        <View style={[styles.errorContainer, { flex: 1 }]}>
          <Text style={[styles.errorText, { fontSize: 18 }]}>Vui lòng chọn số calo bạn ở phần cài đặt</Text>
        </View>
      )}

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

      <Modal
        visible={showCalorieModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalorieModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calorieModalContainer}>
            <Text style={styles.calorieModalTitle}>Thiết lập mục tiêu Calo</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, calorieTab === 'manual' && styles.activeTabButton]}
                onPress={() => setCalorieTab('manual')}
              >
                <Text style={[styles.tabText, calorieTab === 'manual' && styles.activeTabText]}>Nhập tay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, calorieTab === 'calculate' && styles.activeTabButton]}
                onPress={() => setCalorieTab('calculate')}
              >
                <Text style={[styles.tabText, calorieTab === 'calculate' && styles.activeTabText]}>Đề xuất</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {calorieTab === 'manual' ? (
                <View style={styles.tabContent}>
                  <Text style={styles.inputLabel}>Mục tiêu Calo hằng ngày (kcal)</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="VD: 2000"
                    keyboardType="numeric"
                    value={targetCaloriesInput}
                    onChangeText={setTargetCaloriesInput}
                  />
                </View>
              ) : (
                <View style={styles.tabContent}>
                  <Text style={styles.infoText}>Tính toán lượng Calo đề xuất để giảm cân an toàn.</Text>

                  <Text style={styles.inputLabel}>Cân nặng (kg) *</Text>
                  <TextInput style={styles.inputField} placeholder="VD: 65" keyboardType="numeric" value={weight} onChangeText={setWeight} />

                  <Text style={styles.inputLabel}>Chiều cao (cm) *</Text>
                  <TextInput style={styles.inputField} placeholder="VD: 170" keyboardType="numeric" value={height} onChangeText={setHeight} />

                  <Text style={styles.inputLabel}>Tuổi *</Text>
                  <TextInput style={styles.inputField} placeholder="VD: 25" keyboardType="numeric" value={age} onChangeText={setAge} />

                  <Text style={styles.inputLabel}>Giới tính *</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity style={[styles.genderButton, gender === 'male' && styles.activeGenderButton]} onPress={() => setGender('male')}>
                      <Text style={[styles.genderText, gender === 'male' && styles.activeGenderText]}>Nam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.genderButton, gender === 'female' && styles.activeGenderButton]} onPress={() => setGender('female')}>
                      <Text style={[styles.genderText, gender === 'female' && styles.activeGenderText]}>Nữ</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateCalories}>
                    <Text style={styles.calculateButtonText}>Tính toán Đề xuất</Text>
                  </TouchableOpacity>

                  {targetCaloriesInput ? (
                    <Text style={styles.suggestedText}>Mục tiêu đề xuất: {targetCaloriesInput} kcal</Text>
                  ) : null}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={() => setShowCalorieModal(false)}>
                <Text style={styles.skipButtonText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCalorieGoal}>
                <Text style={styles.saveButtonText}>Lưu Mục Tiêu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  calorieModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  calorieModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ee4d2d',
  },
  tabContent: {
    paddingBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeGenderButton: {
    borderColor: '#ee4d2d',
    backgroundColor: '#fff0ec',
  },
  genderText: {
    color: '#666',
    fontWeight: '600',
  },
  activeGenderText: {
    color: '#ee4d2d',
  },
  calculateButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  calculateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  suggestedText: {
    fontSize: 16,
    color: '#ee4d2d',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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