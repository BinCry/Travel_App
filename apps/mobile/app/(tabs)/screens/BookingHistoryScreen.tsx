import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { cancelBooking, fetchMyBookings } from '../../../lib/api/bookings';
import type { TravelerBooking } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import type { AppNavigationOnlyProps } from '../types/navigation';

function statusTone(status: TravelerBooking['status']) {
  switch (status) {
    case 'CONFIRMED':
      return { backgroundColor: '#dcfce7', color: '#166534' };
    case 'PENDING':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'REJECTED':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    case 'CANCELLED':
      return { backgroundColor: '#e5e7eb', color: '#4b5563' };
    case 'COMPLETED':
      return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
    case 'NO_SHOW':
      return { backgroundColor: '#fde68a', color: '#92400e' };
    default:
      return { backgroundColor: '#e0f2fe', color: '#0f766e' };
  }
}

export default function BookingHistoryScreen({
  navigation,
}: AppNavigationOnlyProps<'Booking History'>) {
  const [bookings, setBookings] = useState<TravelerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
      setLoadError(null);
    } catch (error) {
      setBookings([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBookings();
    }, [loadBookings])
  );

  const handleCancel = (bookingId: string) => {
    Alert.alert('Hủy booking', 'Bạn có chắc muốn hủy booking này không?', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Hủy booking',
        style: 'destructive',
        onPress: async () => {
          setCancellingId(bookingId);
          try {
            await cancelBooking(bookingId);
            await loadBookings();
          } catch (error) {
            Alert.alert('Không thể hủy booking', toUserMessage(error));
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  if (loading && bookings.length === 0 && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 18, paddingBottom: 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={loadBookings}
      ListHeaderComponent={
        <View style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
            Lịch đặt chỗ
          </Text>
          <Text style={{ marginTop: 6, color: colors.textSecondary, lineHeight: 22 }}>
            Theo dõi tất cả booking bạn đã tạo, xem trạng thái xác nhận và hủy nhanh khi cần.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View
          style={{
            marginTop: 24,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#dbe7ef',
            backgroundColor: '#ffffff',
            padding: 22,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: colors.textPrimary,
              textAlign: 'center',
            }}>
            {loadError ? 'Không thể tải lịch đặt chỗ' : 'Bạn chưa có booking nào'}
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: colors.textSecondary,
              lineHeight: 22,
              textAlign: 'center',
            }}>
            {loadError ??
              'Khi bạn đặt bàn hoặc giữ chỗ tại địa điểm, lịch sử sẽ xuất hiện tại đây để dễ theo dõi.'}
          </Text>
          <Pressable
            onPress={() => void loadBookings()}
            style={{
              marginTop: 14,
              borderRadius: 14,
              backgroundColor: colors.primary,
              paddingHorizontal: 18,
              paddingVertical: 12,
            }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>
              {loadError ? 'Thử tải lại' : 'Làm mới'}
            </Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const tone = statusTone(item.status);
        return (
          <Pressable
            onPress={() => navigation.navigate('Detail Location', { placeId: item.placeId })}
            style={{
              borderRadius: 24,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e7eef5',
              overflow: 'hidden',
            }}>
            <Image
              source={{ uri: item.placeImageUrl }}
              style={{ width: '100%', height: 180, backgroundColor: '#eef4f8' }}
            />
            <View style={{ padding: 18, rowGap: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}
                    numberOfLines={1}>
                    {item.placeName}
                  </Text>
                  <Text style={{ marginTop: 4, color: colors.textSecondary }}>
                    {item.optionTitle}
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    backgroundColor: tone.backgroundColor,
                  }}>
                  <Text style={{ color: tone.color, fontWeight: '700' }}>{item.status}</Text>
                </View>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: '#f8fbfd',
                  padding: 14,
                  rowGap: 6,
                }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {item.slotDateLabel} • {item.slotTimeLabel}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Số người: {item.partySize}
                </Text>
                {item.note ? (
                  <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
                    Ghi chú: {item.note}
                  </Text>
                ) : null}
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Tạo lúc {new Date(item.createdAt).toLocaleString('vi-VN')}
              </Text>

              {item.canCancel ? (
                <Pressable
                  onPress={() => handleCancel(item.id)}
                  disabled={cancellingId === item.id}
                  style={{
                    alignSelf: 'flex-start',
                    borderRadius: 14,
                    backgroundColor: '#111827',
                    paddingHorizontal: 16,
                    paddingVertical: 11,
                    opacity: cancellingId === item.id ? 0.6 : 1,
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {cancellingId === item.id ? 'Đang hủy...' : 'Hủy booking'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        );
      }}
    />
  );
}
