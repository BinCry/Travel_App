import { Ionicons } from '@expo/vector-icons';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createTrip,
  createTripStop,
  deleteTrip,
  deleteTripStop,
  fetchTrip,
  updateTrip,
  updateTripStop,
} from '../../../lib/api/trips';
import type {
  TripBudget,
  TripDetail,
  TripStop,
  TripStopCreateRequest,
  TripUpdateRequest,
} from '../../../lib/api/types';
import { colors } from '../common/colors';
import { TOP_SAFE_AREA_EDGES, withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';
import styles from './TripPlannerScreen.styles';

type TripFormState = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: TripBudget | null;
  notes: string;
};

type StopFormState = {
  dayNumber: string;
  title: string;
  location: string;
  note: string;
  startTime: string;
  endTime: string;
};

type TripFormPayload = TripUpdateRequest & {
  title: string;
  destination: string;
};

const defaultTripForm: TripFormState = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: 'balanced',
  notes: '',
};

const defaultStopForm: StopFormState = {
  dayNumber: '1',
  title: '',
  location: '',
  note: '',
  startTime: '',
  endTime: '',
};

const budgetOptions: { value: TripBudget; label: string }[] = [
  { value: 'budget', label: 'Tiết kiệm' },
  { value: 'balanced', label: 'Cân bằng' },
  { value: 'premium', label: 'Nâng cao' },
];

function toTripPayload(form: TripFormState): TripFormPayload {
  return {
    title: form.title.trim(),
    destination: form.destination.trim(),
    startDate: form.startDate.trim() ? form.startDate.trim() : null,
    endDate: form.endDate.trim() ? form.endDate.trim() : null,
    budget: form.budget,
    notes: form.notes.trim() ? form.notes.trim() : null,
  };
}

function toStopPayload(form: StopFormState): TripStopCreateRequest {
  return {
    dayNumber: Number(form.dayNumber) || 1,
    title: form.title.trim(),
    location: form.location.trim() ? form.location.trim() : null,
    note: form.note.trim() ? form.note.trim() : null,
    startTime: form.startTime.trim() ? form.startTime.trim() : null,
    endTime: form.endTime.trim() ? form.endTime.trim() : null,
  };
}

function mapTripToForm(trip: TripDetail): TripFormState {
  return {
    title: trip.title,
    destination: trip.destination,
    startDate: trip.startDate ?? '',
    endDate: trip.endDate ?? '',
    budget: trip.budget ?? 'balanced',
    notes: trip.notes ?? '',
  };
}

function mapStopToForm(stop: TripStop): StopFormState {
  return {
    dayNumber: String(stop.dayNumber),
    title: stop.title,
    location: stop.location ?? '',
    note: stop.note ?? '',
    startTime: stop.startTime ?? '',
    endTime: stop.endTime ?? '',
  };
}

function getStopBounds(stops: TripStop[], stop: TripStop) {
  const sameDayStops = stops.filter((item) => item.dayNumber === stop.dayNumber);
  const minOrderIndex = 1;
  const maxOrderIndex = sameDayStops.length;
  return { minOrderIndex, maxOrderIndex };
}

export default function TripPlannerScreen({
  navigation,
  route,
}: AppScreenProps<'Trip Planner'>) {
  const insets = useSafeAreaInsets();
  const routeTripId = route.params?.tripId;
  const [tripId, setTripId] = useState(routeTripId);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [tripForm, setTripForm] = useState<TripFormState>(defaultTripForm);
  const [stopForm, setStopForm] = useState<StopFormState>(defaultStopForm);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(routeTripId));
  const [savingTrip, setSavingTrip] = useState(false);
  const [savingStop, setSavingStop] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTrip = useCallback(async (currentTripId: string) => {
    setLoading(true);
    try {
      const data = await fetchTrip(currentTripId);
      setTrip(data);
      setTripForm(mapTripToForm(data));
      setLoadError(null);
    } catch (error) {
      setTrip(null);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTripId(routeTripId);
  }, [routeTripId]);

  useEffect(() => {
    if (tripId) {
      void loadTrip(tripId);
      return;
    }

    setTrip(null);
    setTripForm(defaultTripForm);
    setStopForm(defaultStopForm);
    setEditingStopId(null);
    setLoading(false);
    setLoadError(null);
  }, [loadTrip, tripId]);

  const stopCountText = useMemo(() => {
    if (!trip) return 'Lưu hành trình trước để thêm điểm dừng.';
    return `${trip.stopCount} điểm dừng trên ${trip.dayCount} ngày.`;
  }, [trip]);

  const handleTripFieldChange = <Key extends keyof TripFormState>(
    key: Key,
    value: TripFormState[Key]
  ) => {
    setTripForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStopFieldChange = <Key extends keyof StopFormState>(
    key: Key,
    value: StopFormState[Key]
  ) => {
    setStopForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetStopEditor = () => {
    setEditingStopId(null);
    setStopForm(defaultStopForm);
  };

  const handleSaveTrip = async () => {
    if (!tripForm.title.trim() || !tripForm.destination.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên hành trình và điểm đến.');
      return;
    }

    setSavingTrip(true);
    try {
      const payload = toTripPayload(tripForm);
      const saved = tripId ? await updateTrip(tripId, payload) : await createTrip(payload);

      setTrip(saved);
      setTripForm(mapTripToForm(saved));
      setTripId(saved.id);
      setLoadError(null);

      if (!tripId) {
        navigation.navigate('Trip Planner', { tripId: saved.id });
      }
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setSavingTrip(false);
    }
  };

  const handleDeleteTrip = () => {
    if (!tripId || !trip) return;

    Alert.alert('Xóa hành trình', `Bạn muốn xóa "${trip.title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteTrip(tripId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', toUserMessage(error));
            }
          })();
        },
      },
    ]);
  };

  const handleSaveStop = async () => {
    if (!tripId) {
      Alert.alert('Lưu hành trình trước', 'Bạn cần lưu hành trình trước khi thêm điểm dừng.');
      return;
    }
    if (!stopForm.title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên điểm dừng.');
      return;
    }

    setSavingStop(true);
    try {
      const payload = toStopPayload(stopForm);
      const updatedTrip = editingStopId
        ? await updateTripStop(tripId, editingStopId, payload)
        : await createTripStop(tripId, payload);
      setTrip(updatedTrip);
      resetStopEditor();
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setSavingStop(false);
    }
  };

  const handleEditStop = (stop: TripStop) => {
    setEditingStopId(stop.id);
    setStopForm(mapStopToForm(stop));
  };

  const handleDeleteStop = (stop: TripStop) => {
    if (!tripId) return;
    Alert.alert('Xóa điểm dừng', `Bạn muốn xóa "${stop.title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const updatedTrip = await deleteTripStop(tripId, stop.id);
              setTrip(updatedTrip);
              if (editingStopId === stop.id) {
                resetStopEditor();
              }
            } catch (error) {
              Alert.alert('Lỗi', toUserMessage(error));
            }
          })();
        },
      },
    ]);
  };

  const handleMoveStop = async (stop: TripStop, direction: -1 | 1) => {
    if (!tripId || !trip) return;
    const bounds = getStopBounds(trip.stops, stop);
    const nextOrder = stop.orderIndex + direction;
    if (nextOrder < bounds.minOrderIndex || nextOrder > bounds.maxOrderIndex) {
      return;
    }

    try {
      const updatedTrip = await updateTripStop(tripId, stop.id, {
        dayNumber: stop.dayNumber,
        orderIndex: nextOrder,
      });
      setTrip(updatedTrip);
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError && tripId && !trip) {
    return (
      <SafeAreaView style={styles.safeArea} edges={TOP_SAFE_AREA_EDGES}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Không thể tải hành trình</Text>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  if (tripId) {
                    void loadTrip(tripId);
                  }
                }}>
                <Text style={styles.primaryButtonText}>Thử lại</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={TOP_SAFE_AREA_EDGES}>
      <View style={styles.container}>
        <ScrollView
          testID="trip-planner-scroll"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: withBottomInset(insets.bottom, 32) },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>
              {tripId ? 'Chỉnh sửa hành trình' : 'Tạo hành trình mới'}
            </Text>
            <Text style={styles.heroText}>
              Thiết lập khung chuyến đi trước, sau đó thêm từng điểm dừng để bạn dễ nối
              tiếp với AI suggestion và booking trong các phase tiếp theo.
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thông tin chính</Text>

            <View style={styles.column}>
              <Text style={styles.label}>Tên hành trình</Text>
              <TextInput
                testID="trip-title-input"
                value={tripForm.title}
                onChangeText={(value) => handleTripFieldChange('title', value)}
                placeholder="Ví dụ: Kyoto thư giãn cuối tuần"
                style={styles.input}
              />
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Điểm đến</Text>
              <TextInput
                value={tripForm.destination}
                onChangeText={(value) => handleTripFieldChange('destination', value)}
                placeholder="Ví dụ: Kyoto, Nhật Bản"
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Ngày bắt đầu</Text>
                <TextInput
                  value={tripForm.startDate}
                  onChangeText={(value) => handleTripFieldChange('startDate', value)}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>Ngày kết thúc</Text>
                <TextInput
                  value={tripForm.endDate}
                  onChangeText={(value) => handleTripFieldChange('endDate', value)}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Ngân sách</Text>
              <View style={styles.budgetRow}>
                {budgetOptions.map((option) => {
                  const isActive = tripForm.budget === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.budgetButton,
                        isActive ? styles.budgetButtonActive : undefined,
                      ]}
                      onPress={() => handleTripFieldChange('budget', option.value)}>
                      <Text
                        style={[
                          styles.budgetText,
                          isActive ? styles.budgetTextActive : undefined,
                        ]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                value={tripForm.notes}
                onChangeText={(value) => handleTripFieldChange('notes', value)}
                placeholder="Ví dụ: ưu tiên địa điểm yên tĩnh, dễ đi bộ"
                multiline
                style={[styles.input, styles.textArea]}
              />
            </View>

            <Pressable
              testID="save-trip-button"
              style={styles.primaryButton}
              onPress={() => void handleSaveTrip()}
              disabled={savingTrip}>
              <Text style={styles.primaryButtonText}>
                {savingTrip ? 'Đang lưu...' : tripId ? 'Lưu cập nhật' : 'Lưu hành trình'}
              </Text>
            </Pressable>

            {tripId ? (
              <Pressable style={styles.secondaryButton} onPress={handleDeleteTrip}>
                <Text style={styles.secondaryButtonText}>Xóa hành trình này</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Điểm dừng</Text>
            <Text style={styles.helperText}>{stopCountText}</Text>

            {!tripId ? (
              <View style={styles.emptyState}>
                <Ionicons name="save-outline" size={32} color={colors.primary} />
                <Text style={styles.emptyTitle}>Lưu hành trình trước</Text>
                <Text style={styles.emptyText}>
                  Sau khi lưu, bạn có thể thêm từng điểm dừng, chỉnh ngày và sắp thứ tự.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.label}>
                    {editingStopId ? 'Chỉnh sửa điểm dừng' : 'Thêm điểm dừng mới'}
                  </Text>

                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.label}>Ngày</Text>
                      <TextInput
                        value={stopForm.dayNumber}
                        onChangeText={(value) => handleStopFieldChange('dayNumber', value)}
                        placeholder="1"
                        keyboardType="number-pad"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.column}>
                      <Text style={styles.label}>Tên điểm dừng</Text>
                      <TextInput
                        value={stopForm.title}
                        onChangeText={(value) => handleStopFieldChange('title', value)}
                        placeholder="Ví dụ: Dạo Gion District"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>Địa điểm / khu vực</Text>
                    <TextInput
                      value={stopForm.location}
                      onChangeText={(value) => handleStopFieldChange('location', value)}
                      placeholder="Ví dụ: Kyoto, Nhật Bản"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.label}>Bắt đầu</Text>
                      <TextInput
                        value={stopForm.startTime}
                        onChangeText={(value) => handleStopFieldChange('startTime', value)}
                        placeholder="14:00"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.column}>
                      <Text style={styles.label}>Kết thúc</Text>
                      <TextInput
                        value={stopForm.endTime}
                        onChangeText={(value) => handleStopFieldChange('endTime', value)}
                        placeholder="15:30"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>Ghi chú nhỏ</Text>
                    <TextInput
                      value={stopForm.note}
                      onChangeText={(value) => handleStopFieldChange('note', value)}
                      placeholder="Ví dụ: đến sớm để chụp ảnh"
                      multiline
                      style={[styles.input, styles.textArea]}
                    />
                  </View>

                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => void handleSaveStop()}
                    disabled={savingStop}>
                    <Text style={styles.primaryButtonText}>
                      {savingStop
                        ? 'Đang lưu điểm dừng...'
                        : editingStopId
                          ? 'Cập nhật điểm dừng'
                          : 'Thêm điểm dừng'}
                    </Text>
                  </Pressable>

                  {editingStopId ? (
                    <Pressable style={styles.secondaryButton} onPress={resetStopEditor}>
                      <Text style={styles.secondaryButtonText}>Hủy chỉnh sửa</Text>
                    </Pressable>
                  ) : null}
                </View>

                {trip?.stops.length ? (
                  trip.stops.map((stop) => {
                    const bounds = getStopBounds(trip.stops, stop);
                    return (
                      <View key={stop.id} style={styles.stopCard}>
                        <View style={styles.stopRow}>
                          <View style={styles.dayBadge}>
                            <Text style={styles.dayBadgeText}>Ngày {stop.dayNumber}</Text>
                          </View>
                          <Text style={styles.stopTitle}>{stop.title}</Text>
                        </View>

                        {stop.location ? (
                          <Text style={styles.stopMeta}>{stop.location}</Text>
                        ) : null}

                        {stop.startTime || stop.endTime ? (
                          <Text style={styles.stopMeta}>
                            {stop.startTime ?? '--:--'} - {stop.endTime ?? '--:--'}
                          </Text>
                        ) : null}

                        {stop.note ? <Text style={styles.stopMeta}>{stop.note}</Text> : null}

                        <View style={styles.stopActions}>
                          <Pressable
                            style={styles.stopActionButton}
                            onPress={() => void handleMoveStop(stop, -1)}
                            disabled={stop.orderIndex <= bounds.minOrderIndex}>
                            <Text style={styles.stopActionText}>Lên</Text>
                          </Pressable>
                          <Pressable
                            style={styles.stopActionButton}
                            onPress={() => void handleMoveStop(stop, 1)}
                            disabled={stop.orderIndex >= bounds.maxOrderIndex}>
                            <Text style={styles.stopActionText}>Xuống</Text>
                          </Pressable>
                          <Pressable
                            style={styles.stopActionButton}
                            onPress={() => handleEditStop(stop)}>
                            <Text style={styles.stopActionText}>Sửa</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.stopActionButton, styles.stopActionDanger]}
                            onPress={() => handleDeleteStop(stop)}>
                            <Text
                              style={[
                                styles.stopActionText,
                                styles.stopActionTextDanger,
                              ]}>
                              Xóa
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="trail-sign-outline" size={34} color={colors.primary} />
                    <Text style={styles.emptyTitle}>Chưa có điểm dừng</Text>
                    <Text style={styles.emptyText}>
                      Thêm các điểm dừng đầu tiên để hành trình của bạn có khung rõ ràng hơn.
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
