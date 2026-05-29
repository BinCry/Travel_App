import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../common/colors';
import { TOP_SAFE_AREA_EDGES } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import { useAuth } from '../context/AuthContext';

export default function DeleteAccountScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { deleteAccount, user } = useAuth();

  const handleDelete = async () => {
    if (!currentPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại để xác nhận.');
      return;
    }

    Alert.alert(
      'Xóa tài khoản',
      user?.role === 'owner'
        ? 'Tài khoản owner sẽ bị xóa vĩnh viễn cùng toàn bộ địa điểm và ưu đãi liên quan. Bạn có chắc chắn muốn tiếp tục?'
        : 'Tài khoản của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              const message = await deleteAccount(currentPassword);
              Alert.alert('Đã xóa tài khoản', message);
            } catch (error) {
              Alert.alert('Không thể xóa tài khoản', toUserMessage(error));
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.background} edges={TOP_SAFE_AREA_EDGES}>
      <View style={styles.card}>
        <Text style={styles.title}>Xóa tài khoản</Text>
        <Text style={styles.description}>
          Đây là thao tác không thể hoàn tác. Vui lòng nhập mật khẩu hiện tại để xác nhận rằng
          bạn muốn xóa toàn bộ dữ liệu của tài khoản này.
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Lưu ý quan trọng</Text>
          <Text style={styles.warningText}>
            {user?.role === 'owner'
              ? 'Khi xóa tài khoản owner, toàn bộ địa điểm và ưu đãi do bạn quản lý cũng sẽ bị xóa khỏi hệ thống.'
              : 'Sau khi xóa, bạn sẽ mất quyền truy cập vào địa điểm đã lưu, đánh giá và thông tin hồ sơ của mình.'}
          </Text>
        </View>

        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu hiện tại"
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.button, submitting && { opacity: 0.8 }]}
          disabled={submitting}
          onPress={handleDelete}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xóa vĩnh viễn</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fff7f7',
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
  description: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  warningBox: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 18,
  },
  warningTitle: {
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 6,
  },
  warningText: {
    color: '#7f1d1d',
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
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: colors.danger,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
