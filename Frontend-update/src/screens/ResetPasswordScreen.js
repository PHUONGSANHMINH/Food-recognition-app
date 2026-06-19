import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResetPasswordScreen({ navigation, route }) {
    const { email, verifycode } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Kiểm tra điều kiện mật khẩu
    const rules = [
        { label: 'At least 8 characters', met: newPassword.length >= 8 },
        { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
        { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
        { label: 'Number (0-9)', met: /[0-9]/.test(newPassword) },
        { label: 'Special character (@#$%^&+=)', met: /[@#$%^&+=]/.test(newPassword) },
    ];
    const allRulesMet = rules.every((r) => r.met);

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (!allRulesMet) {
            Alert.alert('Error', 'Password does not meet the requirements.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/forget-password/change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    newpassword: newPassword,
                    confirmpassword: confirmPassword,
                    verifycode,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Your password has been reset successfully!', [
                    { text: 'Login Now', onPress: () => navigation.navigate('Login') },
                ]);
            } else if (response.status === 403) {
                Alert.alert('Locked', 'Too many failed attempts. Please request a new code.');
            } else {
                Alert.alert('Error', data.msg || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#3F805A" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark-outline" size={64} color="#3F805A" />
                    </View>

                    <Text style={styles.title}>Create New Password</Text>
                    <Text style={styles.subtitle}>
                        Your new password must be different from your previous password.
                    </Text>

                    {/* New Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#62656b" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons
                                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#62656b"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Password Rules */}
                    {newPassword.length > 0 && (
                        <View style={styles.rulesContainer}>
                            {rules.map((rule, i) => (
                                <View key={i} style={styles.ruleRow}>
                                    <Ionicons
                                        name={rule.met ? 'checkmark-circle' : 'close-circle'}
                                        size={16}
                                        color={rule.met ? '#3F805A' : '#EF4444'}
                                    />
                                    <Text style={[styles.ruleText, { color: rule.met ? '#3F805A' : '#62656b' }]}>
                                        {rule.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[
                            styles.inputWrapper,
                            confirmPassword && newPassword !== confirmPassword && styles.inputWrapperError
                        ]}>
                            <Ionicons name="lock-closed-outline" size={20} color="#62656b" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons
                                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#62656b"
                                />
                            </TouchableOpacity>
                        </View>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <Text style={styles.errorText}>Passwords do not match</Text>
                        )}
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleReset}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    safeArea: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F7F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F7F4',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#62656b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    inputContainer: { marginBottom: 20 },
    label: {
        color: '#3F805A',
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputWrapperError: {
        borderColor: '#EF4444',
    },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#000' },
    rulesContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        gap: 6,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ruleText: { fontSize: 13 },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#3F805A',
        borderRadius: 25,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#3F805A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
