import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ScanResultRecipesScreen({ route, navigation }) {
    const { query = '', recipes = [] } = route.params || {};
    const [favourites, setFavourites] = useState({});

    // ─── Toggle yêu thích (recipe nội bộ) ─────────────────────────────────
    const handleFavourite = async (recipeId) => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/recipes/${recipeId}/favourite`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setFavourites((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
            }
        } catch (_) { }
    };

    // ─── Card ─────────────────────────────────────────────────────────────
    const renderCard = ({ item, index }) => {
        const id = item.id || item.id_recipe || index;
        const title = item.title || item.name_recipe || 'Unnamed Recipe';
        const imageUrl = item.image
            ? item.image
            : null;
        const cookTime = item.cookingMinutes || item.cook_time || null;
        const calories = item.calories
            ? (typeof item.calories === 'string' ? item.calories : `${item.calories} kcal`)
            : null;
        const isFav = !!favourites[id];

        return (
            <View style={styles.card}>
                {/* Ảnh */}
                <View style={styles.cardImageWrap}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.cardImageFallback]}>
                            <Ionicons name="restaurant-outline" size={36} color="#bbb" />
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => handleFavourite(id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFav ? '#EF4444' : 'white'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Thông tin */}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                    <View style={styles.cardMeta}>
                        {cookTime != null && (
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={13} color="#9ca3af" />
                                <Text style={styles.metaText}>{cookTime} min</Text>
                            </View>
                        )}
                        {calories != null && (
                            <View style={styles.metaItem}>
                                <Ionicons name="flame-outline" size={13} color="#9ca3af" />
                                <Text style={styles.metaText}>{calories}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recipes</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                <Text style={styles.subtitleCount}>{recipes.length} results</Text>
                {query ? (
                    <Text style={styles.subtitleQuery}> for "{capitalize(query)}"</Text>
                ) : null}
            </Text>

            {/* List */}
            {recipes.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Ionicons name="search-outline" size={48} color="#ddd" />
                    <Text style={styles.emptyText}>Không có công thức nào</Text>
                </View>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item, idx) => String(item.id || item.id_recipe || idx)}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { width: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },

    // ── Subtitle ──
    subtitle: {
        fontSize: 14,
        color: '#555',
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 6,
        backgroundColor: '#F5F7FA',
    },
    subtitleCount: { fontWeight: 'bold', color: '#111', fontSize: 15 },
    subtitleQuery: { color: '#555', fontSize: 14 },

    // ── List ──
    listContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 },

    // ── Card ──
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImageWrap: { position: 'relative' },
    cardImage: { width: '100%', height: 180, resizeMode: 'cover' },
    cardImageFallback: {
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.28)',
        borderRadius: 20,
        padding: 6,
    },
    cardInfo: { padding: 14 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 8 },
    cardMeta: { flexDirection: 'row', gap: 14 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: '#9ca3af' },

    // ── Empty ──
    emptyWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    emptyText: { fontSize: 15, color: '#aaa' },
});
