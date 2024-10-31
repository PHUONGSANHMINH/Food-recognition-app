import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [type, setType] = useState(Camera.Constants?.Type?.back);
  const [flash, setFlash] = useState(Camera.Constants?.FlashMode?.off);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });
        if (photo) {
          navigation.navigate('RecipeList', { photo });
        }
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  const handleCameraFlip = () => {
    if (Camera.Constants?.Type) {
      setType(
        type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
      );
    }
  };

  const handleFlashToggle = () => {
    if (Camera.Constants?.FlashMode) {
      setFlash(
        flash === Camera.Constants.FlashMode.off
          ? Camera.Constants.FlashMode.on
          : Camera.Constants.FlashMode.off
      );
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Camera.Constants && (
        <Camera 
          style={styles.camera} 
          type={type}
          flashMode={flash}
          ref={cameraRef}
          onCameraReady={() => setCameraReady(true)}
          onMountError={(error) => {
            console.error('Camera mount error:', error);
            setHasPermission(false);
          }}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={handleCameraFlip}>
              <Image 
                source={require('../assets/flip-camera.png')} 
                style={styles.flipIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, !cameraReady && styles.buttonDisabled]}
              onPress={handleTakePhoto}
              disabled={!cameraReady}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flashButton}
              onPress={handleFlashToggle}>
              <Image 
                source={require('../assets/flash.png')} 
                style={[
                  styles.flashIcon,
                  { tintColor: flash === Camera.Constants.FlashMode.on ? '#fff' : '#666' }
                ]}
              />
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  flipButton: {
    padding: 15,
  },
  flashButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  flipIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  flashIcon: {
    width: 30,
    height: 30,
  },
  errorText: {
    color: '#ee4d2d',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CameraScreen;