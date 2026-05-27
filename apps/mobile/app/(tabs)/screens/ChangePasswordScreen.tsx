import React, { useState } from 'react';
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
import { changePassword } from '../../../lib/api/users';
import { colors } from '../common/colors';
import { getApiErrorMessage } from '../context/AuthContext';
import type { AppNavigationOnlyProps } from '../types/navigation';

function mapChangePasswordError(code: string) {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Mật khẩu hiện tại không đúng.';
    case 'PASSWORD_TOO_WEAK':
      return 'Mật khẩu mới phải từ 8 đến 72 ký tự.';
    default:
      return code;
  }
}

export default function ChangePasswordScreen({
  navigation,
}: AppNavigationOnlyProps<'Change Password'>) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      Alert.alert('Thành công', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Không đổi được mật khẩu', mapChangePasswordError(getApiErrorMessage(error)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.card}>
        <Text style={styles.title}>Đổi mật khẩu</Text>
        <Text style={styles.subtitle}>
          Sử dụng mật khẩu mới an toàn để bảo vệ tài khoản của bạn.
        </Text>

        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Mật khẩu hiện tại"
        />

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
          placeholder="Xác nhận mật khẩu mới"
        />

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
          )}
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
});
