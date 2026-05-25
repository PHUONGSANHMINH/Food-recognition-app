import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function DiaryScreen({ navigation }) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [monthlyCalories, setMonthlyCalories] = useState({});  // { "14": 1740, ... }
  const [consumedFoods, setConsumedFoods] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [calGoal, setCalGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // ── Fetch monthly summary + selected day entries ──────────────────────────────
  const fetchMonthly = useCallback(async (year, month, token) => {
    const res = await fetch(
      `${API_URL}/api/diary/monthly-summary?year=${year}&month=${month + 1}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      setMonthlyCalories(data.summary || {});
    }
  }, [API_URL]);

  const fetchDayEntries = useCallback(async (year, month, day, token) => {
    setDayLoading(true);
    try {
      const dateStr = toDateStr(year, month, day);
      const res = await fetch(`${API_URL}/api/diary/entries?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsumedFoods(data.entries || []);
        setDailyTotal(data.total_calories || 0);
      }
    } finally {
      setDayLoading(false);
    }
  }, [API_URL]);

  const fetchGoal = useCallback(async (token) => {
    const res = await fetch(`${API_URL}/api/nutrition-user/calories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const g = await res.json();
      setCalGoal(g.calories_goal || 2000);
    }
  }, [API_URL]);

  // Refresh data tiên khi màn hình focus hoặc quay lại sau add
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      async function loadAll() {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token || !alive) return;
          await Promise.all([
            fetchMonthly(currentYear, currentMonth, token),
            fetchDayEntries(selectedYear, selectedMonth, selectedDay, token),
            fetchGoal(token),
          ]);
        } finally {
          if (alive) setLoading(false);
        }
      }
      loadAll();
      return () => { alive = false; };
    }, [currentYear, currentMonth, selectedDay, selectedMonth, selectedYear])
  );

  // ── Calendar navigation ───────────────────────────────────────────────────────
  const prevMonth = async () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(newDate);
    const token = await AsyncStorage.getItem('access_token');
    if (token) fetchMonthly(newDate.getFullYear(), newDate.getMonth(), token);
  };
  const nextMonth = async () => {
    const now = new Date();
    // Không cho chuyển sang tháng tương lai
    if (currentYear > now.getFullYear() || (currentYear === now.getFullYear() && currentMonth >= now.getMonth())) return;
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
    const token = await AsyncStorage.getItem('access_token');
    if (token) fetchMonthly(newDate.getFullYear(), newDate.getMonth(), token);
  };

  const onDayPress = async (item) => {
    if (!item.isCurrentMonth) return;
    // khóa ngày tương lai
    const clickedDate = new Date(currentYear, currentMonth, item.day);
    if (clickedDate > today) return;

    setSelectedDay(item.day);
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    const token = await AsyncStorage.getItem('access_token');
    if (token) fetchDayEntries(currentYear, currentMonth, item.day, token);
  };

  // ── Build calendar days ───────────────────────────────────────────────────────
  const generateMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    let startOffset = firstDay - 1;
    if (startOffset < 0) startOffset = 6;
    const days = [];
    for (let i = startOffset - 1; i >= 0; i--)
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, id: `prev-${i}` });
    for (let i = 1; i <= daysInMonth; i++)
      days.push({ day: i, isCurrentMonth: true, id: `curr-${i}` });
    const totalCells = days.length <= 35 ? 35 : 42;
    for (let i = 1; i <= totalCells - days.length; i++)
      days.push({ day: i, isCurrentMonth: false, id: `next-${i}` });
    return days;
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDays = generateMonthDays(currentYear, currentMonth);

  const formatSelectedDate = () => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const renderCalendarGrid = () => (
    <View style={styles.calendarGrid}>
      <View style={styles.weekDaysRow}>
        {weekDays.map((d) => (
          <Text key={d} style={styles.weekDayText}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {calendarDays.map((item) => {
          const isSelected =
            item.isCurrentMonth &&
            item.day === selectedDay &&
            currentMonth === selectedMonth &&
            currentYear === selectedYear;
          const calDate = new Date(currentYear, currentMonth, item.day);
          const isFuture = item.isCurrentMonth && calDate > today;
          const calStr = monthlyCalories[String(item.day)];
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.dayCellContainer}
              onPress={() => onDayPress(item)}
              disabled={!item.isCurrentMonth || isFuture}
            >
              <View style={[styles.dayCell, isSelected && styles.selectedDayCell]}>
                <Text style={[
                  styles.dayNumber,
                  !item.isCurrentMonth && styles.otherMonthDayText,
                  isFuture && styles.futureDayText,
                  isSelected && styles.selectedDayText,
                ]}>
                  {item.day}
                </Text>
                {item.isCurrentMonth && !isFuture && (
                  <Text style={[styles.dayCalories, isSelected && styles.selectedDayText]}>
                    {calStr ? Number(calStr).toLocaleString() : ''}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderFoodItem = ({ item }) => (
    <View style={styles.diaryFoodCard}>
      <View style={styles.diaryFoodTopRow}>
        <Text style={styles.diaryFoodType}>{item.meal_type}</Text>
        <Text style={styles.diaryFoodCalories}>{Math.round(item.calories)} kcal</Text>
      </View>
      <View style={styles.diaryFoodBottomRow}>
        <Image
          source={
            item.image
              ? { uri: `${API_URL}/api/file/get-file/diary/${item.image}` }
              : require('../../assets/Food.png')
          }
          style={styles.diaryFoodImage}
        />
        <Text style={styles.diaryFoodName}>{item.meal_name}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/Food.png')} style={styles.profileImageHeader} />
        <Text style={styles.headerTitle}>Diary</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddDiary')}
        >
          <Ionicons name="add" size={26} color="#3F805A" />
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      {loading ? (
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#3F805A" />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Calendar */}
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={prevMonth}>
                    <Ionicons name="chevron-back" size={20} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>
                    {monthNames[currentMonth]} {currentYear}
                  </Text>
                  <TouchableOpacity onPress={nextMonth}>
                    <Ionicons name="chevron-forward" size={20} color="black" />
                  </TouchableOpacity>
                </View>
                {renderCalendarGrid()}
              </View>

              <View style={styles.separator} />

              {/* Date info */}
              <View style={styles.dateInfoContainer}>
                <Text style={styles.dateInfoText}>{formatSelectedDate()}</Text>
                <Text style={styles.dateInfoCalories}>
                  <Text style={styles.caloriesGreen}>{Math.round(dailyTotal)}</Text>
                  /{Math.round(calGoal)} kcal
                </Text>
              </View>

              {dayLoading && (
                <ActivityIndicator size="small" color="#3F805A" style={{ marginVertical: 10 }} />
              )}

              {!dayLoading && consumedFoods.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={48} color="#ddd" />
                  <Text style={styles.emptyText}>No meals logged for this day</Text>
                  <Text style={styles.emptySubText}>Tap + to add your first meal</Text>
                </View>
              )}
            </>
          }
          data={dayLoading ? [] : consumedFoods}
          renderItem={renderFoodItem}
          keyExtractor={(item) => String(item.id_entry)}
          contentContainerStyle={styles.scrollContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  fullLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileImageHeader: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  separator: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20, marginVertical: 10 },
  scrollContent: { paddingBottom: 100 },

  // Calendar
  calendarContainer: { backgroundColor: 'transparent', paddingBottom: 10 },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  monthYearText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  calendarGrid: { paddingHorizontal: 15, marginTop: 10 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekDayText: { fontSize: 13, color: '#666', width: 40, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCellContainer: { width: '14.28%', aspectRatio: 0.8, padding: 2 },
  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 25 },
  selectedDayCell: { backgroundColor: '#3F805A' },
  dayNumber: { fontSize: 15, fontWeight: '500', color: '#000' },
  otherMonthDayText: { color: '#ccc' },
  futureDayText: { color: '#ccc' },
  selectedDayText: { color: 'white' },
  dayCalories: { fontSize: 9, color: '#9ca3af', marginTop: 2 },

  // Date info
  dateInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    flexWrap: 'wrap',
    gap: 4,
  },
  dateInfoText: { fontSize: 14, fontWeight: '500', color: '#000' },
  dateInfoCalories: { fontSize: 12, color: '#9ca3af' },
  caloriesGreen: { color: '#3F805A', fontWeight: 'bold' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: '#bbb', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#ddd', marginTop: 4 },

  // Food cards
  diaryFoodCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  diaryFoodTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  diaryFoodType: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  diaryFoodCalories: { fontSize: 16, fontWeight: 'bold', color: '#3F805A' },
  diaryFoodBottomRow: { flexDirection: 'row', alignItems: 'center' },
  diaryFoodImage: { width: 80, height: 50, borderRadius: 10, backgroundColor: '#F5F7FA', marginRight: 15, resizeMode: 'cover' },
  diaryFoodName: { fontSize: 15, color: '#666', flex: 1 },
});
