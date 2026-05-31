import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
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
import { fetchOwnerBookingDetail, updateOwnerBookingStatus } from '../../../lib/api/owner';
import type {
  OwnerBookingDetail,
  OwnerBookingStatusUpdateRequest,
  TravelerBooking,
} from '../../../lib/api/types';
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
    return 'Khách đặt chỗ';
  }
  if (actorRole === 'owner') {
    return 'Chủ địa điểm';
  }
  return 'Hệ thống';
}

function availableActions(status: TravelerBooking['status']) {
  if (status === 'PENDING') {
    return [
      { label: 'Xác nhận', status: 'CONFIRMED' as const },
      { label: 'Từ chối', status: 'REJECTED' as const },
      { label: 'Hủy booking', status: 'CANCELLED' as const },
    ];
  }
  if (status === 'CONFIRMED') {
    return [
      { label: 'Hoàn tất', status: 'COMPLETED' as const },
      { label: 'No-show', status: 'NO_SHOW' as const },
      { label: 'Hủy booking', status: 'CANCELLED' as const },
    ];
  }
  if (status === 'REFUND_PENDING') {
    return [{ label: 'Đánh dấu đã hoàn tiền', status: 'REFUNDED' as const }];
  }
  return [];
}

export default function OwnerBookingDetailScreen({
  route,
}: AppScreenProps<'Owner Booking Detail'>) {
  const insets = useSafeAreaInsets();
  const bookingId = route.params.bookingId;
  const [booking, setBooking] = useState<OwnerBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [statusLoading, setStatusLoading] = useState<OwnerBookingStatusUpdateRequest['status'] | null>(null);

  const loadBooking = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOwnerBookingDetail(bookingId);
      setBooking(data);
      setLoadError(null);
      setNote(data.ownerDecisionNote ?? data.cancellationReason ?? '');
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

  const actions = useMemo(
    () => (booking ? availableActions(booking.status) : []),
    [booking]
  );

  const handleStatusUpdate = async (nextStatus: OwnerBookingStatusUpdateRequest['status']) => {
    if (!booking) {
      return;
    }
    setStatusLoading(nextStatus);
    try {
      const payload: OwnerBookingStatusUpdateRequest = {
        status: nextStatus,
      };
      if (nextStatus === 'REJECTED' || nextStatus === 'CANCELLED') {
        payload.cancellationReason = note.trim() || undefined;
      } else {
        payload.ownerDecisionNote = note.trim() || undefined;
      }
      await updateOwnerBookingStatus(booking.id, payload);
      await loadBooking();
      Alert.alert('Đã cập nhật booking', 'Trạng thái booking đã được đồng bộ.');
    } catch (error) {
      Alert.alert('Không thể cập nhật booking', toUserMessage(error));
    } finally {
      setStatusLoading(null);
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
          Không thể tải booking này
        </Text>
        <Text style={{ marginTop: 8, textAlign: 'center', color: colors.textSecondary, lineHeight: 22 }}>
          {loadError ?? 'Dữ liệu booking hiện không khả dụng.'}
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
            <Text style={infoTitleStyle}>Khách đặt chỗ</Text>
            <Text style={infoValueStyle}>{booking.travelerName}</Text>
            <Text style={infoMetaStyle}>{booking.travelerEmail}</Text>
          </View>

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Thông tin booking</Text>
            <Text style={infoValueStyle}>
              {booking.slotDateLabel} • {booking.slotTimeLabel}
            </Text>
            <Text style={infoMetaStyle}>Số người: {booking.partySize}</Text>
            {booking.note ? <Text style={infoMetaStyle}>Ghi chú từ khách: {booking.note}</Text> : null}
          </View>

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Doanh thu & voucher</Text>
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
                Voucher áp dụng: {booking.appliedVoucherCode}
              </Text>
            ) : null}
          </View>

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Lịch sử trạng thái</Text>
            <View style={{ gap: 10 }}>
              {booking.history.map((entry) => (
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
                    <Text style={{ fontWeight: '800', color: statusTone(entry.status).color }}>
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
              ))}
            </View>
          </View>

          <View style={infoCardStyle}>
            <Text style={infoTitleStyle}>Ghi chú xử lý</Text>
            <Text style={infoMetaStyle}>
              Dùng trường này để ghi chú xác nhận, lý do từ chối/hủy hoặc cập nhật nghiệp vụ cho booking.
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ví dụ: Giữ bàn đến 18:15 hoặc khách xin dời lịch"
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
            {actions.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {actions.map((action) => (
                  <Pressable
                    key={action.status}
                    onPress={() => void handleStatusUpdate(action.status)}
                    disabled={statusLoading !== null}
                    style={{
                      borderRadius: 14,
                      backgroundColor:
                        action.status === 'CONFIRMED'
                          ? '#0ea5e9'
                          : action.status === 'COMPLETED'
                            ? '#2563eb'
                            : action.status === 'REJECTED' || action.status === 'CANCELLED'
                              ? '#111827'
                              : '#334155',
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      opacity: statusLoading !== null ? 0.6 : 1,
                    }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      {statusLoading === action.status ? 'Đang xử lý...' : action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={infoMetaStyle}>
                Booking này hiện không còn thao tác trạng thái nào hợp lệ ở bước hiện tại.
              </Text>
            )}
          </View>
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
