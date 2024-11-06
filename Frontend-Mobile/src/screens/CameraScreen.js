import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CameraScreen() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [flash, setFlash] = useState(FlashMode.off); // Trạng thái của đèn flash
  const [speed, setSpeed] = useState('1.5x');
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const [accessToken, setAccessToken] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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
      setShowPreview(true);
    }
  }

  async function handleUsePhoto() {
    console.log('Sử dụng ảnh:', photo);
    setShowPreview(false);

    try {
      const formData = new FormData();
      formData.append('image', { uri: photo, name: 'image.jpg', type: 'image/jpeg' });

      const response = await axios.post(`${process.env.EXPO_PUBLIC_DOMAIN}api/detect/detect-recommend-spoonacular`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleRetakePhoto() {
    setPhoto(null);
    setShowPreview(false);
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
      {showPreview ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.previewButton} onPress={handleUsePhoto}>
              <Text style={styles.previewButtonText}>Sử dụng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={handleRetakePhoto}>
              <Text style={styles.previewButtonText}>Chụp lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <MaterialIcons name="photo-library" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={toggleCameraType}
        >
          <MaterialIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: 'white',
    fontSize: 16,
  },
  chatButton: {
    padding: 10,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 10,
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
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  historyText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  permissionButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  previewButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  previewButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
