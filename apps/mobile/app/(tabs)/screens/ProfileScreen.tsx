import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import UserAvatar from '../components/UserAvatar';
import styles from './ProfileScreen.styles';
import { useAuth } from '../context/AuthContext';
import type { AppNavigationOnlyProps } from '../types/navigation';

export default function ProfileScreen({ navigation }: AppNavigationOnlyProps<'Profile'>) {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.name || 'Người dùng';

  return (
    <View style={{ flex: 1, marginTop: 40, backgroundColor: '#ffff' }}>
      <View style={[styles.container, { marginTop: 20 }]}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <UserAvatar uri={user?.avatarUrl} size={118} borderWidth={0} />
            </View>

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => navigation.navigate('Edit Profile')}>
              <Ionicons name="create-outline" size={24} color="#00AEEF" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}>
            {displayName}
          </Text>
          {user?.username ? (
            <Text style={{ color: '#928d8d', fontSize: 16, marginTop: 4 }}>@{user.username}</Text>
          ) : null}
          {user?.location ? (
            <Text style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>{user.location}</Text>
          ) : null}
          <Text style={{ color: user?.emailVerified ? '#00875A' : '#E53935', fontSize: 14, marginTop: 6 }}>
            {user?.emailVerified ? 'Email đã xác minh' : 'Email chưa xác minh'}
          </Text>
        </View>

        <View style={styles.profileMenuContainer}>
          <TouchableOpacity
            style={styles.profileMenuItemContainer}
            onPress={() => navigation.navigate('Edit Profile')}>
            <View style={[styles.profileMenuItemIcon, { backgroundColor: '#dff5ff' }]}>
              <Ionicons name="settings-outline" size={28} color="#00AEEF" />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Tài khoản & bảo mật</Text>
              <Text style={{ color: '#928d8d', fontSize: 15 }}>
                Chỉnh sửa hồ sơ, ảnh đại diện và thông tin cá nhân
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbc8c8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItemContainer}
            onPress={() => navigation.navigate('Change Password')}>
            <View style={[styles.profileMenuItemIcon, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="lock-closed-outline" size={28} color="#4f46e5" />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Đổi mật khẩu</Text>
              <Text style={{ color: '#928d8d', fontSize: 15 }}>
                Giữ tài khoản luôn an toàn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbc8c8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItemContainer}
            onPress={() => navigation.navigate('Saved Places')}>
            <View style={[styles.profileMenuItemIcon, { backgroundColor: '#f0d3e8' }]}>
              <Ionicons name="heart" size={30} color="#da2c2c" />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Địa điểm đã lưu</Text>
              <Text style={{ color: '#928d8d', fontSize: 15 }}>
                Xem nhanh các địa điểm bạn yêu thích
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbc8c8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItemContainer}
            onPress={() => navigation.navigate('Your Reviews')}>
            <View style={[styles.profileMenuItemIcon, { backgroundColor: '#daf7b5' }]}>
              <MaterialIcons name="rate-review" size={28} color="#a4c626" />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Đánh giá của bạn</Text>
              <Text style={{ color: '#928d8d', fontSize: 15 }}>
                Quản lý các đánh giá bạn đã đăng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbc8c8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItemContainer}
            onPress={() => navigation.navigate('Delete Account')}>
            <View style={[styles.profileMenuItemIcon, { backgroundColor: '#fde2e2' }]}>
              <Ionicons name="trash-outline" size={28} color="#E53935" />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Xóa tài khoản</Text>
              <Text style={{ color: '#928d8d', fontSize: 15 }}>
                Xóa vĩnh viễn tài khoản và dữ liệu liên quan
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbc8c8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItemContainer}
            onPress={() => navigation.navigate('Log Out')}>
            <View style={[styles.profileMenuItemIcon, { backgroundColor: '#f5d0d0' }]}>
              <Ionicons name="log-out-outline" size={30} color="#da2c2c" />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Đăng xuất</Text>
              <Text style={{ color: '#928d8d', fontSize: 15 }}>
                Thoát khỏi tài khoản hiện tại
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbc8c8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
