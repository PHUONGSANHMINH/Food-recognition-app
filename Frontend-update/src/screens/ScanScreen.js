import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Parse JSON an toàn — tránh crash khi server trả HTML thay vì JSON
const safeJson = async (res) => {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.warn('Non-JSON response:', res.status, text.substring(0, 200));
        return null;
    }
    return res.json();
};

export default function ScanScreen({ navigation }) {
    const [scanMode, setScanMode] = useState('food'); // 'food' | 'ingredient'
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState(null); // ảnh đã chụp/chọn
    const [isLoading, setIsLoading] = useState(false);
    const [detectedLabel, setDetectedLabel] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [noMatch, setNoMatch] = useState(false);

    const cameraRef = useRef(null);

    // ─── Xin quyền camera ngay khi mount ─────────────────────────────────────
    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, []);

    // ─── Reset khi đổi mode ───────────────────────────────────────────────────
    const handleModeChange = (mode) => {
        setScanMode(mode);
        setCapturedImage(null);
        setDetectedLabel(null);
        setRecommendations([]);
        setNoMatch(false);
    };

    // ─── Chụp ảnh từ live camera ─────────────────────────────────────────────
    const handleShutter = useCallback(async () => {
        if (!cameraRef.current || capturedImage) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });
            setCapturedImage({ uri: photo.uri, mimeType: 'image/jpeg', fileName: 'photo.jpg' });
            setDetectedLabel(null);
            setRecommendations([]);
            setNoMatch(false);
            await processImage({ uri: photo.uri, mimeType: 'image/jpeg', fileName: 'photo.jpg' });
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        }
    }, [capturedImage, scanMode]);

    // ─── Mở Gallery ──────────────────────────────────────────────────────────
    const handleGallery = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền truy cập', 'Cần cấp quyền thư viện ảnh.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            setCapturedImage(asset);
            setDetectedLabel(null);
            setRecommendations([]);
            setNoMatch(false);
            await processImage(asset);
        }
    }, [scanMode]);

    // ─── Chụp lại ─────────────────────────────────────────────────────────────
    const handleRetake = () => {
        setCapturedImage(null);
        setDetectedLabel(null);
        setRecommendations([]);
        setNoMatch(false);
    };

    // ─── Xử lý ảnh ────────────────────────────────────────────────────────────
    const processImage = async (asset) => {
        setIsLoading(true);
        setNoMatch(false);
        try {
            if (scanMode === 'ingredient') {
                await scanIngredient(asset);
            } else {
                await scanFood(asset);
            }
        } catch (err) {
            console.error('processImage error:', err);
            Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.');
            setNoMatch(true);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Scan Ingredient: 2 bước ─────────────────────────────────────────────
    const scanIngredient = async (asset) => {
        const formData = new FormData();
        formData.append('image', {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || 'photo.jpg',
        });

        const detectRes = await fetch(`${API_URL}/api/detect/detect-objects`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const detectData = await safeJson(detectRes);
        const detected = detectData?.detected_objects || [];

        if (!detected.length) { setNoMatch(true); return; }
        setDetectedLabel(detected[0]);

        const recRes = await fetch(`${API_URL}/api/detect/recommend-recipes-spoonacular`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detected_objects: detected }),
        });
        const recData = await safeJson(recRes);
        const recs = recData?.recommendations || [];

        recs.length ? setRecommendations(recs) : setNoMatch(true);
    };

    // ─── Scan Food: 1 bước kết hợp (cần JWT) ───────────────────────────────
    const scanFood = async (asset) => {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
            Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để sử dụng Scan Food.', [
                { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
                { text: 'Huỷ', style: 'cancel' },
            ]);
            setNoMatch(true);
            return;
        }

        const formData = new FormData();
        formData.append('image', {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || 'photo.jpg',
        });

        const res = await fetch(`${API_URL}/api/detect/detect-recommend-spoonacular`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại.', [
                { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
                { text: 'Huỷ', style: 'cancel' },
            ]);
            setNoMatch(true);
            return;
        }

        const data = await safeJson(res);
        if (!data) { setNoMatch(true); return; }
        const detected = data?.detected_objects || [];
        const recs = data?.recommendations || [];

        if (!detected.length) { setNoMatch(true); return; }
        setDetectedLabel(detected[0]);
        recs.length ? setRecommendations(recs) : setNoMatch(true);
    };

    // ─── Navigate sang ScanResultRecipes ─────────────────────────────────────
    const handleBadgePress = () => {
        navigation.navigate('ScanResultRecipes', {
            query: detectedLabel,
            recipes: recommendations,
        });
    };

    // ─── Render vùng camera / preview ────────────────────────────────────────
    const renderCameraArea = () => {
        // Đã chụp / chọn ảnh → hiển thị ảnh tĩnh
        if (capturedImage) {
            return (
                <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
            );
        }

        // Chưa cấp quyền
        if (!permission) {
            return (
                <View style={styles.previewPlaceholder}>
                    <ActivityIndicator size="small" color="#3F805A" />
                </View>
            );
        }
        if (!permission.granted) {
            return (
                <View style={styles.previewPlaceholder}>
                    <Ionicons name="camera-off-outline" size={44} color="#bbb" />
                    <Text style={styles.previewPlaceholderText}>Chưa cấp quyền camera</Text>
                    <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                        <Text style={styles.grantBtnText}>Cấp quyền</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Live camera feed
        return (
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
            />
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            {/* Header */}
            <View style={styles.header}>
                <Image source={require('../../assets/Food.png')} style={styles.avatar} />
                <Text style={styles.headerTitle}>Scan</Text>
                <TouchableOpacity>
                    <Ionicons name="search-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tab Toggle */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleBtn, scanMode === 'food' && styles.toggleBtnActive]}
                    onPress={() => handleModeChange('food')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.toggleText, scanMode === 'food' && styles.toggleTextActive]}>
                        Scan Food
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, scanMode === 'ingredient' && styles.toggleBtnActive]}
                    onPress={() => handleModeChange('ingredient')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.toggleText, scanMode === 'ingredient' && styles.toggleTextActive]}>
                        Scan Ingredient
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Camera / Preview Area */}
            <View style={styles.previewContainer}>
                {renderCameraArea()}

                {/* Loading overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Đang phân tích...</Text>
                    </View>
                )}

                {/* Nút chụp lại (khi đã có ảnh) */}
                {capturedImage && !isLoading && (
                    <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                        <Ionicons name="refresh-outline" size={18} color="#fff" />
                        <Text style={styles.retakeBtnText}>Chụp lại</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Tên nhận diện */}
            {!isLoading && detectedLabel && (
                <Text style={styles.detectedLabel}>{capitalize(detectedLabel)}</Text>
            )}

            {/* Badge vàng */}
            {!isLoading && recommendations.length > 0 && (
                <TouchableOpacity style={styles.badgeYellow} onPress={handleBadgePress} activeOpacity={0.8}>
                    <Ionicons name="search-outline" size={20} color="#B7791F" />
                    <View style={styles.badgeTextBlock}>
                        <Text style={styles.badgeTitleYellow}>
                            {scanMode === 'ingredient'
                                ? 'Find recipes with this ingredient'
                                : 'Find recipes with this food'}
                        </Text>
                        <Text style={styles.badgeSubYellow}>{recommendations.length} recipes found</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#B7791F" />
                </TouchableOpacity>
            )}

            {/* Badge đỏ */}
            {!isLoading && noMatch && (
                <View style={styles.badgeRed}>
                    <Ionicons name="close-circle-outline" size={20} color="#C53030" />
                    <Text style={styles.badgeTitleRed}>Không có kết quả trùng khớp</Text>
                </View>
            )}

            {/* Bottom Controls: Gallery + Shutter */}
            <View style={styles.bottomControls}>
                <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery} activeOpacity={0.75}>
                    <Ionicons name="image-outline" size={26} color="#3F805A" />
                    <Text style={styles.galleryLabel}>Gallery</Text>
                </TouchableOpacity>

                {/* Nút chụp — ẩn khi đã có ảnh */}
                {!capturedImage ? (
                    <TouchableOpacity style={styles.shutterBtn} onPress={handleShutter} activeOpacity={0.85}>
                        <View style={styles.shutterInner} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.shutterBtnDisabled} />
                )}

                <View style={{ width: 70 }} />
            </View>
        </SafeAreaView>
    );
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ddd' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },

    // ── Toggle ──
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EAECEE',
        marginHorizontal: 20,
        borderRadius: 30,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 26,
        alignItems: 'center',
    },
    toggleBtnActive: { backgroundColor: '#3F805A' },
    toggleText: { fontSize: 14, fontWeight: '600', color: '#3F805A' },
    toggleTextActive: { color: '#fff' },

    // ── Camera / Preview ──
    previewContainer: {
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#D9D9D9',
        height: width * 0.82,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    previewPlaceholder: {
        alignItems: 'center',
        gap: 12,
    },
    previewPlaceholderText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    grantBtn: {
        marginTop: 4,
        backgroundColor: '#3F805A',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    grantBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    // Loading overlay
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    // Retake button (nằm góc dưới preview)
    retakeBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    retakeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    // ── Detected Label ──
    detectedLabel: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginHorizontal: 20,
        marginTop: 14,
    },

    // ── Badge Vàng ──
    badgeYellow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEA',
        borderWidth: 1,
        borderColor: '#F6E05E',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    badgeTextBlock: { flex: 1 },
    badgeTitleYellow: { fontSize: 14, fontWeight: '600', color: '#744210' },
    badgeSubYellow: { fontSize: 12, color: '#B7791F', marginTop: 2 },

    // ── Badge Đỏ ──
    badgeRed: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FEB2B2',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    badgeTitleRed: { fontSize: 14, fontWeight: '600', color: '#C53030', flex: 1 },

    // ── Bottom Controls ──
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 'auto',
        paddingBottom: Platform.OS === 'ios' ? 10 : 20,
        paddingTop: 14,
    },
    galleryBtn: { alignItems: 'center', width: 70 },
    galleryLabel: { fontSize: 11, color: '#3F805A', marginTop: 4, fontWeight: '500' },
    shutterBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#3F805A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3F805A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
    },
    shutterInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#3F805A',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    shutterBtnDisabled: { width: 70, height: 70 },
});
