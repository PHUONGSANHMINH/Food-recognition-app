import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('REGISTRATION SUCCESSFUL:', data);

        // Backend không trả về token khi đăng ký
        // → Tự động đăng nhập để lấy access_token
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: fullName, password }),
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.access_token) {
          await AsyncStorage.setItem('access_token', loginData.access_token);
          navigation.replace('SetupProfile', { token: loginData.access_token });
        } else {
          // Đăng ký ok nhưng auto-login thất bại → vào Login thủ công
          Alert.alert(
            'Account Created',
            'Your account was created. Please log in to continue.',
            [{ text: 'Log In', onPress: () => navigation.replace('Login') }]
          );
        }
      } else {
        const errMsg =
          data.errors?.username?.[0] ||
          data.errors?.email?.[0] ||
          data.errors?.password?.[0] ||
          data.message ||
          'An error occurred during registration';
        Alert.alert('Registration Failed', errMsg);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Unable to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          
          <View style={styles.card}>
            {/* Logo Placeholder */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="search" size={28} color="#FFC107" />
              </View>
            </View>

            <Text style={styles.title}>Create your account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#62656b" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Full Name"
                  placeholderTextColor="#9ca3af"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#62656b" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@gmail.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#62656b" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#62656b" 
                    style={styles.iconRight} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#62656b" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Signing Up...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By signing up, you agree to our Terms of Service and Privacy Policy. NutriLens prioritiez your data security
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light grey background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#3F805A',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#3F805A',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#3F805A',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#62656b',
    fontSize: 14,
  },
  loginLink: {
    color: '#3F805A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  termsText: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
