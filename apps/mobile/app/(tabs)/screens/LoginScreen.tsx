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
import { colors } from '../common/colors';
import { authStyles } from '../common/authTheme';
import { TOP_SAFE_AREA_EDGES } from '../common/edgeToEdge';
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
    <SafeAreaView style={authStyles.safeScreen} edges={TOP_SAFE_AREA_EDGES}>
      <KeyboardAvoidingView
        style={authStyles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={authStyles.centeredScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={authStyles.heroHeader}>
            <View style={authStyles.heroBadge}>
              <Image
                source={require('../../../assets/images/login.png')}
                style={authStyles.heroBadgeImage}
                resizeMode="cover"
              />
            </View>
            <Text style={[authStyles.centeredTitle, authStyles.titleAccent]}>
              Chào mừng trở lại
            </Text>
            <Text style={authStyles.centeredSubtitle}>
              Đăng nhập để tiếp tục hành trình, xem địa điểm đã lưu và quản lý hoạt động của bạn.
            </Text>
          </View>

          <View style={authStyles.formShell}>
            <View style={[authStyles.inputRow, { marginBottom: 10 }]}>
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
                style={[authStyles.inputIcon, { marginRight: 16 }]}
              />
              <TextInput
                placeholder="Mật khẩu"
                secureTextEntry={!isPasswordVisible}
                style={authStyles.inputText}
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
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={authStyles.primaryActionWrap}>
            <Pressable
              style={({ pressed }) => [
                authStyles.button,
                pressed && !submitting ? authStyles.buttonPressed : undefined,
                submitting ? authStyles.buttonDisabled : undefined,
              ]}
              onPress={handleLogin}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={authStyles.buttonText}>Đăng nhập</Text>
              )}
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <Text style={authStyles.link} onPress={() => navigation.navigate('Forgot Password')}>
              Quên mật khẩu?
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={authStyles.helperText}>
              Đăng nhập bằng email và mật khẩu để tiếp tục sử dụng đầy đủ các tính năng.
            </Text>
            <Text style={[authStyles.footerText, { marginBottom: 16 }]}>
              Chưa có tài khoản?{' '}
              <Text style={authStyles.inlineLink} onPress={() => navigation.navigate('Register')}>
                Đăng ký
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
