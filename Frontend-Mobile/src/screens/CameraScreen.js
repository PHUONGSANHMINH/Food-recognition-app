import React, { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

export default function CameraScreen({ navigation }) {
  const [type, setType] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
        }
      } catch (error) {
        console.error('Failed to retrieve access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionMessage}>
            Camera access is required to use this feature.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function toggleCameraType() {
    setType((current) => (current === 'back' ? 'front' : 'back')); // Dùng chuỗi thay cho CameraType.front
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      setPhoto(photo.uri);
      setIsModalVisible(true);
    }
  }

  async function handleUsePhoto() {
    setIsModalVisible(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: photo,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/detect/detect-recommend-spoonacular`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setLoading(false);
      navigation.navigate('RecipeRecommendations', {
        detectedObjects: response.data.detected_objects,
        recommendations: response.data.recommendations,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to process the photo. Please try again.', [{ text: 'OK' }]);
    }
  }

  function handleRetakePhoto() {
    setPhoto(null);
    setIsModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
      <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/arrow_back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Recognition Camera</Text>
          {/* <Image source={require('../assets/chef.png')} style={styles.profileImage} /> */}
        </View>
      </View>

      <CameraView
        style={styles.camera}
        type={type}
        ref={cameraRef}
      >
        <View style={styles.controlsContainer}>
          {/* Các nút điều khiển flash đã bị loại bỏ */}
        </View>
      </CameraView>

      <View style={styles.footer}>
        {/* <TouchableOpacity style={styles.footerButton}>
          <MaterialIcons name="photo-library" size={24} color="#ed5c01" />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.footerButton} onPress={toggleCameraType}>
          <MaterialIcons name="refresh" size={24} color="#ed5c01" />
        </TouchableOpacity> */}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={{ uri: photo }} style={styles.modalImage} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleUsePhoto}>
                <Text style={styles.modalButtonText}>Use Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleRetakePhoto}>
                <Text style={styles.modalButtonText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../animation/animation_scan.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Detecting...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  title: {
    color: '#ed5c01',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 10,
    marginBottom: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 70,
    padding: 20,
  },
  footerButton: {
    padding: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#ed5c01',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ed5c01',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 480,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    backgroundColor: '#ed5c01',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#ed5c01',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    color: '#ed5c01',
    marginTop: 10,
    fontSize: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
});
