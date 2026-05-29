import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgotPassword, resetPassword, verifyForgotPasswordOtp } from '../../../lib/api/auth';
import { authStyles } from '../common/authTheme';
import { colors } from '../common/colors';
import { TOP_SAFE_AREA_EDGES } from '../common/edgeToEdge';
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
    <SafeAreaView style={authStyles.safeScreen} edges={TOP_SAFE_AREA_EDGES}>
      <KeyboardAvoidingView
        style={authStyles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={authStyles.centeredScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={authStyles.cardSurface}>
            <Text style={[authStyles.cardTitle, authStyles.titleAccent]}>{title}</Text>
            <Text style={authStyles.cardSubtitle}>{description}</Text>

            <Text style={authStyles.fieldLabel}>Email</Text>
            <TextInput
              style={authStyles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="emailcuaban@gmail.com"
              placeholderTextColor={colors.authBody}
              selectionColor={colors.authTitleAccent}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={step === 'request'}
            />

            {step !== 'request' ? (
              <>
                <Text style={authStyles.fieldLabel}>OTP</Text>
                <TextInput
                  style={authStyles.textInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Mã OTP gồm 6 số"
                  placeholderTextColor={colors.authBody}
                  selectionColor={colors.authTitleAccent}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={step !== 'reset'}
                />
              </>
            ) : null}

            {step === 'reset' ? (
              <>
                <Text style={authStyles.fieldLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={authStyles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Mật khẩu mới"
                  placeholderTextColor={colors.authBody}
                  selectionColor={colors.authTitleAccent}
                />
                <Text style={authStyles.fieldLabel}>Xác nhận mật khẩu</Text>
                <TextInput
                  style={authStyles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor={colors.authBody}
                  selectionColor={colors.authTitleAccent}
                />
              </>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                authStyles.button,
                pressed && !submitting ? authStyles.buttonPressed : undefined,
                submitting ? authStyles.buttonDisabled : undefined,
              ]}
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
                <Text style={authStyles.buttonText}>
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
                <Text style={authStyles.link}>Gửi lại OTP</Text>
              </Pressable>
            ) : null}

            <Pressable disabled={submitting} onPress={() => navigation.navigate('Login')}>
              <Text style={authStyles.secondaryLink}>Quay lại đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
