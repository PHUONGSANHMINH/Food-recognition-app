import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

export default function CameraScreen({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [flash, setFlash] = useState(FlashMode.off);
  const [speed, setSpeed] = useState('1.5x');
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
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  function toggleFlash() {
    setFlash(current => (current === FlashMode.off ? FlashMode.on : FlashMode.off));
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, flashMode: flash });
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
        type: 'image/jpeg'
      });

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_DOMAIN}api/detect/detect-recommend-spoonacular`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      setLoading(false);
      // Chuyển đến trang danh sách đề xuất với dữ liệu nhận được
      navigation.navigate('RecipeRecommendations', {
        detectedObjects: response.data.detected_objects, // Đối tượng đã nhận diện
        recommendations: response.data.recommendations // Danh sách món ăn đề xuất
      });


    } catch (error) {
      console.error(error);
      Alert.alert(
        'Lỗi',
        'Không thể xử lý ảnh. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
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
        <View style={styles.profileContainer}>
          <Image 
            source={require('../assets/chef.png')} 
            style={styles.profileImage}
          />
          <Text style={styles.title}>Recognition Camera</Text>
        </View>
      </View>

      <Camera style={styles.camera} type={type} flashMode={flash} ref={cameraRef}>
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <MaterialIcons name={flash === FlashMode.off ? "flash-off" : "flash-on"} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.speedText}>{speed}</Text>
          </TouchableOpacity>
        </View>
      </Camera>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <MaterialIcons name="photo-library" size={24} color="#ed5c01" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={toggleCameraType}
        >
          <MaterialIcons name="refresh" size={24} color="#ed5c01" />
        </TouchableOpacity>
      </View>

      {/* Modal for Previewing the Photo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={{ uri: photo }} style={styles.modalImage} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleUsePhoto}>
                <Text style={styles.modalButtonText}>Use photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleRetakePhoto}>
                <Text style={styles.modalButtonText}>take photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {loading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../animation/animation_scan.json')} // Thay bằng đường dẫn của bạn
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
    backgroundColor: '#ed5c010f',
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
    fontSize: 16,
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
  controlButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  speedText: {
    color: 'white',
    fontSize: 16,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#ed5c01',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  permissionButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
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
});
