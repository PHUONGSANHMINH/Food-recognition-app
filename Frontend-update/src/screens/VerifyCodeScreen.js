import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CODE_LENGTH = 6;
const RESEND_TIMEOUT = 60; // giây

export default function VerifyCodeScreen({ navigation, route }) {
    const { email } = route.params;
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChangeText = (text, index) => {
        const newCode = [...code];
        newCode[index] = text.replace(/[^0-9]/g, '').slice(-1);
        setCode(newCode);
        // Tự động focus ô tiếp theo
        if (text && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const verifyCode = code.join('');
        if (verifyCode.length !== CODE_LENGTH) {
            Alert.alert('Error', 'Please enter the complete 6-digit code.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/forget-password/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, verifycode: verifyCode }),
            });
            const data = await response.json();
            if (response.ok) {
                navigation.navigate('ResetPassword', { email, verifycode: verifyCode });
            } else if (response.status === 403) {
                Alert.alert('Locked', 'Maximum verification attempts exceeded. Please request a new code.');
            } else {
                Alert.alert('Error', data.msg || 'Invalid verification code.');
                setCode(Array(CODE_LENGTH).fill(''));
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            Alert.alert('Error', 'Network error, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/forget-password/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setCode(Array(CODE_LENGTH).fill(''));
                setCountdown(RESEND_TIMEOUT);
                Alert.alert('Sent', 'A new code has been sent to your email.');
                inputRefs.current[0]?.focus();
            } else {
                Alert.alert('Error', data.msg || 'Failed to resend code.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error, please try again.');
        } finally {
            setIsResending(false);
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

                <View style={styles.content}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-open-outline" size={64} color="#3F805A" />
                    </View>

                    <Text style={styles.title}>Check Your Email</Text>
                    <Text style={styles.subtitle}>
                        We sent a 6-digit verification code to:
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>

                    {/* OTP Input boxes */}
                    <View style={styles.codeContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[styles.codeBox, digit && styles.codeBoxFilled]}
                                value={digit}
                                onChangeText={(text) => handleChangeText(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Verify Code</Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendLabel}>Didn't receive the code? </Text>
                        {countdown > 0 ? (
                            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} disabled={isResending}>
                                {isResending ? (
                                    <ActivityIndicator size="small" color="#3F805A" />
                                ) : (
                                    <Text style={styles.resendLink}>Resend</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F7F4',
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    emailText: {
        fontSize: 15,
        color: '#3F805A',
        fontWeight: '700',
        marginTop: 4,
        marginBottom: 32,
    },
    codeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 32,
        width: '100%',
        justifyContent: 'center',
    },
    codeBox: {
        width: 46,
        height: 56,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: '#F9FAFB',
    },
    codeBoxFilled: {
        borderColor: '#3F805A',
        backgroundColor: '#F0F7F4',
    },
    button: {
        backgroundColor: '#3F805A',
        borderRadius: 25,
        height: 52,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
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
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendLabel: {
        fontSize: 14,
        color: '#62656b',
    },
    countdownText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    resendLink: {
        fontSize: 14,
        color: '#3F805A',
        fontWeight: '700',
    },
});
