import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const UserInfoScreen = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState({
        email: '',
        password: '',
    });
    const [calories, setCalories] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [isCaloriesModalVisible, setIsCaloriesModalVisible] = useState(false);
    const [selectedCalories, setSelectedCalories] = useState(userInfo.targetCalories);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const response = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/user/info`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setUserInfo({
                    email: response.data.email,
                });
                setLoading(false);
            } catch (err) {
                setError('Unable to load user info');
                setLoading(false);
            }
        };
        const fetchCaloriesGoal = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const response = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/nutrition-user/calories`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCalories(response.data.calories_goal);
                setLoading(false);
            } catch (err) {
                setError('Unable to load target calories');
                setLoading(false);
            }
        };

        fetchCaloriesGoal();
        fetchUserInfo();
    }, []);

    const handleUpdateUser = async () => {
        try {
            setIsUpdating(true);
            const token = await AsyncStorage.getItem('access_token');
            const payload = {
                email: userInfo.email,
                password: userInfo.password,
            };

            await axios.put(`${process.env.EXPO_PUBLIC_DOMAIN}api/user/update`, payload, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setIsUpdating(false);
            alert('User information updated successfully');
            setIsModalVisible(false);
        } catch (err) {
            setIsUpdating(false);
            setError('Unable to update user info');
        }
    };

    const handleUpdateCalories = async () => {
        try {
            setIsUpdating(true);

            // Lấy token từ AsyncStorage
            const token = await AsyncStorage.getItem('access_token');

            // Payload chứa mục tiêu calories mới
            const payload = {
                calories_goal: selectedCalories, // Lưu ý: sử dụng đúng tên trường từ API backend
            };

            // Gửi request cập nhật đến API
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_DOMAIN}api/nutrition-user/update`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Cập nhật UI nếu request thành công
            setCalories(selectedCalories);
            setIsUpdating(false);
            alert(response.data.msg || 'Daily calories target updated successfully');
            setIsCaloriesModalVisible(false);
        } catch (err) {
            setIsUpdating(false);

            // Xử lý lỗi: Hiển thị thông báo lỗi phù hợp
            const errorMessage =
                err.response?.data?.msg || 'Unable to update calories target';
            setError(errorMessage);
            alert(errorMessage);
        }
    };

    const renderCaloriesPicker = () => {
        const caloriesOptions = [];
        for (let i = 1000; i <= 5000; i += 50) {
            caloriesOptions.push(i);
        }

        return (
            <Picker
                selectedValue={selectedCalories || calories}
                onValueChange={(itemValue) => setSelectedCalories(itemValue)}
                style={styles.picker}
            >
                {caloriesOptions.map((cal) => (
                    <Picker.Item key={cal} label={`${cal} cal`} value={cal} />
                ))}
            </Picker>
        );
    };


    const handleLogout = async () => {
        try {
            // Xóa token khỏi AsyncStorage
            await AsyncStorage.removeItem('access_token');

            // Chuyển hướng đến màn hình đăng nhập
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            });
        } catch (error) {
            console.error('Logout failed: ', error);
            // Xử lý lỗi nếu cần thiết
        }
    };
    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#FF7F32" />;
        }

        return (
            <View style={styles.contentContainer}>
                <View style={styles.cardContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Ionicons name="information-outline" size={24} color="#FF7F32" />
                        <Text style={styles.menuItemText}>Change Email / Password</Text>
                        <Ionicons name="chevron-forward" size={24} color="#BCBCBC" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setIsCaloriesModalVisible(true)}
                    >
                        <Ionicons name="flame-outline" size={24} color="#FF7F32" />
                        <Text style={styles.menuItemText}>Set Target Daily Calories</Text>
                        <Ionicons name="chevron-forward" size={24} color="#BCBCBC" />
                    </TouchableOpacity>
                </View>

                <View style={styles.caloriesInfoContainer}>
                    <Text style={styles.caloriesInfoTitle}>Current Target Calories</Text>
                    <Text style={styles.caloriesInfoValue}>{calories ? `${calories} cal` : 'N/A'}</Text>
                </View>

                <View style={styles.logoutContainer}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Information</Text>
            </View>
            {renderContent()}

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Change Email / Password</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="New Email"
                            placeholderTextColor="#BCBCBC"
                            value={userInfo.email}
                            onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            placeholderTextColor="#BCBCBC"
                            value={userInfo.password}
                            secureTextEntry={true}
                            onChangeText={(text) => setUserInfo({ ...userInfo, password: text })}
                        />

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdateUser}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.updateButtonText}>Update</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={isCaloriesModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsCaloriesModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Set Daily Calories Target</Text>

                        <View style={styles.pickerContainer}>
                            {renderCaloriesPicker()}
                        </View>

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdateCalories}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.updateButtonText}>Save Target</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsCaloriesModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    contentContainer: {
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuItemText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    caloriesInfoContainer: {
        marginTop: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    caloriesInfoTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    caloriesInfoValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F32',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: width * 0.85,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderColor: '#FF7F32',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 16,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    updateButton: {
        backgroundColor: '#FF7F32',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 12,
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF7F32',
    },
    cancelButtonText: {
        color: '#FF7F32',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 16,
    },
    logoutContainer: {
        marginTop: '70%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButton: {
        backgroundColor: 'transparent',
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FF0000',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default UserInfoScreen;