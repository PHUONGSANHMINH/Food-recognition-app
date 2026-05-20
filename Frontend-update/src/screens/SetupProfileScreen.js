import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// ─── Reusable Selector Component ────────────────────────────────────────────
function SelectorCard({ icon, label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.selectorCard, selected && styles.selectorCardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.selectorIcon, selected && styles.selectorIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.selectorLabel, selected && styles.selectorLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Reusable Number Stepper ─────────────────────────────────────────────────
function NumberStepper({ value, onIncrement, onDecrement, unit }) {
  return (
    <View style={styles.stepperRow}>
      <TouchableOpacity style={styles.stepperBtn} onPress={onDecrement} activeOpacity={0.7}>
        <Ionicons name="remove" size={22} color="#3F805A" />
      </TouchableOpacity>
      <View style={styles.stepperValueBox}>
        <Text style={styles.stepperValue}>{value}</Text>
        <Text style={styles.stepperUnit}>{unit}</Text>
      </View>
      <TouchableOpacity style={styles.stepperBtn} onPress={onIncrement} activeOpacity={0.7}>
        <Ionicons name="add" size={22} color="#3F805A" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SetupProfileScreen({ navigation, route }) {
  const { token } = route.params || {};

  const [gender, setGender] = useState(null);
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const progressAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.5,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleNext = async () => {
    if (!gender) return;

    setIsSaving(true);
    try {
      const savedToken = token || (await AsyncStorage.getItem('access_token'));
      await fetch(`${API_URL}/api/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ gender, height, weight, age }),
      });
    } catch (err) {
      // Non-blocking: tiếp tục dù lưu thất bại
      console.warn('SetupProfile: could not save body stats:', err);
    } finally {
      setIsSaving(false);
    }
    navigation.navigate('SetupGoal', { token, gender, age, height, weight });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <View style={styles.logoRow}>
        <View style={styles.logoIconWrap}>
          <Ionicons name="search" size={18} color="#C89A2A" />
        </View>
        <Text style={styles.logoText}>NutriLens</Text>
      </View>

      {/* ── Step label + Progress bar ─────────────────────────────── */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={styles.headerBlock}>
          <View style={styles.iconBadge}>
            <Ionicons name="body-outline" size={30} color="#3F805A" />
          </View>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We'll use this to calculate your personalized daily calorie goal.
          </Text>
        </View>

        {/* ── Gender ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.selectorRow}>
            <SelectorCard
              icon="♂️"
              label="Male"
              selected={gender === 'male'}
              onPress={() => setGender('male')}
            />
            <SelectorCard
              icon="♀️"
              label="Female"
              selected={gender === 'female'}
              onPress={() => setGender('female')}
            />
          </View>
          {!gender && (
            <Text style={styles.hintText}>Please select your gender to continue</Text>
          )}
        </View>

        {/* ── Age ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Age</Text>
          <NumberStepper
            value={age}
            unit="years"
            onIncrement={() => setAge(a => Math.min(a + 1, 99))}
            onDecrement={() => setAge(a => Math.max(a - 1, 10))}
          />
        </View>

        {/* ── Height ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Height</Text>
          <NumberStepper
            value={height}
            unit="cm"
            onIncrement={() => setHeight(h => Math.min(h + 1, 250))}
            onDecrement={() => setHeight(h => Math.max(h - 1, 100))}
          />
        </View>

        {/* ── Weight ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Weight</Text>
          <NumberStepper
            value={weight}
            unit="kg"
            onIncrement={() => setWeight(w => Math.min(w + 1, 300))}
            onDecrement={() => setWeight(w => Math.max(w - 1, 20))}
          />
        </View>

        {/* ── CTA Button ───────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.nextBtn, (!gender || isSaving) && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!gender || isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

        {/* ── Skip link ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.skipLink}
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 20,
    marginBottom: 16,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
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
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C89A2A',
    borderRadius: 2,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Header
  headerBlock: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F3ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2E22',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7A6F',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3F805A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  // Gender selector
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E7E4',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  selectorCardActive: {
    borderColor: '#3F805A',
    backgroundColor: '#EAF5EE',
  },
  selectorIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  selectorIconActive: {},
  selectorLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  selectorLabelActive: {
    color: '#3F805A',
  },
  hintText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValueBox: {
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A2E22',
    lineHeight: 38,
  },
  stepperUnit: {
    fontSize: 13,
    color: '#6B7A6F',
    fontWeight: '500',
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

  // CTA
  nextBtn: {
    backgroundColor: '#3F805A',
    borderRadius: 28,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#3F805A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nextBtnDisabled: {
    backgroundColor: '#A8C4B5',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // Skip
  skipLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
});
