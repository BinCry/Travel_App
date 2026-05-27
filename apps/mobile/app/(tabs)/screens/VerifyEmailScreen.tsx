import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import { useAuth } from '../context/AuthContext';
import type { AppScreenProps } from '../types/navigation';

export default function VerifyEmailScreen({
  navigation,
  route,
}: AppScreenProps<'Verify Email'>) {
  const initialEmail = route.params?.email ?? '';
  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerificationOtp } = useAuth();

  const helperText = useMemo(
    () =>
      `Chúng tôi đã gửi mã OTP đến ${email || 'email của bạn'}. Nhập mã gồm 6 chữ số để kích hoạt tài khoản.`,
    [email]
  );

  const handleVerify = async () => {
    if (!email.trim() || otp.trim().length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyEmail(email.trim(), otp.trim());
      Alert.alert('Thành công', result.message);
    } catch (error) {
      Alert.alert('Xác minh thất bại', toUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Không tìm thấy địa chỉ email cần xác minh.');
      return;
    }

    setResending(true);
    try {
      const result = await resendVerificationOtp(email.trim());
      Alert.alert('Thông báo', result.message);
    } catch (error) {
      Alert.alert('Không gửi lại được OTP', toUserMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.card}>
        <Text style={styles.title}>Xác minh email</Text>
        <Text style={styles.subtitle}>{helperText}</Text>

        <Text style={styles.label}>Email đã đăng ký</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

        <Text style={styles.label}>Mã OTP</Text>
        <TextInput
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
          placeholder="Nhập mã OTP gồm 6 chữ số"
          keyboardType="number-pad"
          maxLength={6}
        />

        <Pressable style={styles.button} disabled={submitting} onPress={handleVerify}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác minh và bắt đầu</Text>
          )}
        </Pressable>

        <Pressable disabled={resending || submitting} onPress={handleResend}>
          <Text style={styles.link}>{resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}</Text>
        </Pressable>

        <Pressable
          disabled={submitting || resending}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryLink}>Quay lại đăng nhập</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  label: {
    marginBottom: 8,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    color: colors.textSecondary,
  },
  button: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '700',
  },
  secondaryLink: {
    marginTop: 10,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
