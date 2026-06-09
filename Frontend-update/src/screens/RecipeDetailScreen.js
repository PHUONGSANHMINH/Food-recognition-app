import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    Image, TouchableOpacity, Modal, Platform, StatusBar,
    ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// Helper image URI
const toImageUri = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // DB lưu chỉ filename (VD: butter_chicken.jpg), file nằm trong uploads/recipes/
    if (path.includes('/')) {
        return `${API_URL}/api/file/get-file/${path}`;
    }
    return `${API_URL}/api/file/get-file/recipes/${path}`;
};

export default function RecipeDetailScreen({ route, navigation }) {
    const { recipe: initRecipe } = route.params || {};
    const [recipe, setRecipe] = useState(initRecipe || null);
    const [loading, setLoading] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [showMealModal, setShowMealModal] = useState(false);

    // Nếu là recipe nội bộ (có id_recipe), fetch đầy đủ chi tiết
    useEffect(() => {
        const rid = initRecipe?.id_recipe;
        if (!rid) return;  // Spoonacular recipe đã có đủ data

        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/recipe/${rid}`);
                if (!res.ok) return;
                const data = await res.json();
                // Chuẩn hóa structure để dùng chung với Spoonacular format
                setRecipe({
                    ...data,
                    // Cho RecipeDetailScreen đọc được
                    title: data.name_recipe,
                    image: toImageUri(data.image),
                    calories: data.nutrition?.calories ?? initRecipe?.calories,
                    // ingredients đã là array [{name_ingredient, quantity, unit}]
                    // steps → map sang {step_number, instruction}
                    instructions: (data.steps || []).map(s => ({
                        step_number: s.step_number,
                        instruction: s.content,
                    })),
                    // nutrients → từ nutrition object → array giống Spoonacular
                    nutrients: data.nutrition ? [
                        { name: 'Protein', amount: data.nutrition.protein, unit: 'g' },
                        { name: 'Carbohydrates', amount: data.nutrition.carbohydrates, unit: 'g' },
                        { name: 'Fat', amount: data.nutrition.fat, unit: 'g' },
                        { name: 'Fiber', amount: data.vitamins?.fiber, unit: 'g' },
                        { name: 'Sugar', amount: data.nutrition.sugar, unit: 'g' },
                        { name: 'Sodium', amount: data.nutrition.sodium, unit: 'mg' },
                    ] : [],
                });
            } catch {
                /* giữ nguyên initRecipe */
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, []);

    if (!recipe) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
                    Không có dữ liệu công thức.
                </Text>
            </SafeAreaView>
        );
    }

    const title = recipe.title || recipe.name_recipe || 'Unnamed Recipe';
    const imageUrl = recipe.image ? toImageUri(recipe.image) : null;
    const calories = recipe.calories ?? recipe.nutrition?.calories ?? null;
    const nutrients = Array.isArray(recipe.nutrients) ? recipe.nutrients : [];
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

    const getNutrient = (name) => {
        const found = nutrients.find(n => n.name?.toLowerCase() === name.toLowerCase());
        return found ? `${Math.round(found.amount || 0)}${found.unit || 'g'}` : '—';
    };

    // ── Favourite (nội bộ hoặc Spoonacular) ──────────────────────────────────
    const handleFavourite = async () => {
        try {
            setFavLoading(true);
            const token = await AsyncStorage.getItem('access_token');
            if (!token) { Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập.'); return; }

            let res;
            if (recipe.id_recipe) {
                // Internal recipe
                res = await fetch(`${API_URL}/api/recipe/${recipe.id_recipe}/favourite`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Spoonacular recipe
                res = await fetch(`${API_URL}/api/detect/favourite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ spoonacular_id: recipe.id, title, image: imageUrl }),
                });
            }
            const data = await res.json();
            if (res.ok) {
                setIsFavourite(data.is_favourite);
                Alert.alert('', data.msg);
            } else {
                Alert.alert('Lỗi', data.msg || 'Không thể cập nhật yêu thích.');
            }
        } catch {
            Alert.alert('Lỗi', 'Không thể kết nối server.');
        } finally {
            setFavLoading(false);
        }
    };

    // ── Save Recipe ───────────────────────────────────────────────────────────
    const handleSaveRecipe = async (mealType) => {
        setShowMealModal(false);
        try {
            setSaveLoading(true);
            const token = await AsyncStorage.getItem('access_token');
            if (!token) { Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập.'); return; }

            const proteinN = nutrients.find(n => n.name?.toLowerCase() === 'protein');
            const carbsN = nutrients.find(n => n.name?.toLowerCase() === 'carbohydrates');
            const fatN = nutrients.find(n => n.name?.toLowerCase() === 'fat');

            const res = await fetch(`${API_URL}/api/detect/save-recipe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title,
                    calories: parseFloat(calories) || 0,
                    protein: proteinN ? parseFloat(proteinN.amount) : (recipe.nutrition?.protein || 0),
                    carbs: carbsN ? parseFloat(carbsN.amount) : (recipe.nutrition?.carbohydrates || 0),
                    fat: fatN ? parseFloat(fatN.amount) : (recipe.nutrition?.fat || 0),
                    image: imageUrl,
                    meal_type: mealType,
                    entry_date: new Date().toISOString().split('T')[0],
                }),
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert('✅ Đã lưu', `"${title}" đã được thêm vào ${mealType}.`);
            } else {
                Alert.alert('Lỗi', data.msg || 'Không thể lưu công thức.');
            }
        } catch {
            Alert.alert('Lỗi', 'Không thể kết nối server.');
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={26} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#3F805A" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Hero Card */}
                <View style={styles.heroCard}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroImage, styles.heroImageFallback]}>
                            <Ionicons name="restaurant-outline" size={48} color="#bbb" />
                        </View>
                    )}
                    <View style={styles.heroInfo}>
                        <Text style={styles.heroTitle}>{title}</Text>
                        {calories != null && (
                            <Text style={styles.heroCalories}>{Math.round(calories)} kcal</Text>
                        )}
                        <Text style={styles.heroMeta}>1 serving</Text>
                    </View>
                </View>

                {/* Nutrition Facts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                    {[
                        { label: 'Calories', value: calories != null ? `${Math.round(calories)} kcal` : '—' },
                        { label: 'Protein', value: getNutrient('Protein') },
                        { label: 'Carbs', value: getNutrient('Carbohydrates') },
                        { label: 'Fat', value: getNutrient('Fat') },
                        { label: 'Fiber', value: getNutrient('Fiber') },
                        { label: 'Sugar', value: getNutrient('Sugar') },
                        { label: 'Sodium', value: getNutrient('Sodium') },
                    ].map(({ label, value }) => (
                        <View key={label} style={styles.nutritionRow}>
                            <Text style={styles.nutritionLabel}>{label}</Text>
                            <Text style={styles.nutritionValue}>{value}</Text>
                        </View>
                    ))}
                </View>

                {/* Ingredients */}
                {ingredients.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <View style={styles.chipsWrap}>
                            {ingredients.map((ing, idx) => {
                                const name = typeof ing === 'string'
                                    ? ing
                                    : (ing.name || ing.name_ingredient || '');
                                if (!name) return null;
                                return (
                                    <View key={idx} style={styles.chip}>
                                        <Text style={styles.chipText}>{name}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Recipe Steps */}
                {instructions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recipe</Text>
                        {instructions.map((step, idx) => (
                            <View key={idx} style={styles.stepRow}>
                                <View style={[styles.stepNumber, idx === 0 && styles.stepNumberActive]}>
                                    <Text style={[styles.stepNumberText, idx === 0 && styles.stepNumberTextActive]}>
                                        {step.step_number || idx + 1}
                                    </Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepText}>
                                        {step.instruction || step.content || ''}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.footerBtn, styles.footerBtnOutline]}
                    onPress={handleFavourite}
                    disabled={favLoading}
                    activeOpacity={0.8}
                >
                    {favLoading ? (
                        <ActivityIndicator color="#3F805A" size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name={isFavourite ? 'heart' : 'heart-outline'}
                                size={18} color="#3F805A"
                            />
                            <Text style={styles.footerBtnOutlineText}>Add to Favorite</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.footerBtn, styles.footerBtnFill]}
                    onPress={() => setShowMealModal(true)}
                    disabled={saveLoading}
                    activeOpacity={0.8}
                >
                    {saveLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.footerBtnFillText}>Save Recipe</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Meal Type Modal */}
            <Modal
                transparent visible={showMealModal}
                animationType="slide"
                onRequestClose={() => setShowMealModal(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMealModal(false)}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Chọn bữa ăn</Text>
                        {MEAL_TYPES.map(mt => (
                            <TouchableOpacity key={mt} style={styles.modalOption} onPress={() => handleSaveRecipe(mt)}>
                                <Text style={styles.modalOptionText}>{mt.charAt(0).toUpperCase() + mt.slice(1)}</Text>
                                <Ionicons name="chevron-forward" size={18} color="#bbb" />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.modalOption, { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}
                            onPress={() => setShowMealModal(false)}
                        >
                            <Text style={[styles.modalOptionText, { color: '#999' }]}>Huỷ</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, backgroundColor: '#F5F7FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#F5F7FA',
    },
    backBtn: { width: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },

    scrollContent: { paddingBottom: 20 },

    // Hero Card
    heroCard: {
        flexDirection: 'row', backgroundColor: '#fff',
        margin: 16, borderRadius: 16, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
        padding: 12, gap: 12, alignItems: 'center',
    },
    heroImage: { width: 90, height: 90, borderRadius: 12, resizeMode: 'cover' },
    heroImageFallback: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    heroInfo: { flex: 1 },
    heroTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
    heroCalories: { fontSize: 20, fontWeight: 'bold', color: '#3F805A', marginBottom: 2 },
    heroMeta: { fontSize: 12, color: '#9ca3af' },

    // Section
    section: {
        backgroundColor: '#fff', marginHorizontal: 16,
        marginBottom: 14, borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 12 },

    // Nutrition
    nutritionRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F7FA',
    },
    nutritionLabel: { fontSize: 14, color: '#555' },
    nutritionValue: { fontSize: 14, fontWeight: '600', color: '#111' },

    // Ingredient Chips
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        backgroundColor: '#F0FFF4', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
        borderWidth: 1, borderColor: '#C6F6D5',
    },
    chipText: { fontSize: 13, color: '#276749', fontWeight: '500' },

    // Steps
    stepRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    stepNumber: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center', alignItems: 'center',
        flexShrink: 0, marginTop: 2,
    },
    stepNumberActive: { backgroundColor: '#3F805A' },
    stepNumberText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
    stepNumberTextActive: { color: '#fff' },
    stepContent: { flex: 1 },
    stepText: { fontSize: 14, color: '#444', lineHeight: 21 },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 20, paddingVertical: 14,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    footerBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', borderRadius: 30,
        paddingVertical: 14, gap: 6,
    },
    footerBtnOutline: { borderWidth: 1.5, borderColor: '#3F805A' },
    footerBtnOutlineText: { fontSize: 15, fontWeight: '600', color: '#3F805A' },
    footerBtnFill: { backgroundColor: '#3F805A' },
    footerBtnFillText: { fontSize: 15, fontWeight: '600', color: '#fff' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24,
        borderTopRightRadius: 24, paddingBottom: 30, paddingTop: 12,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
        alignSelf: 'center', marginBottom: 16,
    },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', paddingHorizontal: 20, marginBottom: 8 },
    modalOption: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    },
    modalOptionText: { fontSize: 15, color: '#333' },
});
