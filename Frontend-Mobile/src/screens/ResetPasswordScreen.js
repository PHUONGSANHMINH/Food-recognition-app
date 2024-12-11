import React, { useState } from 'react';
import axios from 'axios';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Logo from '../components/Logo';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { emailValidator } from '../helpers/emailValidator';
import { Alert } from 'react-native';

function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState('email'); // 'email', 'verification', 'newPassword'

  const sendResetPasswordEmail = async () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/auth/forget-password/send-code`, {
        email: email.value
      });
      
      if (response.status === 200) {
        setStage('verification');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to send verification code');
    }
  }

  const verifyCode = async () => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/auth/forget-password/verify-code`, {
        email: email.value,
        verifycode: verificationCode
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
      
      if (response.status === 200) {
        setStage('newPassword');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.msg || 'Invalid verification code');
    }
  }

  const changePassword = async () => {
    if (!email.value || !newPassword || !confirmPassword || !verificationCode) {
      Alert.alert('Error', 'Missing required fields');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/auth/forget-password/change`, {
        email: email.value,
        newpassword: newPassword,
        confirmpassword: confirmPassword,
        verifycode: verificationCode
      });
      
      if (response.status === 200) {
        Alert.alert('Success', 'Password changed successfully');
        navigation.navigate('LoginScreen');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to change password');
    }
  }

  const renderEmailStage = () => (
    <>
      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description="You will receive a verification code via email."
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmail}
        style={{ marginTop: 16 }}
      >
        Send Verification Code
      </Button>
    </>
  )

  const renderVerificationStage = () => (
    <>
      <TextInput
        label="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
        maxLength={6}
        description="Enter 6-digit code sent to your email"
      />
      <Button
        mode="contained"
        onPress={verifyCode}
        style={{ marginTop: 16 }}
      >
        Verify Code
      </Button>
    </>
  )

  const renderNewPasswordStage = () => (
    <>
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        description="Enter your new password"
      />
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        description="Confirm your new password"
      />
      <Button
        mode="contained"
        onPress={changePassword}
        style={{ marginTop: 16 }}
      >
        Change Password
      </Button>
    </>
  )

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Restore Password</Header>
      {stage === 'email' && renderEmailStage()}
      {stage === 'verification' && renderVerificationStage()}
      {stage === 'newPassword' && renderNewPasswordStage()}
    </Background>
  );
}

export default ResetPasswordScreen;
