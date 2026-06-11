import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Animated,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function AddDiaryScreen({ navigation }) {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState(0);
    const [mealType, setMealType] = useState('Breakfast');
    const [dropdownItems] = useState([
        { label: 'Breakfast', value: 'Breakfast' },
        { label: 'Lunch', value: 'Lunch' },
        { label: 'Dinner', value: 'Dinner' },
        { label: 'Snack', value: 'Snack' }
    ]);

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Gemini validation state
    const [validating, setValidating] = useState(false);
    const [validResult, setValidResult] = useState(null);
    const [validError, setValidError] = useState(null);
    const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
    const macrosRef = useRef({ protein: 0, carbs: 0, fat: 0 });

    // Debounce ref để auto-validate khi cả ảnh và tên đều có
    const validateTimerRef = useRef(null);

    // ── Auto-validate khi có đủ ảnh + tên ───────────────────────────────────────
    useEffect(() => {
        if (!image || !mealName.trim()) return;

        // Debounce 800ms sau khi ngừng gõ
        if (validateTimerRef.current) clearTimeout(validateTimerRef.current);
        validateTimerRef.current = setTimeout(() => {
            runGeminiValidation(image, mealName.trim());
        }, 800);

        return () => {
            if (validateTimerRef.current) clearTimeout(validateTimerRef.current);
        };
    }, [image, mealName]);

    const runGeminiValidation = async (imgObj, name) => {
        setValidating(true);
        setValidResult(null);
        setValidError(null);
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) return;

            const formData = new FormData();
            formData.append('meal_name', name);
            formData.append('image', {
                uri: imgObj.uri,
                name: imgObj.fileName || `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const res = await fetch(`${API_URL}/api/diary/validate-food`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setValidResult(data);
                if (data.is_match) {
                    if (data.calories_estimate > 0) setCalories(Math.round(data.calories_estimate));
                    const newMacros = {
                        protein: data.protein_g || 0,
                        carbs: data.carbs_g || 0,
                        fat: data.fat_g || 0,
                    };
                    setMacros(newMacros);
                    macrosRef.current = newMacros;
                    if (errors.calories) setErrors((e) => ({ ...e, calories: null }));
                } else {
                    const zeroMacros = { protein: 0, carbs: 0, fat: 0 };
                    setMacros(zeroMacros);
                    macrosRef.current = zeroMacros;
                }
            } else {
                setValidError(data.error || 'Không thể xác thực. Vui lòng thử lại.');
            }
        } catch (err) {
            console.warn('Gemini validation error:', err.message);
            setValidError('Lỗi kết nối khi xác thực. Kiểm tra server.');
        } finally {
            setValidating(false);
        }
    };

    // ── Calorie stepper ───────────────────────────────────────────────────────────
    const increment = () => setCalories((c) => (typeof c === 'number' ? c : 0) + 10);
    const decrement = () => setCalories((c) => Math.max(0, (typeof c === 'number' ? c : 0) - 10));
    const handleCaloriesText = (text) => {
        const num = parseInt(text, 10);
        setCalories(isNaN(num) ? 0 : num);
        if (errors.calories) setErrors((e) => ({ ...e, calories: null }));
    };

    // ── Image picker logic ──────────────────────────────────────────────────────
    const handleImageResult = (result) => {
        setShowImagePicker(false);
        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            setImage({ uri: asset.uri, fileName: asset.fileName || 'photo.jpg' });
            setValidResult(null);
            if (errors.image) setErrors((e) => ({ ...e, image: null }));
        }
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setShowImagePicker(false);
            Alert.alert('Permission required', 'Please allow access to your camera.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
        });
        handleImageResult(result);
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setShowImagePicker(false);
            Alert.alert('Permission required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
        });
        handleImageResult(result);
    };

    const pickImage = () => {
        setShowImagePicker(true);
    };

    // ── Validate trước khi submit ─────────────────────────────────────────────────
    const validate = () => {
        const newErrors = {};
        if (!mealName.trim()) newErrors.mealName = 'Please enter the meal name.';
        if (!calories || calories <= 0) newErrors.calories = 'Calories must be greater than 0.';
        if (!image) newErrors.image = 'Please upload an image of your meal.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────────
    const handleAddToDiary = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) { Alert.alert('Error', 'Please log in again.'); return; }

            const currentMacros = macrosRef.current;

            const formData = new FormData();
            formData.append('meal_name', mealName.trim());
            formData.append('meal_type', mealType);
            formData.append('calories', String(calories));
            formData.append('protein_g', String(currentMacros.protein));
            formData.append('carbs_g', String(currentMacros.carbs));
            formData.append('fat_g', String(currentMacros.fat));
            formData.append('image', {
                uri: image.uri,
                name: image.fileName || `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            console.log('[AddDiary] macros:', currentMacros, 'calories:', calories);

            const res = await fetch(`${API_URL}/api/diary/add`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                Alert.alert('Success 🎉', 'Meal added to Diary!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                const msg = data.errors ? data.errors.join('\n') : (data.error || 'Failed to add entry.');
                Alert.alert('Error', msg);
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Render validation badge ───────────────────────────────────────────────────
    const renderValidationBadge = () => {
        if (validating) {
            return (
                <View style={styles.validatingRow}>
                    <ActivityIndicator size="small" color="#3F805A" />
                    <Text style={styles.validatingText}> Đang xác thực món ăn với Gemini AI…</Text>
                </View>
            );
        }
        if (!validResult) return null;
        const matched = validResult.is_match;
        return (
            <View style={[styles.validBadge, matched ? styles.validBadgeGreen : styles.validBadgeRed]}>
                <Ionicons name={matched ? 'checkmark-circle' : 'close-circle'} size={18} color={matched ? '#3F805A' : '#EF4444'} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.validBadgeTitle, { color: matched ? '#3F805A' : '#EF4444' }]}>
                        {matched ? `Khớp – ${validResult.detected_food}` : `Không trùng – ${validResult.detected_food}`}
                    </Text>
                    <Text style={styles.validBadgeMsg}>{validResult.message}</Text>
                </View>
            </View>
        );
    };

    // ── Render macro preview ──────────────────────────────────────────────────────
    const renderMacroBadges = () => {
        if (!validResult?.is_match) return null;
        return (
            <View style={styles.macroRow}>
                {[
                    { label: 'Protein', val: macros.protein, color: '#FFC107' },
                    { label: 'Carbs', val: macros.carbs, color: '#FF7043' },
                    { label: 'Fat', val: macros.fat, color: '#66BB6A' },
                ].map(({ label, val, color }) => (
                    <View key={label} style={[styles.macroBadge, { borderColor: color }]}>
                        <Text style={[styles.macroVal, { color }]}>{Math.round(val)}g</Text>
                        <Text style={styles.macroLabel}>{label}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Diary</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Manual Entry</Text>
                <Text style={styles.subTitle}>TOTAL CALORIES</Text>

                {/* Calories Stepper */}
                <View style={styles.calorieRow}>
                    <TouchableOpacity onPress={decrement} style={styles.stepperBtn}>
                        <Ionicons name="remove" size={20} color="#3F805A" />
                    </TouchableOpacity>

                    <View style={styles.calorieCenter}>
                        <TextInput
                            style={styles.calorieInput}
                            keyboardType="numeric"
                            value={String(calories)}
                            onChangeText={handleCaloriesText}
                        />
                        <Text style={styles.kcalLabel}>Kcal</Text>
                    </View>

                    <TouchableOpacity onPress={increment} style={styles.stepperBtn}>
                        <Ionicons name="add" size={20} color="#3F805A" />
                    </TouchableOpacity>
                </View>
                {errors.calories && <Text style={styles.errorText}>{errors.calories}</Text>}

                {/* Meal Name */}
                <Text style={styles.label}>Meal Name</Text>
                <TextInput
                    style={[styles.textInput, errors.mealName && styles.inputError]}
                    placeholder="e.g., Salad"
                    placeholderTextColor="#aaa"
                    value={mealName}
                    onChangeText={(t) => {
                        setMealName(t);
                        if (errors.mealName) setErrors((e) => ({ ...e, mealName: null }));
                    }}
                />
                {errors.mealName && <Text style={styles.errorText}>{errors.mealName}</Text>}

                {/* Meal Type chips -> Dropdown */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Dropdown
                        style={styles.dropdownStyle}
                        data={dropdownItems}
                        labelField="label"
                        valueField="value"
                        value={mealType}
                        onChange={item => {
                            setMealType(item.value);
                        }}
                        selectedTextStyle={styles.dropdownText}
                        itemTextStyle={styles.dropdownText}
                    />
                </View>

                {/* Image Upload */}
                <Text style={styles.label}>
                    Image <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                    style={[styles.imageUploadBox, errors.image && styles.imageUploadBoxError]}
                    onPress={pickImage}
                    activeOpacity={0.7}
                >
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="camera-outline" size={36} color="#ccc" />
                            <Text style={styles.uploadHintText}>Tap to upload photo</Text>
                            <Text style={styles.uploadSubText}>(Required)</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                {image && (
                    <TouchableOpacity onPress={pickImage} style={styles.changeImageBtn}>
                        <Ionicons name="refresh-outline" size={14} color="#3F805A" />
                        <Text style={styles.changeImageText}> Change image</Text>
                    </TouchableOpacity>
                )}

                {/* Gemini Validation Result */}
                {renderValidationBadge()}
                {/* Gemini error (validate lỗi mạng hoặc server) */}
                {validError && !validating && (
                    <View style={styles.validErrBox}>
                        <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                        <Text style={styles.validErrText}> {validError}</Text>
                    </View>
                )}
                {renderMacroBadges()}

                {/* Notice nếu không khớp */}
                {validResult && !validResult.is_match && (
                    <Text style={styles.mismatchNote}>
                        ⚠️ Tên món không khớp với ảnh. Bạn vẫn có thể thêm nhưng calo sẽ tự nhập.
                    </Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addBtn, loading && { opacity: 0.7 }]}
                        onPress={handleAddToDiary}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.addBtnText}>Add to Diary</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Image Picker Modal */}
            <Modal
                visible={showImagePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImagePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Upload Photo</Text>
                        <Text style={styles.modalSubtitle}>Take a photo or choose from your library</Text>

                        <TouchableOpacity style={styles.modalBtnPrimary} onPress={openCamera}>
                            <Ionicons name="camera" size={20} color="#fff" />
                            <Text style={styles.modalBtnTextPrimary}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalBtnPrimary} onPress={openGallery}>
                            <Ionicons name="images" size={20} color="#fff" />
                            <Text style={styles.modalBtnTextPrimary}>Library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowImagePicker(false)}>
                            <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    backBtn: { padding: 6 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    content: { padding: 24, paddingBottom: 60 },

    sectionTitle: {
        fontSize: 22, fontWeight: 'bold', color: '#F59E0B', textAlign: 'center', marginBottom: 4,
    },
    subTitle: {
        fontSize: 11, color: '#aaa', letterSpacing: 1.2, textAlign: 'center', marginBottom: 16,
    },

    // Stepper
    calorieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    calorieCenter: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20 },
    stepperBtn: {
        width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#3F805A',
        alignItems: 'center', justifyContent: 'center',
    },
    calorieInput: {
        fontSize: 40, fontWeight: 'bold', color: '#111', textAlign: 'center', paddingHorizontal: 4,
    },
    kcalLabel: { fontSize: 18, color: '#888', marginLeft: 4, alignSelf: 'center' },

    label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 22, marginBottom: 8 },
    requiredStar: { color: '#EF4444' },

    textInput: {
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#fff', color: '#111',
    },
    inputError: { borderColor: '#EF4444' },

    // Category Dropdown
    pickerContainer: { zIndex: 1, elevation: 1 },
    dropdownStyle: {
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 12,
        height: 50,
    },
    dropdownText: {
        fontSize: 15,
        color: '#111',
    },

    // Image
    imageUploadBox: {
        borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 16,
        height: 240, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa',
    },
    imageUploadBoxError: { borderColor: '#EF4444' },
    uploadPlaceholder: { alignItems: 'center', gap: 6 },
    uploadHintText: { fontSize: 14, color: '#bbb' },
    uploadSubText: { fontSize: 11, color: '#EF4444', fontWeight: '600' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    changeImageBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, alignSelf: 'flex-start' },
    changeImageText: { fontSize: 13, color: '#3F805A', fontWeight: '600' },

    // Gemini validation badge
    validatingRow: {
        flexDirection: 'row', alignItems: 'center', marginTop: 14,
        backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10,
    },
    validatingText: { fontSize: 13, color: '#3F805A' },
    validBadge: {
        flexDirection: 'row', alignItems: 'flex-start', marginTop: 14,
        borderRadius: 12, padding: 12, borderWidth: 1,
    },
    validBadgeGreen: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
    validBadgeRed: { backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' },
    validBadgeTitle: { fontSize: 13, fontWeight: '700' },
    validBadgeMsg: { fontSize: 12, color: '#666', marginTop: 2 },

    // Gemini error box
    validErrBox: {
        flexDirection: 'row', alignItems: 'center', marginTop: 12,
        backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FDE68A',
    },
    validErrText: { fontSize: 12, color: '#92400E', flex: 1 },

    // Macro preview
    macroRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    macroBadge: {
        flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
        borderWidth: 1.5, backgroundColor: '#fff',
    },
    macroVal: { fontSize: 16, fontWeight: '800' },
    macroLabel: { fontSize: 11, color: '#888', marginTop: 2 },

    mismatchNote: { fontSize: 12, color: '#F59E0B', marginTop: 10, lineHeight: 18 },

    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },

    actionRow: { flexDirection: 'row', gap: 14, marginTop: 36 },
    cancelBtn: {
        flex: 1, borderWidth: 1.5, borderColor: '#3F805A',
        borderRadius: 30, paddingVertical: 14, alignItems: 'center',
    },
    cancelBtnText: { color: '#3F805A', fontWeight: '700', fontSize: 15 },
    addBtn: {
        flex: 1, backgroundColor: '#3F805A',
        borderRadius: 30, paddingVertical: 14, alignItems: 'center',
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: '#3F805A',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalBtnPrimary: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#3F805A',
        borderRadius: 12,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    modalBtnTextPrimary: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalBtnSecondary: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#3F805A',
    },
    modalBtnTextSecondary: {
        color: '#3F805A',
        fontSize: 16,
        fontWeight: '600',
    },
});
