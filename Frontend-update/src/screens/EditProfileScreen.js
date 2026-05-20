import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GENDERS = ['Male', 'Female'];

export default function EditProfileScreen({ navigation, route }) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // ── Local state ─────────────────────────────────────────────────────────────
  const [height,        setHeight]        = useState('');
  const [weight,        setWeight]        = useState('');
  const [age,           setAge]           = useState('');
  const [gender,        setGender]        = useState('Male');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [isSaving,      setIsSaving]      = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // ── Pre-fill from API on mount ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, calRes] = await Promise.all([
          fetch(`${API_URL}/api/user/info`,               { headers }),
          fetch(`${API_URL}/api/nutrition-user/calories`,  { headers }),
        ]);

        if (userRes.ok) {
          const u = await userRes.json();
          setHeight(u.height   != null ? String(u.height)   : '');
          setWeight(u.weight   != null ? String(u.weight)   : '');
          setAge(u.age         != null ? String(u.age)      : '');
          setGender(u.gender === 'female' ? 'Female' : 'Male');
        }
        if (calRes.ok) {
          const c = await calRes.json();
          setCalorieTarget(c.calories_goal != null ? String(c.calories_goal) : '');
        }
      } catch (err) {
        console.error('EditProfile load error:', err);
      }
    }
    load();
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const h   = parseFloat(height);
    const w   = parseFloat(weight);
    const a   = parseInt(age, 10);
    const cal = parseInt(calorieTarget, 10);

    if (height && (isNaN(h) || h < 50 || h > 300)) {
      Alert.alert('Invalid', 'Height must be between 50 and 300 cm.'); return;
    }
    if (weight && (isNaN(w) || w < 10 || w > 500)) {
      Alert.alert('Invalid', 'Weight must be between 10 and 500 kg.'); return;
    }
    if (age && (isNaN(a) || a < 10 || a > 120)) {
      Alert.alert('Invalid', 'Age must be between 10 and 120.'); return;
    }
    if (calorieTarget && (isNaN(cal) || cal < 800 || cal > 5000)) {
      Alert.alert('Invalid', 'Calorie target must be between 800 and 5000 kcal.'); return;
    }

    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const headers = {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 1. Cập nhật thông tin cơ thể
      const bodyPayload = {
        gender: gender.toLowerCase(),
        ...(height        && { height: h }),
        ...(weight        && { weight: w }),
        ...(age           && { age: a }),
      };
      await fetch(`${API_URL}/api/user/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyPayload),
      });

      // 2. Cập nhật mục tiêu calo (backend tự tính macro)
      if (calorieTarget) {
        await fetch(`${API_URL}/api/nutrition-user/update`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ calories_goal: cal }),
        });
      }

      navigation.goBack();
    } catch (err) {
      console.error('EditProfile save error:', err);
      Alert.alert('Error', 'Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar ──────────────────────────────────────────────── */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../assets/Food.png')}
              style={styles.avatar}
            />
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        </View>

        {/* ── Health Profile ───────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Health Profile</Text>

        {/* Height + Weight row */}
        <View style={styles.row2}>
          <View style={styles.halfCard}>
            <Text style={styles.fieldLabel}>Height</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={styles.inputNum}
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor="#C4C4C4"
              />
              <Text style={styles.unitText}>cm</Text>
            </View>
          </View>
          <View style={styles.halfCard}>
            <Text style={styles.fieldLabel}>Weight</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={styles.inputNum}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                placeholder="65"
                placeholderTextColor="#C4C4C4"
              />
              <Text style={styles.unitText}>cm</Text>
            </View>
          </View>
        </View>

        {/* Gender + Age row */}
        <View style={styles.row2}>
          {/* Gender dropdown */}
          <View style={styles.halfCard}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowGenderPicker(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownValue}>{gender}</Text>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>
            {showGenderPicker && (
              <View style={styles.dropdownList}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={styles.dropdownItem}
                    onPress={() => { setGender(g); setShowGenderPicker(false); }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      gender === g && styles.dropdownItemActive,
                    ]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Age stepper */}
          <View style={styles.halfCard}>
            <Text style={styles.fieldLabel}>Age</Text>
            <View style={styles.stepperRow}>
              <TextInput
                style={styles.inputNum}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor="#C4C4C4"
              />
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  onPress={() => setAge(v => String(Math.min(120, (parseInt(v,10)||0) + 1)))}
                >
                  <Ionicons name="chevron-up" size={18} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAge(v => String(Math.max(10, (parseInt(v,10)||11) - 1)))}
                >
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Calorie Target */}
        <View style={styles.fullCard}>
          <Text style={styles.fieldLabel}>Daily Calorie Target</Text>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={styles.inputNum}
              keyboardType="number-pad"
              value={calorieTarget}
              onChangeText={setCalorieTarget}
              placeholder="1800"
              placeholderTextColor="#C4C4C4"
            />
            <Text style={styles.unitText}>kcal</Text>
          </View>
        </View>

        {/* ── Save ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // Avatar
  avatarBlock: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#3F805A',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3F805A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F805A',
    marginBottom: 14,
  },

  // Layout
  row2: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fullCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Fields
  fieldLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputNum: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    padding: 0,
  },
  unitText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
    alignSelf: 'flex-end',
    paddingBottom: 2,
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dropdownValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  dropdownList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#6B7280',
  },
  dropdownItemActive: {
    color: '#3F805A',
    fontWeight: '700',
  },

  // Age stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtns: {
    alignItems: 'center',
    gap: 2,
  },

  // Save button
  saveBtn: {
    backgroundColor: '#3F805A',
    borderRadius: 50,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3F805A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
