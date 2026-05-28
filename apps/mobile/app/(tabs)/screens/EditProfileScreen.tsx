import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { updateMe } from '../../../lib/api/users';
import { uploadAvatar } from '../../../lib/api/uploads';
import UserAvatar from '../components/UserAvatar';
import { PROFILE_AVATAR_INNER_SIZE } from '../common/profileAvatar';
import styles from './EditProfileScreen.styles';
import { useAuth, getApiErrorMessage } from '../context/AuthContext';
import type { AppNavigationOnlyProps } from '../types/navigation';

function mapProfileError(code: string) {
  switch (code) {
    case 'USERNAME_TAKEN':
      return 'Tên người dùng đã được sử dụng.';
    case 'STORAGE_UNAVAILABLE':
      return 'Hệ thống tải ảnh chưa sẵn sàng.';
    case 'UNSUPPORTED_MEDIA_TYPE':
      return 'Ảnh không đúng định dạng hỗ trợ.';
    case 'FILE_TOO_LARGE':
      return 'Ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.';
    default:
      return code;
  }
}

export default function EditProfileScreen({ navigation }: AppNavigationOnlyProps<'Edit Profile'>) {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '');
      setUsername(user.username || '');
      setLocation(user.location || '');
      setAvatarUri(user.avatarUrl || '');
    }
  }, [user]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = avatarUri;
      if (/^(file|content):/i.test(avatarUri)) {
        avatarUrl = await uploadAvatar(avatarUri);
      }

      await updateMe({
        fullName: fullName.trim() || undefined,
        username: username.trim() || undefined,
        location: location.trim() || undefined,
        avatarUrl,
      });
      await refreshUser();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', mapProfileError(getApiErrorMessage(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <UserAvatar
                uri={avatarUri || null}
                size={PROFILE_AVATAR_INNER_SIZE}
                borderWidth={0}
              />
            </View>

            <TouchableOpacity style={styles.iconContainer} onPress={handlePickAvatar}>
              <Ionicons name="camera" size={22} color="#00AEEF" />
            </TouchableOpacity>
          </View>
          <Pressable onPress={() => setAvatarUri('')}>
            <Text style={{ color: '#00AEEF', fontWeight: '600' }}>Xóa ảnh đại diện</Text>
          </Pressable>
          <Text
            style={{
              marginTop: 8,
              color: user?.emailVerified ? '#00875A' : '#E53935',
              fontWeight: '600',
            }}>
            {user?.emailVerified ? 'Email đã xác minh' : 'Email chưa xác minh'}
          </Text>
        </View>

        <View style={styles.containerChild}>
          <Text style={{ color: 'grey', fontSize: 15 }}>HỌ VÀ TÊN</Text>
          <View style={[styles.inputContainer, { margin: 0 }]}>
            <TextInput value={fullName} onChangeText={setFullName} style={{ flex: 1 }} />
          </View>
        </View>

        <View style={styles.containerChild}>
          <Text style={{ color: 'grey', fontSize: 15 }}>TÊN NGƯỜI DÙNG</Text>
          <View style={[styles.inputContainer, { margin: 0, rowGap: 10 }]}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{ flex: 1 }}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.containerChild}>
          <Text style={{ color: 'grey', fontSize: 15 }}>KHU VỰC</Text>
          <View style={[styles.inputContainer, { margin: 0 }]}>
            <Ionicons name="location-outline" size={20} color="#6B7280" style={{ marginRight: 5 }} />
            <TextInput value={location} onChangeText={setLocation} style={{ flex: 1 }} />
          </View>
        </View>

        <View style={[styles.containerChild, { marginTop: 10, alignItems: 'center' }]}>
          <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            )}
          </Pressable>
        </View>

        <View
          style={{
            alignItems: 'center',
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            columnGap: 20,
          }}>
          <Pressable onPress={() => navigation.navigate('Change Password')}>
            <Text style={{ color: '#00AEEF', fontWeight: '600' }}>Đổi mật khẩu</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Delete Account')}>
            <Text style={{ color: '#E53935', fontWeight: '600' }}>Xóa tài khoản</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
