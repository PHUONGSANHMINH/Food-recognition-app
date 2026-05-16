import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={26} color="#3F805A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileSection}>
          <Image source={require('../../assets/Food.png')} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>Nguyen ABC</Text>
            <Text style={styles.emailText}>ABC@gmail.com</Text>
            <TouchableOpacity>
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My goals</Text>
            <TouchableOpacity><Text style={styles.editText}>Edit</Text></TouchableOpacity>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Daily calories</Text>
            <Text style={styles.rowValueBold}>2000 kcal</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Protein</Text>
            <Text style={styles.rowValueBold}>32g</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Carbs</Text>
            <Text style={styles.rowValueBold}>24g</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Fat</Text>
            <Text style={styles.rowValueBold}>18g</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My goals</Text>
            <TouchableOpacity><Text style={styles.editText}>Edit</Text></TouchableOpacity>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Daily calories</Text>
            <Text style={styles.rowValueBold}>2000 kcal</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Protein</Text>
            <Text style={styles.rowValueBold}>32g</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Carbs</Text>
            <Text style={styles.rowValueBold}>24g</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Fat</Text>
            <Text style={styles.rowValueBold}>18g</Text>
          </View>
        </View>

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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsBtn: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#3F805A',
  },
  profileInfo: {
    marginLeft: 20,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: '#3F805A',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  editText: {
    fontSize: 14,
    color: '#3F805A',
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#666',
  },
  rowValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  }
});
