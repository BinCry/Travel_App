import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cancelBooking, fetchMyBookingDetail } from '../../../lib/api/bookings';
import type { TravelerBooking, TravelerBookingDetail } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

function statusTone(status: TravelerBooking['status']) {
  switch (status) {
    case 'CONFIRMED':
      return { backgroundColor: '#dcfce7', color: '#166534', label: 'Đã xác nhận' };
    case 'PENDING':
      return { backgroundColor: '#fef3c7', color: '#92400e', label: 'Chờ xác nhận' };
    case 'REJECTED':
      return { backgroundColor: '#fee2e2', color: '#b91c1c', label: 'Đã từ chối' };
    case 'CANCELLED':
      return { backgroundColor: '#e5e7eb', color: '#4b5563', label: 'Đã hủy' };
    case 'COMPLETED':
      return { backgroundColor: '#dbeafe', color: '#1d4ed8', label: 'Hoàn tất' };
    case 'NO_SHOW':
      return { backgroundColor: '#fde68a', color: '#92400e', label: 'Không đến' };
    case 'REFUND_PENDING':
      return { backgroundColor: '#e0f2fe', color: '#0369a1', label: 'Chờ hoàn tiền' };
    case 'REFUNDED':
      return { backgroundColor: '#ddd6fe', color: '#5b21b6', label: 'Đã hoàn tiền' };
    default:
      return { backgroundColor: '#e0f2fe', color: '#0f766e', label: status };
  }
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  }
}

function formatActorName(actorName: string | null, actorRole: 'traveler' | 'owner' | 'system' | null) {
  if (actorName) {
    return actorName;
  }
  if (actorRole === 'traveler') {
    return 'Bạn';
  }
  if (actorRole === 'owner') {
    return 'Chủ địa điểm';
  }
  return 'Hệ thống';
}

export default function BookingDetailScreen({
  route,
}: AppScreenProps<'Booking Detail'>) {
  const insets = useSafeAreaInsets();
  const bookingId = route.params.bookingId;
  const [booking, setBooking] = useState<TravelerBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadBooking = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookingDetail(bookingId);
      setBooking(data);
      setLoadError(null);
      setCancelReason(data.cancellationReason ?? '');
    } catch (error) {
      setBooking(null);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      void loadBooking();
    }, [loadBooking])
  );

  const handleCancel = async () => {
    if (!booking) {
      return;
    }
    setCancelling(true);
    try {
      await cancelBooking(booking.id, {
        cancellationReason: cancelReason.trim() || undefined,
      });
      await loadBooking();
      Alert.alert('Đã gửi hủy booking', 'Booking của bạn đã được cập nhật thành công.');
    } catch (error) {
      Alert.alert('Không thể hủy booking', toUserMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !booking && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
          Không thể tải chi tiết booking
        </Text>
        <Text style={{ marginTop: 8, textAlign: 'center', color: colors.textSecondary, lineHeight: 22 }}>
          {loadError ?? 'Booking hiện không khả dụng.'}
        </Text>
        <Pressable
          onPress={() => void loadBooking()}
          style={{
            marginTop: 14,
            borderRadius: 14,
            backgroundColor: colors.primary,
            paddingHorizontal: 18,
            paddingVertical: 12,
          }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tải lại</Text>
        </Pressable>
      </View>
    );
  }

  const tone = statusTone(booking.status);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 18, paddingBottom: withBottomInset(insets.bottom, 28) }}
      showsVerticalScrollIndicator={false}>
      <View
        style={{
          borderRadius: 24,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5edf4',
          overflow: 'hidden',
        }}>
        <Image
          source={{ uri: booking.placeImageUrl }}
          style={{ width: '100%', height: 200, backgroundColor: '#eef4f8' }}
        />
        <View style={{ padding: 20, rowGap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>
                {booking.placeName}
              </Text>
              <Text style={{ marginTop: 4, color: colors.textSecondary }}>{booking.optionTitle}</Text>
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                borderRadius: 999,
                backgroundColor: tone.backgroundColor,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}>
              <Text style={{ color: tone.color, fontWeight: '700' }}>{tone.label}</Text>
            </View>
          </View>

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Lịch đặt chỗ</Text>
            <Text style={infoValueStyle}>
              {booking.slotDateLabel} • {booking.slotTimeLabel}
            </Text>
            <Text style={infoMetaStyle}>Số người: {booking.partySize}</Text>
            {booking.note ? <Text style={infoMetaStyle}>Ghi chú: {booking.note}</Text> : null}
          </View>

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Thanh toán & ưu đãi</Text>
            <Text style={infoMetaStyle}>
              Đơn giá: {formatCurrency(booking.unitPriceAmount, booking.currency)}
            </Text>
            <Text style={infoMetaStyle}>
              Tạm tính: {formatCurrency(booking.subtotalAmount, booking.currency)}
            </Text>
            <Text style={infoMetaStyle}>
              Giảm giá: {formatCurrency(booking.discountAmount, booking.currency)}
            </Text>
            <Text style={[infoValueStyle, { marginTop: 2 }]}>
              Thành tiền: {formatCurrency(booking.finalAmount, booking.currency)}
            </Text>
            {booking.appliedVoucherCode ? (
              <Text style={[infoMetaStyle, { color: colors.primary }]}>
                Voucher đã áp dụng: {booking.appliedVoucherCode}
              </Text>
            ) : null}
          </View>

          {(booking.ownerDecisionNote || booking.cancellationReason) && (
            <View style={infoCardStyle}>
              <Text style={infoTitleStyle}>Ghi chú nghiệp vụ</Text>
              {booking.ownerDecisionNote ? (
                <Text style={infoMetaStyle}>Ghi chú từ chủ địa điểm: {booking.ownerDecisionNote}</Text>
              ) : null}
              {booking.cancellationReason ? (
                <Text style={infoMetaStyle}>Lý do hủy: {booking.cancellationReason}</Text>
              ) : null}
            </View>
          )}

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Lịch sử trạng thái</Text>
            <View style={{ gap: 10 }}>
              {booking.history.map((entry) => {
                const historyTone = statusTone(entry.status);
                return (
                  <View
                    key={entry.id}
                    style={{
                      borderRadius: 14,
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#e7eef5',
                      padding: 12,
                      rowGap: 4,
                    }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                      <Text style={{ fontWeight: '800', color: historyTone.color }}>
                        {statusTone(entry.status).label}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {new Date(entry.createdAt).toLocaleString('vi-VN')}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      {formatActorName(entry.actorName, entry.actorRole)}
                    </Text>
                    {entry.note ? (
                      <Text style={{ color: colors.textPrimary, lineHeight: 20 }}>{entry.note}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          {booking.canCancel ? (
            <View style={infoCardStyle}>
              <Text style={infoTitleStyle}>Hủy booking</Text>
              <Text style={infoMetaStyle}>
                Bạn có thể hủy khi booking vẫn còn ở trạng thái chờ hoặc đã được xác nhận.
              </Text>
              <TextInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Lý do hủy (không bắt buộc)"
                multiline
                textAlignVertical="top"
                style={{
                  minHeight: 96,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#d6e4ec',
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.textPrimary,
                  backgroundColor: '#fff',
                }}
              />
              <Pressable
                onPress={() => void handleCancel()}
                disabled={cancelling}
                style={{
                  borderRadius: 16,
                  backgroundColor: '#111827',
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: cancelling ? 0.6 : 1,
                }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                  {cancelling ? 'Đang hủy...' : 'Hủy booking'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const infoCardStyle = {
  borderRadius: 18,
  backgroundColor: '#f8fbfd',
  padding: 16,
  rowGap: 6,
} as const;

const infoTitleStyle = {
  fontSize: 18,
  fontWeight: '800',
  color: colors.textPrimary,
} as const;

const infoValueStyle = {
  color: colors.textPrimary,
  fontWeight: '700',
  lineHeight: 22,
} as const;

const infoMetaStyle = {
  color: colors.textSecondary,
  lineHeight: 21,
} as const;
