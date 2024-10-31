import React, { useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert, Image } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { usernameValidator } from '../helpers/usernameValidator';
import { passwordValidator } from '../helpers/passwordValidator';
import Modal from 'react-native-modal';
import Config from 'react-native-config'; // Add this

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: { value: '', error: '' },
    password: { value: '', error: '' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { value, error: '' }
    }));
  }, []);

  const storeTokens = async (tokens) => {
    try {
      const { access_token, refresh_token } = tokens;
      if (!access_token || !refresh_token) {
        throw new Error('Invalid tokens received');
      }
      
      await Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
      ]);
      
      return true;
    } catch (error) {
      console.error('Token storage error:', error);
      throw new Error('Failed to store authentication tokens');
    }
  };

  const setupAxiosAuth = useCallback((access_token) => {
    if (!access_token) return;
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    // Add request interceptor for token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refresh_token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            const response = await axios.post(`${Config.API_URL}/auth/refresh`, { refresh_token });
            const { access_token } = response.data;
            
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, redirect to login
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }, [navigation]);

  const validateForm = useCallback(() => {
    const usernameError = usernameValidator(formData.username.value);
    const passwordError = passwordValidator(formData.password.value);
    
    setFormData(prev => ({
      username: { ...prev.username, error: usernameError },
      password: { ...prev.password, error: passwordError }
    }));

    return !usernameError && !passwordError;
  }, [formData]);

  const handleLogin = async () => {
    if (!validateForm()) return;
    console.log(process.env.EXPO_PUBLIC_DOMAIN);
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/auth/login`, {
        username: formData.username.value,
        password: formData.password.value,
      });

      await storeTokens(response.data);
      setupAxiosAuth(response.data.access_token);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Unable to connect to the server. Please check your internet connection.';
      setError(errorMessage);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back</Header>
      
      <TextInput
        label="Username"
        returnKeyType="next" 
        value={formData.username.value}
        onChangeText={(text) => handleInputChange('username', text)}
        error={!!formData.username.error}
        errorText={formData.username.error}
        autoCapitalize="none"
        autoComplete="username"
        textContentType="username"
        keyboardType="default"
        testID="login-username-input"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={formData.password.value}
        onChangeText={(text) => handleInputChange('password', text)}
        error={!!formData.password.error}
        errorText={formData.password.error}
        secureTextEntry
        testID="login-password-input"
      />

      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}
          testID="forgot-password-button"
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={loading}
        testID="login-button"
      >
        Login
      </Button>

      <View style={styles.row}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity 
          onPress={() => navigation.replace('RegisterScreen')}
          testID="signup-link"
        >
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={isModalVisible}
        animationIn="bounceIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Image
            source={require('../assets/caution.png')}
            style={styles.errorIcon}
          />
          <Text style={styles.modalText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
            testID="error-modal-close"
          >
            Close
          </Button>
        </View>
      </Modal>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center', 
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  errorIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#D32F2F',
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    marginTop: 10,
  },
});