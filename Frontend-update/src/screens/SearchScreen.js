import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, Image,
    TouchableOpacity, TextInput, Platform, StatusBar,
    ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen({ navigation, route }) {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    // Track trạng thái favourite theo spoonacular_id
    const [favourites, setFavourites] = useState(new Set());

    const getImageUri = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}/files/${imagePath}`;
    };

    const handleSearch = useCallback(async (query) => {
        const q = (query || keyword).trim();
        if (!q) return;

        setLoading(true);
        setSearched(true);

        try {
            const token = await AsyncStorage.getItem('access_token');
            // Lưu vào search history
            if (token) {
                fetch(`${API_URL}/api/recipe/search-history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ keyword: q }),
                }).catch(() => { });
            }

            // Gọi song song: DB nội bộ + Spoonacular
            const [localRes, spoonacularRes] = await Promise.allSettled([
                fetch(`${API_URL}/api/recipe/get-recipes-publish?search=${encodeURIComponent(q)}&limit=30`),
                fetch(`${API_URL}/api/recipe/search-spoonacular?query=${encodeURIComponent(q)}&number=20`),
            ]);

            let localData = [];
            if (localRes.status === 'fulfilled' && localRes.value.ok) {
                const json = await localRes.value.json();
                localData = (Array.isArray(json) ? json : []).map(r => ({ ...r, source: 'local' }));
            }

            let spoonacularData = [];
            if (spoonacularRes.status === 'fulfilled' && spoonacularRes.value.ok) {
                const json = await spoonacularRes.value.json();
                spoonacularData = Array.isArray(json) ? json : [];
            }

            // Merge: DB recipe trước, Spoonacular sau
            setResults([...localData, ...spoonacularData]);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [keyword]);

    // Automatically search if initialKeyword is passed from history
    useEffect(() => {
        const { initialKeyword } = route.params || {};
        if (initialKeyword) {
            setKeyword(initialKeyword);
            handleSearch(initialKeyword);
        }
    }, [route.params]);

    // Khi nhấn card Spoonacular: fetch chi tiết rồi navigate sang RecipeDetailScreen
    const [loadingDetailId, setLoadingDetailId] = useState(null);

    const handleSpoonacularPress = useCallback(async (item) => {
        setLoadingDetailId(item.spoonacular_id);
        try {
            const detailRes = await fetch(`${API_URL}/api/recipe/spoonacular/${item.spoonacular_id}/full-details`);

            let instructions = [];
            let ingredients = [];
            let nutrients = [];
            let detailCalories = null;
            if (detailRes.ok) {
                const data = await detailRes.json();
                instructions = data.instructions || [];
                ingredients = data.ingredients || [];
                nutrients = data.nutrients || [];
                detailCalories = data.calories;
            }

            navigation.navigate('RecipeDetailScreen', {
                recipe: {
                    id: item.spoonacular_id,
                    title: item.title,
                    image: item.image,
                    calories: detailCalories || item.calories,
                    instructions,
                    nutrients,
                    ingredients,
                },
            });
        } catch {
            // Navigate với data tối thiểu nếu fetch lỗi
            navigation.navigate('RecipeDetailScreen', {
                recipe: {
                    id: item.spoonacular_id,
                    title: item.title,
                    image: item.image,
                    calories: item.calories,
                    instructions: [],
                    nutrients: [],
                    ingredients: [],
                },
            });
        } finally {
            setLoadingDetailId(null);
        }
    }, [navigation]);

    const toggleFavourite = useCallback(async (item) => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/detect/favourite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    spoonacular_id: item.spoonacular_id,
                    title: item.title,
                    image: item.image,
                }),
            });
            if (res.ok) {
                setFavourites(prev => {
                    const next = new Set(prev);
                    if (next.has(item.spoonacular_id)) {
                        next.delete(item.spoonacular_id);
                    } else {
                        next.add(item.spoonacular_id);
                    }
                    return next;
                });
            }
        } catch { }
    }, []);

    const renderCard = ({ item }) => {
        const isSpoonacular = item.source === 'spoonacular';
        const imageUri = isSpoonacular ? item.image : getImageUri(item.image);
        const title = isSpoonacular ? item.title : item.name_recipe;
        const calories = item.calories;
        const isFav = isSpoonacular && favourites.has(item.spoonacular_id);
        const isLoadingThis = loadingDetailId === item.spoonacular_id;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                disabled={isLoadingThis}
                onPress={() => {
                    if (isSpoonacular) {
                        handleSpoonacularPress(item);
                    } else {
                        navigation.navigate('RecipeDetailScreen', {
                            recipe: { ...item, name_recipe: item.name_recipe },
                        });
                    }
                }}
            >
                <View style={styles.cardImageWrap}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.cardImageFallback]}>
                            <Ionicons name="restaurant-outline" size={32} color="#ccc" />
                        </View>
                    )}

                    {/* Loading overlay khi đang fetch detail */}
                    {isLoadingThis && (
                        <View style={styles.cardLoadingOverlay}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    )}

                    {/* Badge 🌐 để phân biệt nguồn Spoonacular */}
                    {isSpoonacular && (
                        <View style={styles.badgeWrap}>
                            <Text style={styles.badgeText}>🌐</Text>
                        </View>
                    )}

                    {/* Nút ❤️ favourite — Spoonacular only */}
                    {isSpoonacular && (
                        <TouchableOpacity
                            style={styles.favBtn}
                            onPress={() => toggleFavourite(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={isFav ? 'heart' : 'heart-outline'}
                                size={18}
                                color={isFav ? '#e74c3c' : '#fff'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                    {calories != null && (
                        <View style={styles.metaRow}>
                            <Ionicons name="flame-outline" size={13} color="#3F805A" />
                            <Text style={styles.metaText}>{Math.round(calories)} kcal</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={20} color="#3F805A" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search recipes..."
                    placeholderTextColor="#9ca3af"
                    value={keyword}
                    onChangeText={setKeyword}
                    returnKeyType="search"
                    onSubmitEditing={() => handleSearch(keyword)}
                    autoFocus
                />
                {keyword.length > 0 && (
                    <TouchableOpacity onPress={() => { setKeyword(''); setResults([]); setSearched(false); }}>
                        <Ionicons name="close-circle" size={18} color="#bbb" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3F805A" />
                </View>
            ) : searched ? (
                <>
                    <Text style={styles.resultCount}>
                        {results.length} results for <Text style={styles.resultKeyword}>"{keyword}"</Text>
                    </Text>
                    {results.length === 0 ? (
                        <View style={styles.center}>
                            <Ionicons name="search-outline" size={56} color="#ddd" />
                            <Text style={styles.emptyText}>No recipes found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item, index) =>
                                item.source === 'spoonacular'
                                    ? `spoon-${item.spoonacular_id}`
                                    : `local-${item.id_recipe}-${index}`
                            }
                            renderItem={renderCard}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </>
            ) : (
                <View style={styles.center}>
                    <Ionicons name="search-outline" size={56} color="#ddd" />
                    <Text style={styles.emptyText}>Enter keywords and press Enter to search</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backBtn: { width: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },

    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 12,
        borderRadius: 14, paddingHorizontal: 14, height: 48,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },

    resultCount: {
        fontSize: 14, color: '#555',
        marginHorizontal: 16, marginBottom: 8,
    },
    resultKeyword: { fontWeight: 'bold', color: '#111' },

    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    row: { justifyContent: 'space-between', marginBottom: 14 },

    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    cardImageWrap: { width: '100%', height: CARD_WIDTH * 0.85, position: 'relative' },
    cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    cardImageFallback: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },

    // Overlay loading khi fetch detail
    cardLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    // Badge 🌐 góc trên trái
    badgeWrap: {
        position: 'absolute', top: 6, left: 6,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
    },
    badgeText: { fontSize: 11 },

    // Nút ❤️ góc trên phải
    favBtn: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(0,0,0,0.40)',
        borderRadius: 14, padding: 4,
    },

    cardInfo: { padding: 10 },
    cardTitle: { fontSize: 13, fontWeight: '600', color: '#222', marginBottom: 6, lineHeight: 18 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: '#3F805A', fontWeight: '500' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyText: { fontSize: 15, color: '#aaa', textAlign: 'center' },
});
