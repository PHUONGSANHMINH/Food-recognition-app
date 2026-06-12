import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Modal,
    StatusBar,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AddRecipeContributionScreen = () => {
    const navigation = useNavigation();
    const [showNutritionForm, setShowNutritionForm] = useState(false);
    const [recipeName, setRecipeName] = useState('');
    const [mainImage, setMainImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successModalMsg, setSuccessModalMsg] = useState('');
    const [shouldGoBack, setShouldGoBack] = useState(false);
    const [ingredients, setIngredients] = useState([{ name_ingredient: '', quantity: '', unit: '' }]);
    const [steps, setSteps] = useState([{ step_number: 1, content: '' }]);
    const [nutrition, setNutrition] = useState({
        calories: null,
        protein: null,
        carbohydrates: null,
        fat: null,
        fiber: null,
        sugar: null,
        sodium: null,
    });
    const [vitamins, setVitamins] = useState([{
        calcium: null, iron: null, vitamin_a: null, vitamin_c: null, vitamin_d: null,
        vitamin_e: null, vitamin_k: null, vitamin_b1: null, vitamin_b2: null,
        vitamin_b3: null, vitamin_b5: null, vitamin_b6: null, vitamin_b12: null
    }]);

    const handleImageResult = (result) => {
        setShowImagePicker(false);
        if (!result.canceled && result.assets?.length > 0) {
            setMainImage(result.assets[0].uri);
        }
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setShowImagePicker(false);
            setSuccessModalMsg('Please allow access to your camera.');
            setShouldGoBack(false);
            setShowSuccessModal(true);
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
            setSuccessModalMsg('Please allow access to your photo library.');
            setShouldGoBack(false);
            setShowSuccessModal(true);
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

    const handleImagePicker = () => {
        setShowImagePicker(true);
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const removeStep = (index) => {
        const updatedSteps = steps.filter((_, i) => i !== index).map((s, i) => ({
            ...s,
            step_number: i + 1,
        }));
        setSteps(updatedSteps);
    };

    const submitRecipe = async () => {
        if (!recipeName.trim() || ingredients.length === 0 || steps.length === 0) {
            setSuccessModalMsg('Please fill in all basic fields (Name, Ingredients, and Steps).');
            setShouldGoBack(false);
            setShowSuccessModal(true);
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            const formData = new FormData();

            if (mainImage) {
                formData.append('image', {
                    uri: mainImage,
                    name: 'recipe_image.jpg',
                    type: 'image/jpeg'
                });
            }

            const recipeData = {
                name_recipe: recipeName,
                type: 'General',
                summary: '',
                status: 'Pending',
                ingredients: ingredients.filter(ing => ing.name_ingredient && ing.quantity),
                steps: steps.filter(s => s.content.trim() !== ''),
                nutrition,
                vitamins: [vitamins[0]]
            };

            formData.append('recipe_data', JSON.stringify(recipeData));

            const response = await fetch(`${API_URL}/api/recipe/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setSuccessModalMsg('Recipe contribution submitted! Thank you for sharing. 🎉');
                setShouldGoBack(true);
                setShowSuccessModal(true);
            } else {
                const result = await response.json();
                setSuccessModalMsg(result.message || 'Failed to submit recipe. Please try again.');
                setShouldGoBack(false);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSuccessModalMsg('Connection error. Please check your internet and try again.');
            setShouldGoBack(false);
            setShowSuccessModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.statusBarBg} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contribute Recipe</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        <TouchableOpacity onPress={handleImagePicker} style={styles.imagePicker}>
                            {mainImage ? (
                                <Image source={{ uri: mainImage }} style={styles.imagePreview} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera" size={48} color="#3F805A" />
                                    <Text style={styles.imagePlaceholderText}>Add Main Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Recipe Name"
                            value={recipeName}
                            onChangeText={setRecipeName}
                        />

                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        {ingredients.map((ing, idx) => (
                            <View key={idx} style={styles.ingredientCard}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemHeaderText}>Ingredient #{idx + 1}</Text>
                                    <TouchableOpacity onPress={() => removeIngredient(idx)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.ingredientRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 2, marginBottom: 0, marginRight: 8 }]}
                                        placeholder="Name"
                                        value={ing.name_ingredient}
                                        onChangeText={(t) => {
                                            const list = [...ingredients];
                                            list[idx].name_ingredient = t;
                                            setIngredients(list);
                                        }}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
                                        placeholder="Qty"
                                        keyboardType="numeric"
                                        value={ing.quantity}
                                        onChangeText={(t) => {
                                            const list = [...ingredients];
                                            list[idx].quantity = t;
                                            setIngredients(list);
                                        }}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Unit"
                                        value={ing.unit}
                                        onChangeText={(t) => {
                                            const list = [...ingredients];
                                            list[idx].unit = t;
                                            setIngredients(list);
                                        }}
                                    />
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => setIngredients([...ingredients, { name_ingredient: '', quantity: '', unit: '' }])}
                        >
                            <Text style={styles.addBtnText}>+ Add Ingredient</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Preparation Steps</Text>
                        {steps.map((step, idx) => (
                            <View key={idx} style={styles.stepCard}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemHeaderText}>Step {idx + 1}</Text>
                                    <TouchableOpacity onPress={() => removeStep(idx)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.multilineInput}
                                    placeholder="How to cook..."
                                    multiline
                                    value={step.content}
                                    onChangeText={(t) => {
                                        const list = [...steps];
                                        list[idx].content = t;
                                        setSteps(list);
                                    }}
                                />
                            </View>
                        ))}
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => setSteps([...steps, { step_number: steps.length + 1, content: '' }])}
                        >
                            <Text style={styles.addBtnText}>+ Add Step</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.expandRow}
                            onPress={() => setShowNutritionForm(!showNutritionForm)}
                        >
                            <Text style={styles.expandLabel}>Nutrition Facts (Optional)</Text>
                            <Ionicons name={showNutritionForm ? "chevron-up" : "chevron-down"} size={20} color="#3F805A" />
                        </TouchableOpacity>
                        {showNutritionForm && (
                            <View style={styles.extraForm}>
                                {['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium'].map((key) => (
                                    <View key={key} style={styles.formRow}>
                                        <Text style={styles.formLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                                        <TextInput
                                            style={styles.smallInput}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            value={nutrition[key]?.toString()}
                                            onChangeText={(t) => setNutrition({ ...nutrition, [key]: t ? parseFloat(t) : null })}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                            onPress={submitRecipe}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Contribution</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>

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

                <Modal
                    transparent visible={showSuccessModal}
                    animationType="fade"
                    onRequestClose={() => {
                        setShowSuccessModal(false);
                        if (shouldGoBack) navigation.goBack();
                    }}
                >
                    <View style={styles.alertOverlay}>
                        <View style={styles.alertBox}>
                            <Text style={styles.alertMsg}>{successModalMsg}</Text>
                            <TouchableOpacity
                                style={styles.alertBtn}
                                onPress={() => {
                                    setShowSuccessModal(false);
                                    if (shouldGoBack) navigation.goBack();
                                }}
                            >
                                <Text style={styles.alertBtnText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    statusBarBg: {
        height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    scrollContent: { paddingBottom: 40 },
    formContainer: { padding: 16 },
    imagePicker: { alignItems: 'center', marginBottom: 20 },
    imagePreview: { width: '100%', height: 200, borderRadius: 12 },
    imagePlaceholder: {
        width: '100%', height: 200, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed',
        borderColor: '#3F805A', backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center'
    },
    imagePlaceholderText: { marginTop: 8, color: '#3F805A', fontWeight: '600' },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
        padding: 12, fontSize: 16, marginBottom: 12, color: '#111827'
    },
    multilineInput: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
        padding: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top', color: '#111827'
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 24, marginBottom: 16 },
    ingredientCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    itemHeaderText: { fontSize: 15, fontWeight: '600', color: '#3F805A' },
    ingredientRow: { flexDirection: 'row', marginBottom: 12 },
    addBtn: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#3F805A', marginBottom: 16 },
    addBtnText: { color: '#3F805A', fontWeight: 'bold' },
    stepCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
    expandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 12 },
    expandLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
    extraForm: { backgroundColor: '#fff', padding: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderTopWidth: 1, borderColor: '#F3F4F6' },
    formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    formLabel: { fontSize: 15, color: '#4B5563' },
    smallInput: { width: 80, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, textAlign: 'right' },
    submitBtn: { backgroundColor: '#3F805A', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32, elevation: 4 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 2, borderColor: '#3F805A', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
    modalBtnPrimary: { flexDirection: 'row', width: '100%', backgroundColor: '#3F805A', borderRadius: 12, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12, gap: 8 },
    modalBtnTextPrimary: { color: '#fff', fontSize: 16, fontWeight: '600' },
    modalBtnSecondary: { width: '100%', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#3F805A' },
    modalBtnTextSecondary: { color: '#3F805A', fontSize: 16, fontWeight: '600' },
    alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    alertBox: { width: '80%', backgroundColor: '#fff', borderRadius: 15, borderWidth: 2, borderColor: '#3F805A', padding: 24, alignItems: 'center', elevation: 5 },
    alertMsg: { fontSize: 16, fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
    alertBtn: { backgroundColor: '#3F805A', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8, minWidth: 100, alignItems: 'center' },
    alertBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});

export default AddRecipeContributionScreen;
