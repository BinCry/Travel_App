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
import { forgotPassword, resetPassword, verifyForgotPasswordOtp } from '../../../lib/api/auth';
import { colors } from '../common/colors';
import { getApiErrorMessage } from '../context/AuthContext';
import type { AppNavigationOnlyProps } from '../types/navigation';

type Step = 'request' | 'verify' | 'reset';

function mapForgotPasswordError(code: string) {
  switch (code) {
    case 'ACCOUNT_NOT_FOUND':
      return 'Email này chưa được đăng ký.';
    case 'RATE_LIMITED':
      return 'Bạn vừa yêu cầu OTP. Vui lòng đợi một chút rồi thử lại.';
    case 'OTP_INVALID':
      return 'Mã OTP không đúng.';
    case 'OTP_EXPIRED':
      return 'Mã OTP đã hết hạn.';
    case 'PASSWORD_TOO_WEAK':
      return 'Mật khẩu mới phải từ 8 đến 72 ký tự.';
    case 'EMAIL_DELIVERY_FAILED':
      return 'Không thể gửi email OTP lúc này.';
    default:
      return code;
  }
}

export default function ForgotPasswordScreen({
  navigation,
}: AppNavigationOnlyProps<'Forgot Password'>) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => {
    if (step === 'request') return 'Quên mật khẩu';
    if (step === 'verify') return 'Xác thực OTP';
    return 'Đặt lại mật khẩu';
  }, [step]);

  const description = useMemo(() => {
    if (step === 'request') {
      return 'Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu.';
    }
    if (step === 'verify') {
      return 'Nhập mã OTP đã được gửi vào email của bạn.';
    }
    return 'Đặt mật khẩu mới sau khi OTP đã được xác thực.';
  }, [step]);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await forgotPassword(email.trim());
      Alert.alert('Thông báo', result.message);
      setStep('verify');
    } catch (error) {
      Alert.alert('Không gửi được OTP', mapForgotPasswordError(getApiErrorMessage(error)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email.trim() || otp.trim().length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mã OTP gồm 6 số.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await verifyForgotPasswordOtp(email.trim(), otp.trim());
      Alert.alert('Thông báo', result.message);
      setStep('reset');
    } catch (error) {
      Alert.alert('Xác thực thất bại', mapForgotPasswordError(getApiErrorMessage(error)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await resetPassword(email.trim(), otp.trim(), newPassword);
      Alert.alert('Thành công', result.message, [
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Đổi mật khẩu thất bại', mapForgotPasswordError(getApiErrorMessage(error)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@cuaban.com"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={step === 'request'}
        />

        {step !== 'request' ? (
          <>
            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
          placeholder="Mã OTP gồm 6 số"
              keyboardType="number-pad"
              maxLength={6}
              editable={step !== 'reset'}
            />
          </>
        ) : null}

        {step === 'reset' ? (
          <>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Mật khẩu mới"
            />
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Xác nhận mật khẩu"
            />
          </>
        ) : null}

        <Pressable
          style={styles.button}
          disabled={submitting}
          onPress={
            step === 'request'
              ? handleRequestOtp
              : step === 'verify'
                ? handleVerifyOtp
                : handleResetPassword
          }>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 'request'
                ? 'Gửi OTP'
                : step === 'verify'
                  ? 'Xác thực OTP'
                  : 'Đặt lại mật khẩu'}
            </Text>
          )}
        </Pressable>

        {step !== 'request' ? (
          <Pressable disabled={submitting} onPress={handleRequestOtp}>
            <Text style={styles.link}>Gửi lại OTP</Text>
          </Pressable>
        ) : null}

        <Pressable disabled={submitting} onPress={() => navigation.navigate('Login')}>
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
    lineHeight: 20,
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
