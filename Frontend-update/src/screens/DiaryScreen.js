import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DiaryScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 14)); // May 2025 as in image
  const [selectedDate, setSelectedDate] = useState(14);
  const [consumedFoods, setConsumedFoods] = useState([
    { id: '1', type: 'Breakfast', name: 'Avocado Toast Bowl', calories: 420 },
    { id: '2', type: 'Lunch', name: 'Avocado Toast Bowl', calories: 800 },
  ]);

  const generateMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    let startOffset = firstDay - 1;
    if (startOffset < 0) startOffset = 6;
    
    const days = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, id: `prev-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, id: `curr-${i}` });
    }
    const totalCells = days.length <= 35 ? 35 : 42;
    const nextDays = totalCells - days.length;
    for (let i = 1; i <= nextDays; i++) {
      days.push({ day: i, isCurrentMonth: false, id: `next-${i}` });
    }
    return days;
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const calendarDays = generateMonthDays(currentYear, currentMonth);

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const renderCalendarGrid = () => {
    return (
      <View style={styles.calendarGrid}>
        <View style={styles.weekDaysRow}>
          {weekDays.map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((item) => {
            const isSelected = item.isCurrentMonth && item.day === selectedDate;
            return (
              <TouchableOpacity 
                key={item.id}
                style={[styles.dayCellContainer]} 
                onPress={() => item.isCurrentMonth && setSelectedDate(item.day)}
                disabled={!item.isCurrentMonth}
              >
                <View style={[styles.dayCell, isSelected && styles.selectedDayCell]}>
                  <Text style={[
                    styles.dayNumber, 
                    !item.isCurrentMonth && styles.otherMonthDayText,
                    isSelected && styles.selectedDayText
                  ]}>
                    {item.day}
                  </Text>
                  {item.isCurrentMonth && (
                    <Text style={[styles.dayCalories, isSelected && styles.selectedDayText]}>
                      1.240
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.diaryFoodCard}>
      <View style={styles.diaryFoodTopRow}>
        <Text style={styles.diaryFoodType}>{item.type}</Text>
        <Text style={styles.diaryFoodCalories}>{item.calories} kcal</Text>
      </View>
      <View style={styles.diaryFoodBottomRow}>
        <Image source={require('../../assets/Food.png')} style={styles.diaryFoodImage} />
        <Text style={styles.diaryFoodName}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require('../../assets/Food.png')} style={styles.profileImageHeader} />
        <Text style={styles.headerTitle}>Diary</Text>
        <TouchableOpacity style={styles.calendarIconBtn}>
          <Ionicons name="calendar-outline" size={24} color="#3F805A" />
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={prevMonth}><Ionicons name="chevron-back" size={20} color="black" /></TouchableOpacity>
                <Text style={styles.monthYearText}>{monthNames[currentMonth]} {currentYear}</Text>
                <TouchableOpacity onPress={nextMonth}><Ionicons name="chevron-forward" size={20} color="black" /></TouchableOpacity>
              </View>
              {renderCalendarGrid()}
            </View>

            <View style={styles.separator} />

            <View style={styles.dateInfoContainer}>
              <Text style={styles.dateInfoText}>Thursday, May 14, 2026</Text>
              <Text style={styles.dateInfoCalories}><Text style={styles.caloriesGreen}>1740</Text>/2000 kcal</Text>
            </View>
          </>
        }
        data={consumedFoods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // matched light background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileImageHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  calendarIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  calendarContainer: {
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  calendarGrid: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 13,
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCellContainer: {
    width: '14.28%', // 100% / 7
    aspectRatio: 0.8,
    padding: 2,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  selectedDayCell: {
    backgroundColor: '#3F805A',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  otherMonthDayText: {
    color: '#ccc',
  },
  dayCalories: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
  },
  selectedDayText: {
    color: 'white',
  },
  dateInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  dateInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  dateInfoCalories: {
    fontSize: 12,
    color: '#9ca3af',
  },
  caloriesGreen: {
    color: '#3F805A',
    fontWeight: 'bold',
  },
  diaryFoodCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  diaryFoodTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  diaryFoodType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  diaryFoodCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3F805A',
  },
  diaryFoodBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diaryFoodImage: {
    width: 80,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    marginRight: 15,
  },
  diaryFoodName: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  }
});
