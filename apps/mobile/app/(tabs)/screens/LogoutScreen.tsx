import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../common/colors';
import { useAuth } from '../context/AuthContext';
import styles from './LogoutScreen.styles';
import type { AppNavigationOnlyProps } from '../types/navigation';

export default function LogoutScreen({ navigation }: AppNavigationOnlyProps<'Log Out'>) {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', marginTop: 40, backgroundColor: '#FFFFFF' }}>
      <View style={{ alignItems: 'center', margin: 10 }}>
        <View style={[styles.imageFrame, { width: 360, height: 300 }]}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eef8fc',
              paddingHorizontal: 24,
            }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d9f2fb',
                marginBottom: 18,
              }}>
              <Ionicons name="airplane-outline" size={44} color={colors.primary} />
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: '700',
                textAlign: 'center',
                lineHeight: 26,
              }}>
              Bạn có thể đăng xuất ngay bây giờ và tiếp tục hành trình bất cứ khi nào quay lại.
            </Text>
          </View>
        </View>

        <View style={[styles.containerChild, { alignItems: 'center', margin: 20 }]}>
          <Text style={{ fontSize: 34, fontWeight: 'bold', textAlign: 'center' }}>
            Bạn muốn đăng xuất?
          </Text>
          <Text style={{ color: 'grey', fontSize: 17, textAlign: 'center', lineHeight: 24 }}>
            Bạn có chắc muốn rời khỏi tài khoản hiện tại không? Mọi địa điểm đã lưu và hoạt động
            của bạn vẫn được giữ nguyên khi quay lại.
          </Text>
        </View>

        <View style={[styles.containerChild, { marginBottom: 250 }]}>
          <TouchableOpacity
            style={[styles.button, { width: 350 }]}
            onPress={() => navigation.navigate('Main')}>
            <Text style={styles.buttonText}>Ở lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.dangerSoft, marginTop: 10, width: 350 },
            ]}
            onPress={logout}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'center', columnGap: 8, alignItems: 'center' }}>
              <Ionicons name="log-out-outline" size={24} color={colors.danger} />
              <Text style={[styles.buttonText, { color: colors.danger, fontWeight: 'bold' }]}>
                Đăng xuất
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
