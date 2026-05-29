import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../lib/api/notifications';
import type { NotificationItem } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

function iconForNotification(type: NotificationItem['type']) {
  if (type === 'booking_status') {
    return { name: 'calendar-outline' as const, tint: '#fef3c7', color: '#d97706' };
  }
  if (type === 'review_reply') {
    return { name: 'chatbubble-ellipses-outline' as const, tint: '#ede9fe', color: '#5b21b6' };
  }
  return { name: 'megaphone-outline' as const, tint: '#dff5ff', color: colors.primary };
}

function resolveTarget(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as { screen?: unknown; params?: unknown };
  if (typeof value.screen !== 'string') {
    return null;
  }

  return {
    screen: value.screen,
    params: value.params,
  };
}

export default function NotificationsScreen({
  navigation,
}: AppScreenProps<'Notifications'>) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setLoadError(null);
    } catch (error) {
      setNotifications([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        }))
      );
    } catch (error) {
      setLoadError(toUserMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpen = async (item: NotificationItem) => {
    setMutatingId(item.id);
    try {
      if (!item.readAt) {
        const updated = await markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((entry) => (entry.id === item.id ? updated : entry))
        );
      }

      const target = resolveTarget(item.payload);
      if (target) {
        (navigation.navigate as (...args: any[]) => void)(target.screen, target.params);
      }
    } catch (error) {
      setLoadError(toUserMessage(error));
    } finally {
      setMutatingId(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setMutatingId(notificationId);
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
    } catch (error) {
      setLoadError(toUserMessage(error));
    } finally {
      setMutatingId(null);
    }
  };

  if (loading && notifications.length === 0 && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      testID="notifications-list"
      data={notifications}
      keyExtractor={(item) => item.id}
      refreshing={loading}
      onRefresh={loadNotifications}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: withBottomInset(insets.bottom, 24),
        gap: 14,
      }}
      ListHeaderComponent={
        <View style={{ gap: 14 }}>
          <View
            style={{
              borderRadius: 24,
              backgroundColor: '#ffffff',
              padding: 20,
              borderWidth: 1,
              borderColor: '#e7eef5',
            }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>
              Trung tâm thông báo
            </Text>
            <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 22 }}>
              Theo dõi booking được cập nhật, phản hồi từ chủ địa điểm và các tin mới từ địa điểm bạn đang quan tâm.
            </Text>
            <Pressable
              onPress={() => void handleMarkAll()}
              style={{
                alignSelf: 'flex-start',
                marginTop: 14,
                borderRadius: 14,
                backgroundColor: '#111827',
                paddingHorizontal: 16,
                paddingVertical: 11,
                opacity: markingAll ? 0.7 : 1,
              }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {markingAll ? 'Đang cập nhật...' : 'Đánh dấu đã đọc tất cả'}
              </Text>
            </Pressable>
          </View>
          {loadError ? (
            <View
              style={{
                borderRadius: 18,
                backgroundColor: '#fff7f7',
                borderWidth: 1,
                borderColor: '#f7c9c7',
                padding: 16,
              }}>
              <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 16 }}>
                Không thể tải thông báo
              </Text>
              <Text style={{ marginTop: 6, color: colors.textSecondary, lineHeight: 21 }}>
                {loadError}
              </Text>
            </View>
          ) : null}
        </View>
      }
      renderItem={({ item }) => {
        const icon = iconForNotification(item.type);
        const isUnread = !item.readAt;
        const isMutating = mutatingId === item.id;

        return (
          <Pressable
            onPress={() => void handleOpen(item)}
            style={{
              borderRadius: 22,
              backgroundColor: '#ffffff',
              padding: 18,
              borderWidth: 1,
              borderColor: isUnread ? '#bde7f3' : '#e7eef5',
              opacity: isMutating ? 0.85 : 1,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: icon.tint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name={icon.name} size={22} color={icon.color} />
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}>
                  <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                    {item.title}
                  </Text>
                  {isUnread ? (
                    <View
                      style={{
                        borderRadius: 999,
                        backgroundColor: '#dff5ff',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}>
                      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>
                        Mới
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 22 }}>
                  {item.message}
                </Text>
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </Text>
                  <Pressable
                    onPress={() => void handleDelete(item.id)}
                    style={{
                      borderRadius: 12,
                      backgroundColor: '#fee2e2',
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                    }}>
                    <Text style={{ color: colors.danger, fontWeight: '800' }}>Xóa</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        !loadError ? (
          <View
            style={{
              borderRadius: 24,
              backgroundColor: '#ffffff',
              padding: 22,
              borderWidth: 1,
              borderColor: '#e7eef5',
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>
              Chưa có thông báo nào
            </Text>
            <Text
              style={{
                marginTop: 8,
                color: colors.textSecondary,
                lineHeight: 22,
                textAlign: 'center',
              }}>
              Khi chủ địa điểm phản hồi review, cập nhật booking hoặc địa điểm bạn quan tâm có tin mới, thông báo sẽ hiện tại đây.
            </Text>
          </View>
        ) : null
      }
    />
  );
}
