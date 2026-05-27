import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './LoginScreen.styles';
import { toUserMessage } from '../common/errorMessages';
import { getApiErrorMessage, useAuth } from '../context/AuthContext';
import type { AppNavigationOnlyProps } from '../types/navigation';

export default function LoginScreen({ navigation }: AppNavigationOnlyProps<'Login'>) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      const code = getApiErrorMessage(error);
      if (code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert(
          'Email chưa xác minh',
          'Bạn cần xác minh email trước khi sử dụng ứng dụng.',
          [
            {
              text: 'Xác minh ngay',
              onPress: () => navigation.navigate('Verify Email', { email: email.trim() }),
            },
            { text: 'Đóng', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Đăng nhập thất bại', toUserMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.background, { backgroundColor: '#073b5b' }]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 36 }}>
        <View style={{ alignItems: 'center', marginBottom: 36, paddingHorizontal: 24 }}>
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.14)',
              marginBottom: 14,
            }}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={{ height: 60, width: 60 }}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{ fontWeight: 'bold', fontSize: 32, textAlign: 'center', color: '#f8fbff' }}>
            Chào mừng trở lại
          </Text>
          <Text
            style={{
              marginTop: 6,
              textAlign: 'center',
              color: '#d3e7f2',
              fontSize: 17,
              lineHeight: 24,
              maxWidth: 320,
            }}>
            Đăng nhập để tiếp tục hành trình, xem địa điểm đã lưu và quản lý hoạt động của bạn.
          </Text>
        </View>

        <View
          style={[
            styles.container,
            {
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 28,
              paddingVertical: 16,
              marginHorizontal: 12,
            },
          ]}>
          <View style={[styles.inputContainer, { marginBottom: 20 }]}>
            <Image
              source={require('../../../assets/images/email-icon.png')}
              style={{ width: 20, height: 20, marginRight: 10 }}
            />
            <TextInput
              placeholder="Địa chỉ email"
              style={{ flex: 1 }}
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Image
              source={require('../../../assets/images/password-icon.png')}
              style={{ width: 20, height: 20, marginRight: 20 }}
            />
            <TextInput
              placeholder="Mật khẩu"
              secureTextEntry={!isPasswordVisible}
              style={{ flex: 1 }}
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
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
                style={{ width: 20, height: 20, marginRight: 20 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.containerChild, { marginTop: 24, alignItems: 'center' }]}>
          <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginTop: 14 }}>
          <Text
            style={[styles.linkText, { fontSize: 15 }]}
            onPress={() => navigation.navigate('Forgot Password')}>
            Quên mật khẩu?
          </Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
          <Text
            style={[
              styles.text,
              { marginBottom: 16, color: '#d3e7f2', textAlign: 'center', maxWidth: 300 },
            ]}>
            Đăng nhập bằng email và mật khẩu để tiếp tục sử dụng đầy đủ các tính năng.
          </Text>
          <Text style={[styles.text, { marginTop: 24, color: '#d3e7f2', marginBottom: 40 }]}>
            Chưa có tài khoản?{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
              Đăng ký
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
