import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchFavorites, removeFavorite } from '../../../lib/api/favorites';
import type { PlaceListItem } from '../../../lib/api/types';
import { toUserMessage } from '../common/errorMessages';
import { colors } from '../common/colors';
import type { AppNavigationOnlyProps } from '../types/navigation';

export default function SavedPlacesScreen({
  navigation,
}: AppNavigationOnlyProps<'Saved Places'>) {
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setPlaces(data);
    } catch (error) {
      setPlaces([]);
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPlaces();
    }, [loadPlaces])
  );

  const handleRemove = async (placeId: string) => {
    try {
      await removeFavorite(placeId);
      setPlaces((prev) => prev.filter((item) => item.id !== placeId));
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  if (loading) {
    return (
      <View style={screenStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={screenStyles.backLink}>Quay lại</Text>
        </Pressable>
        <Text style={screenStyles.title}>Địa điểm đã lưu</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.listContent}
        refreshing={loading}
        onRefresh={loadPlaces}
        renderItem={({ item }) => (
          <View style={screenStyles.card}>
            <Image source={{ uri: item.imageUrl }} style={screenStyles.image} />
            <View style={screenStyles.cardBody}>
              <Text style={screenStyles.cardTitle}>{item.name}</Text>
              <Text style={screenStyles.cardMeta}>{item.location}</Text>
              <Text style={screenStyles.cardMeta}>
                Rating {item.rating} ({item.ratingCount})
              </Text>
              <View style={screenStyles.actions}>
                <TouchableOpacity
                  style={screenStyles.primaryButton}
                  onPress={() => navigation.navigate('Detail Location', { placeId: item.id })}
                >
                  <Text style={screenStyles.primaryButtonText}>Xem</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={screenStyles.secondaryButton}
                  onPress={() => void handleRemove(item.id)}
                >
                  <Text style={screenStyles.secondaryButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={screenStyles.emptyState}>
            <Text style={screenStyles.emptyTitle}>Chưa có địa điểm yêu thích</Text>
            <Text style={screenStyles.emptyText}>
              Thêm địa điểm vào danh sách yêu thích để quay lại nhanh hơn.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: 16,
    rowGap: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMeta: {
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    columnGap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.danger,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
