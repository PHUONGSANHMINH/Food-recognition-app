import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, Image,
    TouchableOpacity, Platform, StatusBar, ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FavoriteScreen({ navigation }) {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavourites = useCallback(() => {
        const load = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('access_token');
                if (!token) {
                    Alert.alert('', 'Vui lòng đăng nhập để xem Favorites.');
                    navigation.goBack();
                    return;
                }
                const res = await fetch(`${API_URL}/api/detect/favourites`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setFavourites(data.favourites || []);
            } catch {
                setFavourites([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Tải lại mỗi khi màn hình được focus
    useFocusEffect(fetchFavourites);

    const getImageUri = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        // internal recipe images: DB lưu filename, file ở uploads/recipes/
        if (imagePath.includes('/')) {
            return `${API_URL}/api/file/get-file/${imagePath}`;
        }
        return `${API_URL}/api/file/get-file/recipes/${imagePath}`;
    };

    const handleRemoveFavourite = async (item) => {
        const token = await AsyncStorage.getItem('access_token');
        try {
            if (item.source === 'spoonacular') {
                await fetch(`${API_URL}/api/detect/favourite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ spoonacular_id: item.spoonacular_id, title: item.title, image: item.image }),
                });
            } else {
                await fetch(`${API_URL}/api/recipes/${item.id_recipe}/favourite`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setFavourites(prev => prev.filter(f => {
                if (item.source === 'spoonacular') return f.spoonacular_id !== item.spoonacular_id;
                return f.id_recipe !== item.id_recipe;
            }));
        } catch {
            Alert.alert('Lỗi', 'Không thể xóa khỏi Favorites.');
        }
    };

    const handleItemPress = (item) => {
        if (item.source === 'spoonacular') {
            // Navigate với format Spoonacular
            navigation.navigate('RecipeDetailScreen', {
                recipe: {
                    id: item.spoonacular_id,
                    title: item.title,
                    image: getImageUri(item.image),
                    calories: item.calories,
                    nutrients: [],
                    ingredients: [],
                    instructions: [],
                },
            });
        } else {
            // Navigate với format nội bộ
            navigation.navigate('RecipeDetailScreen', {
                recipe: {
                    id_recipe: item.id_recipe,
                    name_recipe: item.title,
                    image: getImageUri(item.image),
                    calories: item.calories,
                    type: item.type,
                },
            });
        }
    };

    const renderItem = ({ item }) => {
        const imageUri = getImageUri(item.image);
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={() => handleItemPress(item)}>
                <View style={styles.imageWrap}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.imageFallback]}>
                            <Ionicons name="restaurant-outline" size={44} color="#ccc" />
                        </View>
                    )}
                    {/* Heart button */}
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => handleRemoveFavourite(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="heart" size={24} color="#EF4444" />
                    </TouchableOpacity>

                    {/* Tags (nội bộ) */}
                    {item.type && (
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>{item.type.toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color="#9ca3af" />
                        <Text style={styles.metaMuted}>--</Text>
                        {item.calories != null && (
                            <>
                                <Ionicons name="flame-outline" size={14} color="#9ca3af" style={{ marginLeft: 10 }} />
                                <Text style={styles.metaMuted}>{Math.round(item.calories)} kcal</Text>
                            </>
                        )}
                    </View>
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
                <Text style={styles.headerTitle}>Favorite</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3F805A" />
                </View>
            ) : favourites.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="heart-outline" size={64} color="#ddd" />
                    <Text style={styles.emptyTitle}>Chưa có món yêu thích</Text>
                    <Text style={styles.emptySubtitle}>Nhấn ❤️ trên trang chi tiết để thêm vào đây</Text>
                </View>
            ) : (
                <FlatList
                    data={favourites}
                    keyExtractor={(item, idx) =>
                        item.source === 'spoonacular'
                            ? `spoon_${item.spoonacular_id}`
                            : `int_${item.id_recipe ?? idx}`
                    }
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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

    listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    imageWrap: { position: 'relative' },
    cardImage: { width: '100%', height: 200, resizeMode: 'cover' },
    imageFallback: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },

    heartBtn: {
        position: 'absolute', top: 14, right: 14,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20, padding: 6,
    },

    tagBadge: {
        position: 'absolute', top: 14, left: 14,
        backgroundColor: '#E5F3EB', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    tagText: { fontSize: 10, fontWeight: 'bold', color: '#3F805A' },

    cardInfo: { padding: 14 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    metaMuted: { fontSize: 13, color: '#9ca3af', marginLeft: 4 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#555' },
    emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingHorizontal: 40 },
});
