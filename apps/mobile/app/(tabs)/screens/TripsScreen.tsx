import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteTrip, duplicateTrip, fetchTrips } from '../../../lib/api/trips';
import type { TripBudget, TripListItem } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import type { AppNavigationOnlyProps } from '../types/navigation';
import styles from './TripsScreen.styles';

function formatDateRange(trip: TripListItem) {
  if (!trip.startDate && !trip.endDate) {
    return 'Chưa chốt ngày đi';
  }
  if (trip.startDate && trip.endDate) {
    return `${trip.startDate} - ${trip.endDate}`;
  }
  return trip.startDate ?? trip.endDate ?? 'Chưa chốt ngày đi';
}

function getBudgetLabel(value: TripBudget | null) {
  if (value === 'budget') return 'Tiết kiệm';
  if (value === 'premium') return 'Nâng cao';
  if (value === 'balanced') return 'Cân bằng';
  return 'Linh hoạt';
}

export default function TripsScreen({ navigation }: AppNavigationOnlyProps<'Trips'>) {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrips();
      setTrips(data);
      setLoadError(null);
    } catch (error) {
      setTrips([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips])
  );

  const handleDeleteTrip = (trip: TripListItem) => {
    Alert.alert('Xóa hành trình', `Bạn muốn xóa "${trip.title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteTrip(trip.id);
              setTrips((prev) => prev.filter((item) => item.id !== trip.id));
            } catch (error) {
              Alert.alert('Lỗi', toUserMessage(error));
            }
          })();
        },
      },
    ]);
  };

  const handleDuplicateTrip = async (tripId: string) => {
    try {
      const duplicated = await duplicateTrip(tripId);
      setTrips((prev) => [
        {
          id: duplicated.id,
          title: duplicated.title,
          destination: duplicated.destination,
          startDate: duplicated.startDate,
          endDate: duplicated.endDate,
          budget: duplicated.budget,
          notes: duplicated.notes,
          stopCount: duplicated.stopCount,
          dayCount: duplicated.dayCount,
          updatedAt: duplicated.updatedAt,
        },
        ...prev,
      ]);
      navigation.navigate('Trip Planner', { tripId: duplicated.id });
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  if (loading && trips.length === 0 && !loadError) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          testID="trips-list"
          data={trips}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadTrips}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIcon}>
                  <Ionicons name="airplane-outline" size={28} color={colors.primary} />
                </View>
                <Text style={styles.heroTitle}>Kế hoạch chuyến đi</Text>
              </View>
              <Text style={styles.heroBody}>
                Tạo hành trình, chia theo ngày và chuẩn bị trước các điểm dừng quan trọng để bạn
                dễ nối tiếp với AI và booking ở bước sau.
              </Text>
              <Pressable
                testID="create-trip-button"
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Trip Planner')}>
                <Text style={styles.primaryButtonText}>+ Tạo hành trình mới</Text>
              </Pressable>
              <Pressable
                testID="create-trip-with-ai-button"
                style={[styles.primaryButton, { marginTop: 10, backgroundColor: '#111827' }]}
                onPress={() => navigation.navigate('AI Trip Builder')}>
                <Text style={styles.primaryButtonText}>+ Tạo hành trình với AI</Text>
              </Pressable>

              {loadError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Không thể tải hành trình</Text>
                  <Text style={styles.errorText}>{loadError}</Text>
                  <Pressable style={styles.primaryButton} onPress={() => void loadTrips()}>
                    <Text style={styles.primaryButtonText}>Thử lại</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getBudgetLabel(item.budget)}</Text>
                </View>
              </View>

              <Text style={styles.destination}>{item.destination}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{formatDateRange(item)}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>
                    {item.dayCount} ngày • {item.stopCount} điểm dừng
                  </Text>
                </View>
              </View>

              {item.notes ? (
                <Text numberOfLines={2} style={styles.noteText}>
                  {item.notes}
                </Text>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => navigation.navigate('Trip Planner', { tripId: item.id })}>
                  <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                    Chi tiết
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => void handleDuplicateTrip(item.id)}>
                  <Text style={styles.actionButtonText}>Nhân bản</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.actionButtonDanger]}
                  onPress={() => handleDeleteTrip(item)}>
                  <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Xóa</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loadError ? (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={42} color={colors.primary} />
                <Text style={styles.emptyTitle}>Bạn chưa có hành trình nào</Text>
                <Text style={styles.emptyText}>
                  Tạo trước một kế hoạch cơ bản để sau đó thêm AI gợi ý, sắp xếp ngày đi và
                  chuẩn bị booking.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
