import { Checkbox } from 'expo-checkbox';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStyles } from '../common/authTheme';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import { useAuth } from '../context/AuthContext';
import type { AppNavigationOnlyProps } from '../types/navigation';

function mapRegisterError(error: unknown) {
  return toUserMessage(error, {
    EMAIL_TAKEN:
      'Email đã được sử dụng. Nếu bạn chưa xác minh, hãy kiểm tra hộp thư hoặc yêu cầu gửi lại mã OTP.',
    PASSWORD_TOO_WEAK: 'Mật khẩu phải từ 8 đến 72 ký tự.',
  });
}

export default function RegisterScreen({ navigation }: AppNavigationOnlyProps<'Register'>) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isCfPasswordVisible, setCfPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'traveler' | 'owner'>('traveler');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!isChecked) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý điều khoản sử dụng.');
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register(email.trim(), password, fullName.trim() || undefined, role);
      Alert.alert('Kiểm tra email', result.message, [
        {
          text: 'Nhập OTP',
          onPress: () => navigation.navigate('Verify Email', { email: result.email }),
        },
      ]);
    } catch (error) {
      Alert.alert('Đăng ký thất bại', mapRegisterError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.safeScreen}>
      <KeyboardAvoidingView
        style={authStyles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={authStyles.topScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={authStyles.stackCard}>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
              <View style={authStyles.heroFrame}>
                <View style={authStyles.heroFrameInner}>
                  <Image
                    source={require('../../../assets/images/register.png')}
                    style={authStyles.heroFrameImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
              <Text
                style={[authStyles.centeredTitle, authStyles.titleAccent, { marginTop: 14 }]}>
                Bắt đầu hành trình
              </Text>
              <Text style={authStyles.centeredSubtitle}>
                Tạo tài khoản để khám phá nhiều địa điểm và nhận gợi ý phù hợp với bạn.
              </Text>
            </View>

            <View style={[authStyles.inputRow, { marginTop: 20 }]}>
              <Image
                source={require('../../../assets/images/user-icon.png')}
                style={[authStyles.inputIcon, { marginRight: 12 }]}
              />
              <TextInput
                placeholder="Họ và tên"
                style={authStyles.inputText}
                placeholderTextColor={colors.authBody}
                selectionColor={colors.authTitleAccent}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={authStyles.inputRow}>
              <Image
                source={require('../../../assets/images/email-icon.png')}
                style={[authStyles.inputIcon, { marginRight: 12 }]}
              />
              <TextInput
                placeholder="Địa chỉ email"
                style={authStyles.inputText}
                placeholderTextColor={colors.authBody}
                selectionColor={colors.authTitleAccent}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputRow}>
              <Image
                source={require('../../../assets/images/password-icon.png')}
                style={[authStyles.inputIcon, { marginRight: 12 }]}
              />
              <TextInput
                placeholder="Mật khẩu"
                secureTextEntry={!isPasswordVisible}
                style={authStyles.inputText}
                autoCorrect={false}
                autoCapitalize="none"
                placeholderTextColor={colors.authBody}
                selectionColor={colors.authTitleAccent}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
                <Image
                  source={
                    isPasswordVisible
                      ? require('../../../assets/images/hidden_eyepassword-icon.png')
                      : require('../../../assets/images/eyepassword-icon.png')
                  }
                  style={[authStyles.inputIcon, { marginLeft: 12 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={authStyles.inputRow}>
              <Image
                source={require('../../../assets/images/cfpassword-icon.png')}
                style={[authStyles.inputIcon, { marginRight: 12 }]}
              />
              <TextInput
                placeholder="Xác nhận mật khẩu"
                secureTextEntry={!isCfPasswordVisible}
                style={authStyles.inputText}
                placeholderTextColor={colors.authBody}
                selectionColor={colors.authTitleAccent}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setCfPasswordVisible(!isCfPasswordVisible)}>
                <Image
                  source={
                    isCfPasswordVisible
                      ? require('../../../assets/images/hidden_eyepassword-icon.png')
                      : require('../../../assets/images/eyepassword-icon.png')
                  }
                  style={[authStyles.inputIcon, { marginLeft: 12 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={authStyles.sectionLabel}>Loại tài khoản</Text>
              <View style={authStyles.roleRow}>
                <Pressable
                  onPress={() => setRole('traveler')}
                  style={[
                    authStyles.roleCard,
                    role === 'traveler' ? authStyles.roleCardActive : undefined,
                  ]}>
                  <Text style={authStyles.roleTitle}>Khách du lịch</Text>
                  <Text style={authStyles.roleDescription}>
                    Khám phá, lưu địa điểm và viết đánh giá
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setRole('owner')}
                  style={[
                    authStyles.roleCard,
                    role === 'owner' ? authStyles.roleCardActive : undefined,
                  ]}>
                  <Text style={authStyles.roleTitle}>Chủ địa điểm</Text>
                  <Text style={authStyles.roleDescription}>
                    Quản lý địa điểm và ưu đãi của bạn
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={authStyles.checkboxRow}>
              <Checkbox
                style={authStyles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? colors.authPrimaryButton : undefined}
              />
              <Text style={authStyles.checkboxText}>
                Tôi đồng ý với{' '}
                <Text style={authStyles.inlineLink} onPress={() => navigation.navigate('Terms')}>
                  Điều khoản sử dụng
                </Text>
              </Text>
            </View>

            <View style={authStyles.primaryActionWrap}>
              <Pressable
                style={({ pressed }) => [
                  authStyles.button,
                  pressed && !submitting ? authStyles.buttonPressed : undefined,
                  submitting ? authStyles.buttonDisabled : undefined,
                ]}
                onPress={handleRegister}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={authStyles.buttonText}>Tạo tài khoản</Text>
                )}
              </Pressable>
            </View>

            <Text style={authStyles.noteText}>
              Sau khi đăng ký, bạn cần nhập OTP xác minh email để kích hoạt tài khoản.
            </Text>
            <Text style={[authStyles.footerText, { marginBottom: 8 }]}>
              Đã có tài khoản?{' '}
              <Text style={authStyles.inlineLink} onPress={() => navigation.navigate('Login')}>
                Đăng nhập
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
