import React, { useEffect, useMemo, useState } from 'react';
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
import { planTrip } from '../../../lib/api/ai';
import { createTrip, createTripStop } from '../../../lib/api/trips';
import type { TripBudget, TripPlanResponse } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { TOP_SAFE_AREA_EDGES, withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

const BUDGET_OPTIONS: { value: TripBudget; label: string }[] = [
  { value: 'budget', label: 'Tiết kiệm' },
  { value: 'balanced', label: 'Cân bằng' },
  { value: 'premium', label: 'Nâng cao' },
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysString(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export default function AiTripBuilderScreen({
  navigation,
  route,
}: AppScreenProps<'AI Trip Builder'>) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(route.params?.initialQuery?.trim() || 'Chuyến đi cuối tuần thư giãn');
  const [location, setLocation] = useState(route.params?.initialLocation?.trim() || 'Gần bạn');
  const [tripTitle, setTripTitle] = useState('Hành trình gợi ý từ AI');
  const [budget, setBudget] = useState<TripBudget>('balanced');
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(plusDaysString(2));
  const [result, setResult] = useState<TripPlanResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [creatingTrip, setCreatingTrip] = useState(false);

  useEffect(() => {
    if (!route.params?.initialQuery) return;
    setTripTitle(`AI: ${route.params.initialQuery.trim().slice(0, 40)}`);
  }, [route.params?.initialQuery]);

  const canCreateTrip = useMemo(
    () => Boolean(result?.suggestions.length),
    [result]
  );

  const handleGenerate = async () => {
    if (!query.trim()) {
      Alert.alert('Thiếu yêu cầu', 'Hãy nhập mô tả chuyến đi bạn muốn AI gợi ý.');
      return;
    }

    setAiLoading(true);
    try {
      const response = await planTrip(query.trim(), location.trim() || undefined);
      setResult(response);
      if (!tripTitle.trim() || tripTitle === 'Hành trình gợi ý từ AI') {
        setTripTitle(`AI: ${response.query.slice(0, 40)}`);
      }
    } catch (error) {
      Alert.alert('Không thể tạo gợi ý AI', toUserMessage(error));
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    if (!result?.suggestions.length) {
      Alert.alert('Chưa có gợi ý', 'Hãy tạo gợi ý AI trước khi lưu thành hành trình.');
      return;
    }

    setCreatingTrip(true);
    try {
      const trip = await createTrip({
        title: tripTitle.trim() || 'Hành trình AI',
        destination: location.trim() || result.location,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        budget,
        notes: result.note,
      });

      for (const [index, suggestion] of result.suggestions.entries()) {
        await createTripStop(trip.id, {
          dayNumber: index + 1,
          orderIndex: 1,
          title: suggestion.title,
          location: location.trim() || result.location,
          note: `${suggestion.description}\nThời lượng gợi ý: ${suggestion.duration}`,
        });
      }

      Alert.alert('Đã tạo hành trình', 'Hành trình gợi ý từ AI đã được lưu vào tài khoản của bạn.', [
        {
          text: 'Xem chi tiết',
          onPress: () => navigation.navigate('Trip Planner', { tripId: trip.id }),
        },
      ]);
    } catch (error) {
      Alert.alert('Không thể lưu hành trình', toUserMessage(error));
    } finally {
      setCreatingTrip(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fbfd' }} edges={TOP_SAFE_AREA_EDGES}>
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: withBottomInset(insets.bottom, 28) }}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            borderRadius: 24,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e5edf4',
            padding: 20,
            rowGap: 12,
          }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
            AI Trip Builder
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
            Nhập nhu cầu chuyến đi, lấy gợi ý từ AI và lưu thẳng thành hành trình thực tế để nối tiếp với booking.
          </Text>

          <View>
            <Text style={labelStyle}>Bạn muốn chuyến đi như thế nào?</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ví dụ: 3 ngày thư giãn, nhiều cảnh đẹp và quán ăn địa phương"
              multiline
              textAlignVertical="top"
              style={[inputStyle, { minHeight: 110, paddingTop: 14 }]}
            />
          </View>

          <View>
            <Text style={labelStyle}>Địa điểm / khu vực</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Ví dụ: Đà Nẵng"
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={labelStyle}>Tên hành trình sẽ lưu</Text>
            <TextInput
              value={tripTitle}
              onChangeText={setTripTitle}
              placeholder="Ví dụ: Cuối tuần chill ở Đà Nẵng"
              style={inputStyle}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Ngày bắt đầu</Text>
              <TextInput value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" style={inputStyle} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Ngày kết thúc</Text>
              <TextInput value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" style={inputStyle} />
            </View>
          </View>

          <View>
            <Text style={labelStyle}>Ngân sách</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {BUDGET_OPTIONS.map((option) => {
                const active = option.value === budget;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setBudget(option.value)}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : '#d6e4ec',
                      backgroundColor: active ? '#eef8fb' : '#ffffff',
                    }}>
                    <Text style={{ color: active ? colors.primary : colors.textPrimary, fontWeight: '700' }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            testID="generate-ai-trip-button"
            onPress={() => void handleGenerate()}
            disabled={aiLoading}
            style={{
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: 'center',
              paddingVertical: 14,
              opacity: aiLoading ? 0.6 : 1,
            }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {aiLoading ? 'Đang tạo gợi ý...' : 'Tạo gợi ý với AI'}
            </Text>
          </Pressable>
        </View>

        {result ? (
          <View
            style={{
              marginTop: 18,
              borderRadius: 24,
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e5edf4',
              padding: 20,
              rowGap: 14,
            }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>
              Gợi ý cho {result.location}
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{result.note}</Text>

            {result.suggestions.map((suggestion, index) => (
              <View
                key={`${suggestion.title}-${index}`}
                style={{
                  borderRadius: 18,
                  backgroundColor: '#f8fbfd',
                  padding: 16,
                  gap: 6,
                }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                  Ngày {index + 1}: {suggestion.title}
                </Text>
                <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
                  {suggestion.description}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  Thời lượng gợi ý: {suggestion.duration}
                </Text>
              </View>
            ))}

            <Pressable
              testID="create-trip-from-ai-button"
              onPress={() => void handleCreateTrip()}
              disabled={!canCreateTrip || creatingTrip}
              style={{
                borderRadius: 16,
                backgroundColor: '#111827',
                alignItems: 'center',
                paddingVertical: 14,
                opacity: !canCreateTrip || creatingTrip ? 0.6 : 1,
              }}>
              {creatingTrip ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                  Lưu thành hành trình thật
                </Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const labelStyle = {
  marginBottom: 8,
  color: colors.textSecondary,
  fontWeight: '700' as const,
};

const inputStyle = {
  minHeight: 52,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#d6e4ec',
  backgroundColor: '#fff',
  paddingHorizontal: 14,
  fontSize: 16,
} as const;
