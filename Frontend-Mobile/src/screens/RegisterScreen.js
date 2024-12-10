import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
import { emailValidator } from '../helpers/emailValidator';
import { passwordValidator } from '../helpers/passwordValidator';
import { nameValidator } from '../helpers/nameValidator';
import { Feather } from '@expo/vector-icons';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export default function RegisterScreen({ navigation }) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: { value: '', error: '' },
    email: { value: '', error: '' },
    password: { value: '', error: '' }
  });
  const [loading, setLoading] = useState(false);

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

  const validateForm = useCallback(() => {
    const nameError = nameValidator(formData.name.value);
    const emailError = emailValidator(formData.email.value);
    const passwordError = passwordValidator(formData.password.value);

    setFormData(prev => ({
      name: { ...prev.name, error: nameError },
      email: { ...prev.email, error: emailError },
      password: { ...prev.password, error: passwordError }
    }));

    return !nameError && !emailError && !passwordError;
  }, [formData]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/auth/login`, {
        username: formData.name.value,
        password: formData.password.value,
      });

      await storeTokens(response.data);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to login after registration. Please try again.');
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/auth/register`, {
        username: formData.name.value,
        email: formData.email.value,
        password: formData.password.value,
      });

      Alert.alert('Success', response.data.msg);

      // Thực hiện đăng nhập sau khi đăng ký thành công
      await handleLogin();

    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data.errors;
        setFormData(prev => ({
          ...prev,
          name: { ...prev.name, error: errors.username.join(', ') },
          password: { ...prev.password, error: errors.password.join(', ') }
        }));
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
      <View style={styles.inputWrapper}>
        <TextInput
          label="Username"
          returnKeyType="next"
          value={formData.name.value}
          onChangeText={(text) => handleInputChange('name', text)}
          error={!!formData.name.error}
          style={styles.input}
        />
        {!!formData.name.error && (
          <Text style={styles.errorText}>{formData.name.error}</Text>
        )}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          label="Email"
          returnKeyType="next"
          value={formData.email.value}
          onChangeText={(text) => handleInputChange('email', text)}
          error={!!formData.email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          style={styles.input}
        />
        {!!formData.email.error && (
          <Text style={styles.errorText}>{formData.email.error}</Text>
        )}
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.passwordWrapper}>
          <TextInput
            label="Password"
            returnKeyType="done"
            value={formData.password.value}
            onChangeText={(text) => handleInputChange('password', text)}
            error={!!formData.password.error}
            secureTextEntry={!isPasswordVisible}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={() => setPasswordVisible(!isPasswordVisible)}
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={24}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>
        </View>
        {!!formData.password.error && (
          <Text style={styles.errorText}>{formData.password.error}</Text>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={{ marginTop: 24 }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 24,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20, // Khoảng cách giữa các input
  },
  input: {
    width: '100%',
  },
  errorText: {
    color: '#D32F2F', // Màu đỏ cho lỗi
    fontSize: 12,
    height: 16, // Chiều cao cố định
    marginTop: 4, // Khoảng cách giữa input và lỗi
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20, // Khoảng cách giữa các input
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50, // Chừa không gian cho icon mắt
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    top: '55%',
    transform: [{ translateY: -12 }], // Canh giữa theo chiều dọc
  },
});
