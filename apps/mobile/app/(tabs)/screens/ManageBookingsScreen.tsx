import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  AvailabilitySlot,
  BookingOption,
  OwnerPlaceBooking,
  OwnerBookingStatusUpdateRequest,
} from '../../../lib/api/types';
import {
  createOwnerBookingOption,
  createOwnerSlot,
  deleteOwnerBookingOption,
  deleteOwnerSlot,
  fetchOwnerBookingOptions,
  fetchOwnerPlaceBookings,
  updateOwnerBookingOption,
  updateOwnerBookingStatus,
  updateOwnerSlot,
} from '../../../lib/api/owner';
import { colors } from '../common/colors';
import { withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

type OptionFormState = {
  title: string;
  description: string;
  priceLabel: string;
  durationMinutes: string;
  maxPartySize: string;
  isActive: boolean;
};

type SlotFormState = {
  optionId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  isActive: boolean;
};

const defaultOptionForm = (): OptionFormState => ({
  title: '',
  description: '',
  priceLabel: '',
  durationMinutes: '90',
  maxPartySize: '2',
  isActive: true,
});

const defaultSlotForm = (optionId: string | null = null): SlotFormState => ({
  optionId,
  date: '',
  startTime: '',
  endTime: '',
  capacity: '4',
  isActive: true,
});

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function toTimeInput(iso: string) {
  return new Date(iso).toISOString().slice(11, 16);
}

function toIsoDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function bookingTone(status: OwnerPlaceBooking['status']) {
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
    default:
      return { backgroundColor: '#f3f4f6', color: '#374151' };
  }
}

function actionButtonsForBooking(status: OwnerPlaceBooking['status']) {
  if (status === 'PENDING') {
    return [
      { label: 'Xác nhận', status: 'CONFIRMED' as const },
      { label: 'Từ chối', status: 'REJECTED' as const },
      { label: 'Hủy', status: 'CANCELLED' as const },
    ];
  }
  if (status === 'CONFIRMED') {
    return [
      { label: 'Hoàn tất', status: 'COMPLETED' as const },
      { label: 'No-show', status: 'NO_SHOW' as const },
      { label: 'Hủy', status: 'CANCELLED' as const },
    ];
  }
  return [];
}

export default function ManageBookingsScreen({
  route,
}: AppScreenProps<'Manage Bookings'>) {
  const insets = useSafeAreaInsets();
  const placeId = route.params.placeId;
  const placeName = route.params.placeName ?? 'Địa điểm';
  const [options, setOptions] = useState<BookingOption[]>([]);
  const [bookings, setBookings] = useState<OwnerPlaceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [optionForm, setOptionForm] = useState<OptionFormState>(defaultOptionForm);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [savingOption, setSavingOption] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState<SlotFormState>(defaultSlotForm);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [savingSlot, setSavingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [nextOptions, nextBookings] = await Promise.all([
        fetchOwnerBookingOptions(placeId),
        fetchOwnerPlaceBookings(placeId),
      ]);
      setOptions(nextOptions);
      setBookings(nextBookings);
      setLoadError(null);
    } catch (error) {
      setOptions([]);
      setBookings([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const selectedOptionTitle = useMemo(() => {
    const option = options.find((item) => item.id === slotForm.optionId);
    return option?.title ?? null;
  }, [options, slotForm.optionId]);

  const resetOptionEditor = () => {
    setEditingOptionId(null);
    setOptionForm(defaultOptionForm());
  };

  const resetSlotEditor = () => {
    setEditingSlotId(null);
    setSlotForm(defaultSlotForm());
  };

  const handleSaveOption = async () => {
    const durationMinutes = Number.parseInt(optionForm.durationMinutes, 10);
    const maxPartySize = Number.parseInt(optionForm.maxPartySize, 10);
    if (!optionForm.title.trim()) {
      Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tên option booking.');
      return;
    }
    if (!Number.isFinite(durationMinutes) || !Number.isFinite(maxPartySize)) {
      Alert.alert('Dữ liệu chưa hợp lệ', 'Thời lượng và số người tối đa phải là số hợp lệ.');
      return;
    }

    setSavingOption(true);
    try {
      const payload = {
        title: optionForm.title.trim(),
        description: optionForm.description.trim() || undefined,
        priceLabel: optionForm.priceLabel.trim() || undefined,
        durationMinutes,
        maxPartySize,
        isActive: optionForm.isActive,
      };
      if (editingOptionId) {
        await updateOwnerBookingOption(editingOptionId, payload);
      } else {
        await createOwnerBookingOption(placeId, payload);
      }
      resetOptionEditor();
      await loadData();
    } catch (error) {
      Alert.alert('Không thể lưu option', toUserMessage(error));
    } finally {
      setSavingOption(false);
    }
  };

  const handleSaveSlot = async () => {
    const capacity = Number.parseInt(slotForm.capacity, 10);
    if (!slotForm.optionId || !slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      Alert.alert('Thiếu thông tin', 'Hãy nhập đủ ngày, giờ bắt đầu và giờ kết thúc cho slot.');
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      Alert.alert('Capacity chưa hợp lệ', 'Sức chứa phải là số lớn hơn 0.');
      return;
    }

    setSavingSlot(true);
    try {
      const payload = {
        startAt: toIsoDateTime(slotForm.date, slotForm.startTime),
        endAt: toIsoDateTime(slotForm.date, slotForm.endTime),
        capacity,
        isActive: slotForm.isActive,
      };
      if (editingSlotId) {
        await updateOwnerSlot(editingSlotId, payload);
      } else {
        await createOwnerSlot(slotForm.optionId, payload);
      }
      resetSlotEditor();
      await loadData();
    } catch (error) {
      Alert.alert('Không thể lưu slot', toUserMessage(error));
    } finally {
      setSavingSlot(false);
    }
  };

  const handleStartEditOption = (option: BookingOption) => {
    setEditingOptionId(option.id);
    setOptionForm({
      title: option.title,
      description: option.description ?? '',
      priceLabel: option.priceLabel ?? '',
      durationMinutes: String(option.durationMinutes),
      maxPartySize: String(option.maxPartySize),
      isActive: option.isActive,
    });
  };

  const handleStartCreateSlot = (optionId: string) => {
    setEditingSlotId(null);
    setSlotForm(defaultSlotForm(optionId));
  };

  const handleStartEditSlot = (optionId: string, slot: AvailabilitySlot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      optionId,
      date: toDateInput(slot.startAt),
      startTime: toTimeInput(slot.startAt),
      endTime: toTimeInput(slot.endAt),
      capacity: String(slot.capacity),
      isActive: slot.isActive,
    });
  };

  const handleDeleteOption = (optionId: string) => {
    Alert.alert('Xóa option booking', 'Bạn có chắc muốn xóa option này không?', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeletingOptionId(optionId);
          try {
            await deleteOwnerBookingOption(optionId);
            await loadData();
          } catch (error) {
            Alert.alert('Không thể xóa option', toUserMessage(error));
          } finally {
            setDeletingOptionId(null);
          }
        },
      },
    ]);
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert('Xóa slot', 'Bạn có chắc muốn xóa slot này không?', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeletingSlotId(slotId);
          try {
            await deleteOwnerSlot(slotId);
            await loadData();
          } catch (error) {
            Alert.alert('Không thể xóa slot', toUserMessage(error));
          } finally {
            setDeletingSlotId(null);
          }
        },
      },
    ]);
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    nextStatus: OwnerBookingStatusUpdateRequest['status']
  ) => {
    setStatusLoadingId(bookingId);
    try {
      await updateOwnerBookingStatus(bookingId, { status: nextStatus });
      await loadData();
    } catch (error) {
      Alert.alert('Không thể cập nhật booking', toUserMessage(error));
    } finally {
      setStatusLoadingId(null);
    }
  };

  if (loading && options.length === 0 && bookings.length === 0 && !loadError) {
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
          borderWidth: 1,
          borderColor: '#e5edf4',
          backgroundColor: '#ffffff',
          padding: 20,
          rowGap: 10,
        }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
          Booking tại {placeName}
        </Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
          Tạo option đặt chỗ, mở slot theo ngày giờ cụ thể và xử lý booking của khách ngay trên mobile.
        </Text>
        <Pressable
          onPress={() => void loadData()}
          style={{
            alignSelf: 'flex-start',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#d5e6ef',
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}>
          <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Làm mới dữ liệu</Text>
        </Pressable>
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
            Không thể tải dữ liệu booking
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 22 }}>
            {loadError}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          marginTop: 20,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#e5edf4',
          backgroundColor: '#ffffff',
          padding: 18,
          rowGap: 12,
        }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
          {editingOptionId ? 'Chỉnh sửa option booking' : 'Tạo option booking'}
        </Text>
        <TextInput
          value={optionForm.title}
          onChangeText={(value) => setOptionForm((prev) => ({ ...prev, title: value }))}
          placeholder="Ví dụ: Bàn tối cho 2 người"
          style={inputStyle}
        />
        <TextInput
          value={optionForm.description}
          onChangeText={(value) => setOptionForm((prev) => ({ ...prev, description: value }))}
          placeholder="Mô tả ngắn cho khách"
          multiline
          textAlignVertical="top"
          style={[inputStyle, { minHeight: 90, paddingTop: 14 }]}
        />
        <TextInput
          value={optionForm.priceLabel}
          onChangeText={(value) => setOptionForm((prev) => ({ ...prev, priceLabel: value }))}
          placeholder="Ví dụ: 350.000đ / bàn"
          style={inputStyle}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TextInput
            value={optionForm.durationMinutes}
            onChangeText={(value) =>
              setOptionForm((prev) => ({ ...prev, durationMinutes: value }))
            }
            placeholder="90"
            keyboardType="number-pad"
            style={[inputStyle, { flex: 1 }]}
          />
          <TextInput
            value={optionForm.maxPartySize}
            onChangeText={(value) =>
              setOptionForm((prev) => ({ ...prev, maxPartySize: value }))
            }
            placeholder="2"
            keyboardType="number-pad"
            style={[inputStyle, { flex: 1 }]}
          />
        </View>
        <Pressable
          onPress={() => setOptionForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
          style={toggleStyle(optionForm.isActive)}>
          <Text style={toggleTextStyle(optionForm.isActive)}>
            {optionForm.isActive ? 'Đang mở nhận booking' : 'Tạm ẩn option'}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => void handleSaveOption()}
            disabled={savingOption}
            style={[primaryButtonStyle, { flex: 1, opacity: savingOption ? 0.6 : 1 }]}>
            <Text style={primaryButtonTextStyle}>
              {savingOption ? 'Đang lưu...' : editingOptionId ? 'Lưu thay đổi' : 'Tạo option'}
            </Text>
          </Pressable>
          {editingOptionId ? (
            <Pressable onPress={resetOptionEditor} style={[secondaryButtonStyle, { flex: 1 }]}>
              <Text style={secondaryButtonTextStyle}>Hủy chỉnh sửa</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={{ marginTop: 20, gap: 16 }}>
        {options.map((option) => (
          <View
            key={option.id}
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#e5edf4',
              backgroundColor: '#ffffff',
              padding: 18,
              rowGap: 14,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
                  {option.title}
                </Text>
                {option.description ? (
                  <Text style={{ marginTop: 6, color: colors.textSecondary, lineHeight: 21 }}>
                    {option.description}
                  </Text>
                ) : null}
                <Text style={{ marginTop: 6, color: colors.textSecondary }}>
                  {option.priceLabel || 'Chưa khai báo giá'} • {option.durationMinutes} phút • tối đa{' '}
                  {option.maxPartySize} người
                </Text>
              </View>
              <View style={toggleStyle(option.isActive)}>
                <Text style={toggleTextStyle(option.isActive)}>
                  {option.isActive ? 'Đang mở' : 'Đã ẩn'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Pressable
                onPress={() => handleStartEditOption(option)}
                style={[secondaryButtonStyle, { minWidth: 110 }]}>
                <Text style={secondaryButtonTextStyle}>Sửa option</Text>
              </Pressable>
              <Pressable
                onPress={() => handleStartCreateSlot(option.id)}
                style={[secondaryButtonStyle, { minWidth: 110 }]}>
                <Text style={secondaryButtonTextStyle}>Thêm slot</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDeleteOption(option.id)}
                disabled={deletingOptionId === option.id}
                style={[
                  {
                    borderRadius: 14,
                    backgroundColor: '#111827',
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    opacity: deletingOptionId === option.id ? 0.6 : 1,
                  },
                ]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  {deletingOptionId === option.id ? 'Đang xóa...' : 'Xóa option'}
                </Text>
              </Pressable>
            </View>

            {option.slots.length ? (
              <View style={{ gap: 10 }}>
                {option.slots.map((slot: BookingOption['slots'][number]) => (
                  <View
                    key={slot.id}
                    style={{
                      borderRadius: 18,
                      backgroundColor: '#f8fbfd',
                      padding: 14,
                      gap: 6,
                    }}>
                    <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
                      {slot.dateLabel} • {slot.timeLabel}
                    </Text>
                    <Text style={{ color: colors.textSecondary }}>
                      Capacity {slot.capacity} • Còn {slot.remainingCapacity} chỗ
                    </Text>
                    <Text style={{ color: slot.isActive ? '#166534' : '#b91c1c', fontWeight: '700' }}>
                      {slot.isActive ? 'Slot đang mở' : 'Slot đã tắt'}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      <Pressable
                        onPress={() => handleStartEditSlot(option.id, slot)}
                        style={[secondaryButtonStyle, { minWidth: 100 }]}>
                        <Text style={secondaryButtonTextStyle}>Sửa slot</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteSlot(slot.id)}
                        disabled={deletingSlotId === slot.id}
                        style={[
                          {
                            borderRadius: 14,
                            backgroundColor: '#111827',
                            paddingHorizontal: 14,
                            paddingVertical: 11,
                            opacity: deletingSlotId === slot.id ? 0.6 : 1,
                          },
                        ]}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>
                          {deletingSlotId === slot.id ? 'Đang xóa...' : 'Xóa slot'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary }}>
                Option này chưa có slot nào. Hãy thêm slot để khách có thể đặt chỗ.
              </Text>
            )}
          </View>
        ))}
      </View>

      {slotForm.optionId ? (
        <View
          style={{
            marginTop: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#e5edf4',
            backgroundColor: '#ffffff',
            padding: 18,
            rowGap: 12,
          }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
            {editingSlotId ? 'Chỉnh sửa slot' : `Thêm slot cho ${selectedOptionTitle ?? 'option'}`}
          </Text>
          <TextInput
            value={slotForm.date}
            onChangeText={(value) => setSlotForm((prev) => ({ ...prev, date: value }))}
            placeholder="YYYY-MM-DD"
            style={inputStyle}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              value={slotForm.startTime}
              onChangeText={(value) => setSlotForm((prev) => ({ ...prev, startTime: value }))}
              placeholder="18:00"
              style={[inputStyle, { flex: 1 }]}
            />
            <TextInput
              value={slotForm.endTime}
              onChangeText={(value) => setSlotForm((prev) => ({ ...prev, endTime: value }))}
              placeholder="19:30"
              style={[inputStyle, { flex: 1 }]}
            />
          </View>
          <TextInput
            value={slotForm.capacity}
            onChangeText={(value) => setSlotForm((prev) => ({ ...prev, capacity: value }))}
            placeholder="4"
            keyboardType="number-pad"
            style={inputStyle}
          />
          <Pressable
            onPress={() => setSlotForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            style={toggleStyle(slotForm.isActive)}>
            <Text style={toggleTextStyle(slotForm.isActive)}>
              {slotForm.isActive ? 'Slot đang mở' : 'Slot tạm ẩn'}
            </Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => void handleSaveSlot()}
              disabled={savingSlot}
              style={[primaryButtonStyle, { flex: 1, opacity: savingSlot ? 0.6 : 1 }]}>
              <Text style={primaryButtonTextStyle}>
                {savingSlot ? 'Đang lưu...' : editingSlotId ? 'Lưu slot' : 'Tạo slot'}
              </Text>
            </Pressable>
            <Pressable onPress={resetSlotEditor} style={[secondaryButtonStyle, { flex: 1 }]}>
              <Text style={secondaryButtonTextStyle}>Hủy</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View
        style={{
          marginTop: 20,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#e5edf4',
          backgroundColor: '#ffffff',
          padding: 18,
          rowGap: 14,
        }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
          Booking từ khách
        </Text>
        {bookings.length ? (
          bookings.map((booking) => {
            const tone = bookingTone(booking.status);
            const actions = actionButtonsForBooking(booking.status);
            return (
              <View
                key={booking.id}
                style={{
                  borderRadius: 18,
                  backgroundColor: '#f8fbfd',
                  padding: 14,
                  gap: 8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                      {booking.travelerName}
                    </Text>
                    <Text style={{ marginTop: 4, color: colors.textSecondary }}>
                      {booking.travelerEmail}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderRadius: 999,
                      backgroundColor: tone.backgroundColor,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                    }}>
                    <Text style={{ color: tone.color, fontWeight: '700' }}>{booking.status}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {booking.optionTitle}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {booking.slotDateLabel} • {booking.slotTimeLabel} • {booking.partySize} người
                </Text>
                {booking.note ? (
                  <Text style={{ color: colors.textSecondary, lineHeight: 21 }}>
                    Ghi chú: {booking.note}
                  </Text>
                ) : null}
                {actions.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    {actions.map((action) => (
                      <Pressable
                        key={action.status}
                        disabled={statusLoadingId === booking.id}
                        onPress={() =>
                          void handleUpdateBookingStatus(booking.id, action.status)
                        }
                        style={[
                          secondaryButtonStyle,
                          { opacity: statusLoadingId === booking.id ? 0.6 : 1 },
                        ]}>
                        <Text style={secondaryButtonTextStyle}>{action.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <Text style={{ color: colors.textSecondary }}>
            Chưa có booking nào cho địa điểm này. Khi khách đặt chỗ, danh sách sẽ hiện tại đây.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const inputStyle = {
  minHeight: 52,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#d6e4ec',
  paddingHorizontal: 14,
  fontSize: 16,
} as const;

const primaryButtonStyle = {
  borderRadius: 14,
  backgroundColor: colors.primary,
  paddingHorizontal: 16,
  paddingVertical: 12,
  alignItems: 'center',
} as const;

const primaryButtonTextStyle = {
  color: '#fff',
  fontWeight: '800',
} as const;

const secondaryButtonStyle = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#d7e4eb',
  paddingHorizontal: 14,
  paddingVertical: 11,
  alignItems: 'center',
} as const;

const secondaryButtonTextStyle = {
  color: colors.textPrimary,
  fontWeight: '700',
} as const;

function toggleStyle(active: boolean) {
  return {
    alignSelf: 'flex-start' as const,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: active ? '#dcfce7' : '#fee2e2',
  };
}

function toggleTextStyle(active: boolean) {
  return {
    color: active ? '#166534' : '#b91c1c',
    fontWeight: '700' as const,
  };
}
