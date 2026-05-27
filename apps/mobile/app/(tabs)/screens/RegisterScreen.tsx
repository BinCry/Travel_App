import { Checkbox } from 'expo-checkbox';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './RegisterScreen.styles';
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
      const result = await register(
        email.trim(),
        password,
        fullName.trim() || undefined,
        role
      );
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
    <View style={{ flex: 1, justifyContent: 'center', marginTop: 40, backgroundColor: '#FFFFFF' }}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <View style={styles.imageFrame}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primaryLight,
              }}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={{ width: 112, height: 112 }}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: 34, textAlign: 'center', marginTop: 12 }}>
            Bắt đầu hành trình
          </Text>
          <Text
            style={[
              styles.text,
              {
                marginTop: 8,
                textAlign: 'center',
                maxWidth: 310,
                lineHeight: 22,
              },
            ]}>
            Tạo tài khoản để khám phá nhiều địa điểm và nhận gợi ý phù hợp với bạn.
          </Text>
        </View>

        <View style={[styles.inputContainer, { marginTop: 20 }]}>
          <Image
            source={require('../../../assets/images/user-icon.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
          />
          <TextInput
            placeholder="Họ và tên"
            style={{ flex: 1 }}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={require('../../../assets/images/email-icon.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
          />
          <TextInput
            placeholder="Địa chỉ email"
            style={{ flex: 1 }}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={require('../../../assets/images/password-icon.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
          />
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry={!isPasswordVisible}
            style={{ flex: 1 }}
            autoCorrect={false}
            autoCapitalize="none"
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
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={require('../../../assets/images/cfpassword-icon.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
          />
          <TextInput
            placeholder="Xác nhận mật khẩu"
            secureTextEntry={!isCfPasswordVisible}
            style={{ flex: 1 }}
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
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={[styles.text, { marginBottom: 10, color: colors.textSecondary }]}>
            Loại tài khoản
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => setRole('traveler')}
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: role === 'traveler' ? colors.primary : colors.border,
                backgroundColor: role === 'traveler' ? '#eaf8fe' : '#fff',
                paddingVertical: 14,
                paddingHorizontal: 14,
              }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontWeight: '700',
                  textAlign: 'center',
                }}>
                Khách du lịch
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: colors.textSecondary,
                  fontSize: 12,
                  lineHeight: 18,
                  textAlign: 'center',
                }}>
                Khám phá, lưu địa điểm và viết đánh giá
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setRole('owner')}
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: role === 'owner' ? colors.primary : colors.border,
                backgroundColor: role === 'owner' ? '#eaf8fe' : '#fff',
                paddingVertical: 14,
                paddingHorizontal: 14,
              }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontWeight: '700',
                  textAlign: 'center',
                }}>
                Chủ địa điểm
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: colors.textSecondary,
                  fontSize: 12,
                  lineHeight: 18,
                  textAlign: 'center',
                }}>
                Quản lý địa điểm và ưu đãi của bạn
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginLeft: 10, marginTop: 10, paddingRight: 16 }}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? colors.primary : undefined}
          />
          <Text style={{ flex: 1, lineHeight: 20 }}>
            Tôi đồng ý với{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Terms')}>
              Điều khoản sử dụng
            </Text>
          </Text>
        </View>

        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tạo tài khoản</Text>
            )}
          </Pressable>
        </View>

        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Text style={[styles.text, { marginVertical: 16, textAlign: 'center' }]}>
            Sau khi đăng ký, bạn cần nhập OTP xác minh email để kích hoạt tài khoản.
          </Text>
          <Text style={[styles.text, { marginVertical: 10 }]}>
            Đã có tài khoản?{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
              Đăng nhập
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
