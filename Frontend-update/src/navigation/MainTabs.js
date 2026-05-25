import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import DiaryScreen from '../screens/DiaryScreen';
import ScanScreen from '../screens/ScanScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabButton = ({ item, onPress, accessibilityState }) => {
  const focused = accessibilityState?.selected;
  let iconName;
  if (item.name === 'Home') iconName = focused ? 'home' : 'home-outline';
  else if (item.name === 'Diary') iconName = focused ? 'journal' : 'journal-outline';
  else if (item.name === 'Scan') iconName = focused ? 'camera' : 'camera-outline';
  else if (item.name === 'Recipes') iconName = focused ? 'book' : 'book-outline';
  else if (item.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabButtonContainer}>
      <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
        <Ionicons name={iconName} size={20} color={focused ? 'white' : '#3F805A'} />
        <Text style={[styles.tabItemLabel, { color: focused ? 'white' : '#3F805A' }]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarButton: (props) => <TabButton {...props} item={{ name: 'Home' }} /> }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{ tabBarButton: (props) => <TabButton {...props} item={{ name: 'Diary' }} /> }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ tabBarButton: (props) => <TabButton {...props} item={{ name: 'Scan' }} /> }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{ tabBarButton: (props) => <TabButton {...props} item={{ name: 'Recipes' }} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarButton: (props) => <TabButton {...props} item={{ name: 'Profile' }} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: Platform.OS === 'ios' ? 85 : 75,
    paddingHorizontal: 10,
  },
  tabButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabItemFocused: {
    backgroundColor: '#3F805A',
  },
  tabItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
