import React, { useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// ─── Helper ───────────────────────────────────────────────────────────────────
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100; // cm → m
  return (weight / (h * h)).toFixed(1);
}

// ─── Row Component ────────────────────────────────────────────────────────────
function InfoRow({ label, value, isLast }) {
  return (
    <View style={[styles.cardRow, !isLast && styles.cardRowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValueBold}>{value}</Text>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const [userInfo,    setUserInfo]    = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [loading,     setLoading]     = useState(true);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // ── Fetch data every time screen comes into focus ─────────────────────────
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            navigation.replace('Login');
            return;
          }
          const headers = { Authorization: `Bearer ${token}` };

          const [userRes, calRes] = await Promise.all([
            fetch(`${API_URL}/api/user/info`,              { headers }),
            fetch(`${API_URL}/api/nutrition-user/calories`, { headers }),
          ]);

          if (userRes.ok) {
            const u = await userRes.json();
            setUserInfo(u);
          }
          if (calRes.ok) {
            const c = await calRes.json();
            setCalorieGoal(c);  // lưu toàn bộ object
          }
        } catch (err) {
          console.error('ProfileScreen fetch error:', err);
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }, [API_URL])
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    navigation.replace('Login');
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const bmi = userInfo ? calcBMI(userInfo.weight, userInfo.height) : null;

  // Macros từ API (backend tính theo công thức)
  const protein = calorieGoal?.protein_goal     ?? null;
  const carbs   = calorieGoal?.carbohydrate_goal ?? null;
  const fat     = calorieGoal?.fat_goal          ?? null;
  const kcal    = calorieGoal?.calories_goal     ?? null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('SetupProfile')}
        >
          <Ionicons name="settings-outline" size={26} color="#3F805A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F805A" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Avatar + Name ───────────────────────────────────────── */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../assets/Food.png')}
                style={styles.avatar}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>
                {userInfo?.username ?? 'User'}
              </Text>
              <Text style={styles.emailText}>
                {userInfo?.email ?? ''}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editProfileText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── My Goals Card ────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>My goals</Text>
            </View>

            <InfoRow
              label="Daily calories"
              value={kcal ? `${kcal} kcal` : '—'}
            />
            <InfoRow
              label="Protein"
              value={protein ? `${protein}g` : '—'}
            />
            <InfoRow
              label="Carbs"
              value={carbs ? `${carbs}g` : '—'}
            />
            <InfoRow
              label="Fat"
              value={fat ? `${fat}g` : '—'}
              isLast
            />
          </View>

          {/* ── My Status Card ───────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>My status</Text>
            </View>

            <InfoRow
              label="Height"
              value={userInfo?.height ? `${userInfo.height}cm` : '—'}
            />
            <InfoRow
              label="Weight"
              value={userInfo?.weight ? `${userInfo.weight}kg` : '—'}
            />
            <InfoRow
              label="BMI"
              value={bmi ?? '—'}
              isLast
            />
          </View>

          {/* ── Log Out ──────────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  settingsBtn: {
    width: 40,
    alignItems: 'flex-end',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  // Profile header section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#3F805A',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    marginLeft: 18,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 3,
  },
  emailText: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 6,
  },
  editProfileText: {
    fontSize: 14,
    color: '#3F805A',
    fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  editText: {
    fontSize: 14,
    color: '#3F805A',
    fontWeight: '600',
  },

  // Rows
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  cardRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  rowValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  // Logout
  logoutBtn: {
    marginTop: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
