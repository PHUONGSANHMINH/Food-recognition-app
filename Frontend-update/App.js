import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SetupProfileScreen from './src/screens/SetupProfileScreen';
import SetupGoalScreen from './src/screens/SetupGoalScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AddDiaryScreen from './src/screens/AddDiaryScreen';
import ScanResultRecipesScreen from './src/screens/ScanResultRecipesScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
        <Stack.Screen name="SetupGoal" component={SetupGoalScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AddDiary" component={AddDiaryScreen} />
        <Stack.Screen name="ScanResultRecipes" component={ScanResultRecipesScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

