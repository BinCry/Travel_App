import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBooking, fetchPlaceBookingOptions, quoteBooking } from '../../../lib/api/bookings';
import type { BookingOption, BookingQuote } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

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

export default function BookingCheckoutScreen({
  navigation,
  route,
}: AppScreenProps<'Booking Checkout'>) {
  const insets = useSafeAreaInsets();
  const placeId = route.params.placeId;
  const placeName = route.params.placeName ?? 'Địa điểm';
  const [options, setOptions] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [partySize, setPartySize] = useState('2');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlaceBookingOptions(placeId);
      setOptions(data);
      setLoadError(null);
      const firstAvailableSlot = data
        .flatMap((option: BookingOption) => option.slots)
        .find((slot: BookingOption['slots'][number]) => slot.isBookable);
      setSelectedSlotId((current) => {
        if (
          current &&
          data.some((option: BookingOption) =>
            option.slots.some((slot: BookingOption['slots'][number]) => slot.id === current)
          )
        ) {
          return current;
        }
        return firstAvailableSlot?.id ?? null;
      });
    } catch (error) {
      setOptions([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const selectedBookingContext = useMemo(() => {
    for (const option of options) {
      const slot = option.slots.find(
        (item: BookingOption['slots'][number]) => item.id === selectedSlotId
      );
      if (slot) {
        return { option, slot };
      }
    }
    return null;
  }, [options, selectedSlotId]);

  const parsedPartySize = useMemo(() => Number.parseInt(partySize, 10), [partySize]);

  useEffect(() => {
    if (!selectedSlotId || !Number.isFinite(parsedPartySize) || parsedPartySize < 1) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      setQuoteLoading(true);
      quoteBooking({
        slotId: selectedSlotId,
        partySize: parsedPartySize,
        voucherCode: voucherCode.trim() || undefined,
      })
        .then((data) => {
          if (!active) {
            return;
          }
          setQuote(data);
          setQuoteError(null);
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          setQuote(null);
          setQuoteError(toUserMessage(error));
        })
        .finally(() => {
          if (active) {
            setQuoteLoading(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [parsedPartySize, selectedSlotId, voucherCode]);

  const handleSubmit = async () => {
    if (!selectedSlotId) {
      Alert.alert('Chưa chọn lịch', 'Hãy chọn một khung giờ còn chỗ trước khi tiếp tục.');
      return;
    }
    if (!Number.isFinite(parsedPartySize) || parsedPartySize < 1) {
      Alert.alert('Số người chưa hợp lệ', 'Vui lòng nhập số người từ 1 trở lên.');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        slotId: selectedSlotId,
        partySize: parsedPartySize,
        note: note.trim() || undefined,
        voucherCode: voucherCode.trim() || undefined,
      });
      Alert.alert('Đặt chỗ thành công', 'Booking của bạn đã được gửi để chủ địa điểm xác nhận.', [
        {
          text: 'Xem lịch sử',
          onPress: () => navigation.navigate('Booking History'),
        },
      ]);
    } catch (error) {
      Alert.alert('Không thể tạo booking', toUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && options.length === 0 && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 18, paddingBottom: withBottomInset(insets.bottom, 28) }}
      showsVerticalScrollIndicator={false}>
      <View
        style={{
          borderRadius: 24,
          backgroundColor: '#ffffff',
          padding: 20,
          borderWidth: 1,
          borderColor: '#e5edf4',
          rowGap: 10,
        }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
          Đặt chỗ tại {placeName}
        </Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
          Chọn option phù hợp, kiểm tra số chỗ còn lại và gửi yêu cầu booking ngay trên app.
        </Text>
      </View>

      {loadError ? (
        <View
          style={{
            marginTop: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#fecaca',
            backgroundColor: '#fff7f7',
            padding: 18,
          }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.danger }}>
            Không thể tải lịch đặt chỗ
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 22 }}>
            {loadError}
          </Text>
          <Pressable
            onPress={() => void loadOptions()}
            style={{
              marginTop: 12,
              alignSelf: 'flex-start',
              borderRadius: 14,
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 11,
            }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={{ marginTop: 20, rowGap: 16 }}>
        {options.map((option) => (
          <View
            key={option.id}
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: '#e5edf4',
              backgroundColor: '#ffffff',
              padding: 18,
              rowGap: 14,
            }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
                {option.title}
              </Text>
              {option.description ? (
                <Text style={{ color: colors.textSecondary, lineHeight: 21 }}>
                  {option.description}
                </Text>
              ) : null}
              <Text style={{ color: colors.textSecondary }}>
                {option.priceLabel || 'Liên hệ chủ địa điểm để xác nhận giá'} • Tối đa {option.maxPartySize}{' '}
                người • {option.durationMinutes} phút
              </Text>
            </View>

            {option.slots.length ? (
              <View style={{ gap: 10 }}>
                {option.slots.map((slot: BookingOption['slots'][number]) => {
                  const selected = slot.id === selectedSlotId;
                  return (
                    <Pressable
                      key={slot.id}
                      disabled={!slot.isBookable}
                      onPress={() => setSelectedSlotId(slot.id)}
                      style={{
                        borderRadius: 18,
                        borderWidth: 1.5,
                        borderColor: selected ? colors.primary : '#dbe7ef',
                        backgroundColor: selected ? '#eef8fb' : '#f9fcfe',
                        padding: 14,
                        opacity: slot.isBookable ? 1 : 0.55,
                        gap: 6,
                      }}>
                      <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
                        {slot.dateLabel} • {slot.timeLabel}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        Còn {slot.remainingCapacity}/{slot.capacity} chỗ
                      </Text>
                      {!slot.isBookable ? (
                        <Text style={{ color: colors.danger, fontWeight: '700' }}>
                          Slot này hiện không khả dụng
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary }}>
                Chủ địa điểm chưa mở slot nào cho option này.
              </Text>
            )}
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 20,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: '#e5edf4',
          backgroundColor: '#ffffff',
          padding: 18,
          rowGap: 14,
        }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
          Thông tin booking
        </Text>
        <View>
          <Text style={{ marginBottom: 8, color: colors.textSecondary, fontWeight: '600' }}>
            Số người đi cùng
          </Text>
          <TextInput
            value={partySize}
            onChangeText={setPartySize}
            keyboardType="number-pad"
            placeholder="Ví dụ: 2"
            style={{
              minHeight: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#d6e4ec',
              paddingHorizontal: 14,
              fontSize: 16,
            }}
          />
        </View>
        <View>
          <Text style={{ marginBottom: 8, color: colors.textSecondary, fontWeight: '600' }}>
            Ghi chú cho chủ địa điểm
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ví dụ: cần bàn gần cửa sổ hoặc đi cùng trẻ nhỏ"
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 110,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#d6e4ec',
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 16,
            }}
          />
        </View>
        <View>
          <Text style={{ marginBottom: 8, color: colors.textSecondary, fontWeight: '600' }}>
            Voucher / coupon
          </Text>
          <TextInput
            value={voucherCode}
            onChangeText={(value) => setVoucherCode(value.toUpperCase())}
            placeholder="Ví dụ: SUMMER2026"
            autoCapitalize="characters"
            style={{
              minHeight: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#d6e4ec',
              paddingHorizontal: 14,
              fontSize: 16,
            }}
          />
          <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 20 }}>
            Khi nhập voucher, hệ thống sẽ tự kiểm tra hiệu lực theo slot, thời gian và số lượt còn lại.
          </Text>
        </View>
        {selectedBookingContext ? (
          <View
            style={{
              borderRadius: 16,
              backgroundColor: '#f8fbfd',
              padding: 14,
              gap: 4,
            }}>
            <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
              Bạn đang chọn: {selectedBookingContext.option.title}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {selectedBookingContext.slot.dateLabel} • {selectedBookingContext.slot.timeLabel}
            </Text>
            {quoteLoading ? (
              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ color: colors.textSecondary }}>Đang tính giá booking...</Text>
              </View>
            ) : quote ? (
              <View style={{ marginTop: 6, gap: 4 }}>
                <Text style={{ color: colors.textSecondary }}>
                  Đơn giá: {formatCurrency(quote.unitPriceAmount, quote.currency)}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Tạm tính: {formatCurrency(quote.subtotalAmount, quote.currency)}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Giảm giá: {formatCurrency(quote.discountAmount, quote.currency)}
                </Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>
                  Thành tiền: {formatCurrency(quote.finalAmount, quote.currency)}
                </Text>
                {quote.appliedVoucherCode ? (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>
                    Voucher áp dụng: {quote.appliedVoucherCode}
                  </Text>
                ) : null}
              </View>
            ) : quoteError ? (
              <Text style={{ marginTop: 6, color: colors.danger, lineHeight: 20 }}>{quoteError}</Text>
            ) : (
              <Text style={{ marginTop: 6, color: colors.textSecondary }}>
                Giá cơ bản: {formatCurrency(
                  selectedBookingContext.option.basePriceAmount,
                  selectedBookingContext.option.currency
                )}
              </Text>
            )}
          </View>
        ) : (
          <Text style={{ color: colors.danger }}>
            Chưa có slot nào được chọn. Hãy chọn một khung giờ phù hợp ở trên.
          </Text>
        )}
        <Pressable
          testID="submit-booking-button"
          onPress={() => void handleSubmit()}
          disabled={submitting || !selectedBookingContext}
          style={{
            borderRadius: 16,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: submitting || !selectedBookingContext ? 0.6 : 1,
          }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            {submitting ? 'Đang gửi booking...' : 'Gửi yêu cầu đặt chỗ'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
