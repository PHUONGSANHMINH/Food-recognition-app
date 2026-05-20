import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIN_KCAL = 1200;
const MAX_KCAL = 3000;

// ─── Harris–Benedict BMR → TDEE (moderate activity) ──────────────────────────
function calcRecommended({ gender = 'male', age = 25, height = 170, weight = 65 }) {
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
  // Moderate activity × 1.55, clamp to slider range
  const result = Math.round(bmr * 1.55);
  return Math.min(MAX_KCAL, Math.max(MIN_KCAL, result));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SetupGoalScreen({ navigation, route }) {
  const { token, gender, age, height, weight } = route.params || {};

  const recommended = calcRecommended({ gender, age, height, weight });

  const [calories, setCalories]         = useState(recommended);
  const [isSaving,  setIsSaving]        = useState(false);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualInput,   setManualInput]   = useState('');

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // ── Save to API ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedToken = token || (await AsyncStorage.getItem('access_token'));
      const res = await fetch(`${API_URL}/api/nutrition-user/update`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ calories_goal: calories }),
      });
      const data = await res.json();
      if (res.ok || res.status === 201) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', data.msg || 'Could not save. Please try again.');
      }
    } catch (err) {
      console.error('SetupGoal save error:', err);
      Alert.alert('Error', 'Unable to connect to the server.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Manual entry confirm ─────────────────────────────────────────────────
  const handleManualConfirm = () => {
    const val = parseInt(manualInput, 10);
    if (isNaN(val) || val < MIN_KCAL || val > MAX_KCAL) {
      Alert.alert('Invalid value', `Please enter a number between ${MIN_KCAL} and ${MAX_KCAL}.`);
      return;
    }
    setCalories(val);
    setManualVisible(false);
    setManualInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F0" />

      <View style={styles.container}>

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrap}>
            <Ionicons name="search" size={18} color="#C89A2A" />
          </View>
          <Text style={styles.logoText}>NutriLens</Text>
        </View>

        {/* ── Step indicator ────────────────────────────────────────── */}
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        {/* ── Title & subtitle ──────────────────────────────────────── */}
        <Text style={styles.title}>Your Daily Goal</Text>
        <Text style={styles.subtitle}>
          Based on your profile, this is your recommended daily intake to lose weight safety
        </Text>

        {/* ── Calorie card ──────────────────────────────────────────── */}
        <View style={styles.cardShadow}>
          <View style={styles.card}>
            <Text style={styles.calorieNumber}>{calories}</Text>
            <Text style={styles.calorieUnit}>KCAL PER DAY</Text>
          </View>
        </View>

        {/* ── Adjust slider ─────────────────────────────────────────── */}
        <View style={styles.adjustRow}>
          <Text style={styles.adjustLabel}>Adjust Target</Text>
          <TouchableOpacity onPress={() => {
            setManualInput(String(calories));
            setManualVisible(true);
          }}>
            <Text style={styles.manualEntry}>Manual Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderCard}>
          <Slider
            style={styles.slider}
            minimumValue={MIN_KCAL}
            maximumValue={MAX_KCAL}
            step={50}
            value={calories}
            onValueChange={val => setCalories(Math.round(val))}
            minimumTrackTintColor="#9ca3af"
            maximumTrackTintColor="#9ca3af"
            thumbTintColor="#3F805A"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMin}>{MIN_KCAL} kcal</Text>
            <Text style={styles.sliderMax}>{MAX_KCAL} kcal</Text>
          </View>
        </View>

        {/* ── Spacer ────────────────────────────────────────────────── */}
        <View style={{ flex: 1 }} />

        {/* ── OK Button ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.okBtn, isSaving && styles.okBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.okBtnText}>OK</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Manual Entry Modal ─────────────────────────────────────── */}
      <Modal
        visible={manualVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManualVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Calorie Goal</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={manualInput}
              onChangeText={setManualInput}
              placeholder={`${MIN_KCAL} – ${MAX_KCAL} kcal`}
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setManualVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleManualConfirm}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 36,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  logoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#C89A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3F805A',
  },

  // Step
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3F805A',
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#D4D8CE',
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: {
    width: '100%',           // step 2 of 2 → full
    height: '100%',
    backgroundColor: '#C89A2A',
    borderRadius: 2,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7A6F',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
    marginBottom: 32,
  },

  // Card
  cardShadow: {
    backgroundColor: '#E4E8E0',
    borderRadius: 22,
    padding: 10,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  calorieNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#3F805A',
    lineHeight: 72,
  },
  calorieUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Adjust
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adjustLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  manualEntry: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F805A',
  },

  // Slider
  sliderCard: {
    backgroundColor: '#E4E8E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderMin: {
    fontSize: 12,
    color: '#6B7A6F',
    fontWeight: '500',
  },
  sliderMax: {
    fontSize: 12,
    color: '#6B7A6F',
    fontWeight: '500',
  },

  // OK button
  okBtn: {
    backgroundColor: '#3F805A',
    borderRadius: 50,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3F805A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 8,
  },
  okBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  okBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#3F805A',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#3F805A',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
