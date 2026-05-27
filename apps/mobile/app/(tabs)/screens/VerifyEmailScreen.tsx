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
import { authStyles } from '../common/authTheme';
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
    <SafeAreaView style={authStyles.safeScreen}>
      <KeyboardAvoidingView
        style={authStyles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={authStyles.centeredScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={authStyles.cardSurface}>
            <Text style={[authStyles.cardTitle, authStyles.titleAccent]}>Xác minh email</Text>
            <Text style={authStyles.cardSubtitle}>{helperText}</Text>

            <Text style={authStyles.fieldLabel}>Email đã đăng ký</Text>
            <TextInput
              style={[authStyles.textInput, authStyles.disabledInput]}
              value={email}
              editable={false}
            />

            <Text style={authStyles.fieldLabel}>Mã OTP</Text>
            <TextInput
              style={authStyles.textInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="Nhập mã OTP gồm 6 chữ số"
              placeholderTextColor={colors.authBody}
              selectionColor={colors.authTitleAccent}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Pressable
              style={({ pressed }) => [
                authStyles.button,
                pressed && !submitting ? authStyles.buttonPressed : undefined,
                submitting ? authStyles.buttonDisabled : undefined,
              ]}
              disabled={submitting}
              onPress={handleVerify}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={authStyles.buttonText}>Xác minh và bắt đầu</Text>
              )}
            </Pressable>

            <Pressable disabled={resending || submitting} onPress={handleResend}>
              <Text style={authStyles.link}>{resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}</Text>
            </Pressable>

            <Pressable
              disabled={submitting || resending}
              onPress={() => navigation.navigate('Login')}>
              <Text style={authStyles.secondaryLink}>Quay lại đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
