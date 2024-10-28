import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, View, Alert, Image } from 'react-native'
import { Text } from 'react-native-paper'
import axios from 'axios'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { usernameValidator } from '../helpers/usernameValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import Modal from 'react-native-modal'

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')  // Holds error messages from API
  const [isModalVisible, setModalVisible] = useState(false)  // Controls modal visibility

  const onLoginPressed = async () => {
    const usernameError = usernameValidator(username.value)
    const passwordError = passwordValidator(password.value)
    if (usernameError || passwordError) {
      setUsername({ ...username, error: usernameError })
      setPassword({ ...password, error: passwordError })
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://192.168.2.2:5000/api/auth/login', {
        username: username.value,
        password: password.value,
      })
      if (response.status === 200) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        })
      } else {
        setError(response.data.msg || 'Something went wrong')
        setModalVisible(true)
      }
    } catch (error) {
      setError(
        error.response?.data?.msg || 'Network Error: Unable to connect to the server'
      )
      setModalVisible(true)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setModalVisible(false)  // Close modal when button is pressed or after timeout
  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Username"
        returnKeyType="next"
        value={username.value}
        onChangeText={(text) => setUsername({ value: text, error: '' })}
        error={!!username.error}
        errorText={username.error}
        autoCapitalize="none"
        autoCompleteType="username"
        textContentType="username"
        keyboardType="default"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed} loading={loading}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Popup for Error */}
      <Modal
        isVisible={isModalVisible}
        animationIn="bounceIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}  // Instant backdrop disappearance
        onBackdropPress={closeModal}  // Close modal when backdrop is pressed
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Image
            source={require('../assets/logo.png')} // Warning icon (replace with your image path)
            style={styles.errorIcon}
          />
          <Text style={styles.modalText}>{error}</Text>
          <Button mode="contained" onPress={closeModal} style={styles.closeButton}>
            Close
          </Button>
        </View>
      </Modal>
    </Background>
  )
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
    elevation: 5,  // Android shadow
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
    color: '#D32F2F',  // Warning red color
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
  },
})
