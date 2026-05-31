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
import { deleteReview, fetchMyReviews } from '../../../lib/api/reviews';
import type { UserReviewListItem } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import type { AppNavigationOnlyProps } from '../types/navigation';

export default function UserReviewsScreen({
  navigation,
}: AppNavigationOnlyProps<'Your Reviews'>) {
  const [reviews, setReviews] = useState<UserReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyReviews();
      setReviews(data);
    } catch (error) {
      setReviews([]);
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReviews();
    }, [loadReviews])
  );

  const handleDelete = (reviewId: string) => {
    Alert.alert('Xóa đánh giá', 'Bạn có chắc muốn xóa đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReview(reviewId);
            setReviews((prev) => prev.filter((item) => item.id !== reviewId));
          } catch (error) {
            Alert.alert('Lỗi', toUserMessage(error));
          }
        },
      },
    ]);
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
        <Text style={screenStyles.title}>Đánh giá của bạn</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.listContent}
        refreshing={loading}
        onRefresh={loadReviews}
        renderItem={({ item }) => (
          <View style={screenStyles.card}>
            <View style={screenStyles.row}>
              <Image source={{ uri: item.placeImageUrl }} style={screenStyles.image} />
              <View style={screenStyles.cardBody}>
                <Text style={screenStyles.cardTitle}>{item.placeName}</Text>
                <Text style={screenStyles.cardMeta}>{item.placeRegion}</Text>
                <Text style={screenStyles.cardMeta}>
                  Rating {item.rating} · {item.likes} likes
                </Text>
                <Text style={screenStyles.cardContent}>{item.content}</Text>
                {item.ownerReply ? (
                  <View style={screenStyles.replyBox}>
                    <Text style={screenStyles.replyLabel}>
                      Phản hồi từ {item.ownerReply.ownerName}
                    </Text>
                    <Text style={screenStyles.replyContent}>{item.ownerReply.content}</Text>
                    <Text style={screenStyles.replyMeta}>{item.ownerReply.date}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={screenStyles.actions}>
              <TouchableOpacity
                style={screenStyles.primaryButton}
                onPress={() =>
                  navigation.navigate('All Reviews', {
                    placeId: item.placeId,
                    placeName: item.placeName,
                  })
                }
              >
                <Text style={screenStyles.primaryButtonText}>Sửa đánh giá</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={screenStyles.neutralButton}
                onPress={() => navigation.navigate('Detail Location', { placeId: item.placeId })}
              >
                <Text style={screenStyles.neutralButtonText}>Xem địa điểm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={screenStyles.secondaryButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={screenStyles.secondaryButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={screenStyles.emptyState}>
            <Text style={screenStyles.emptyTitle}>Bạn chưa có đánh giá nào</Text>
            <Text style={screenStyles.emptyText}>
              Hãy ghé thăm một địa điểm và để lại cảm nhận của bạn.
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    rowGap: 12,
  },
  row: {
    flexDirection: 'row',
    columnGap: 12,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 14,
  },
  cardBody: {
    flex: 1,
    rowGap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.textSecondary,
  },
  cardContent: {
    color: colors.textPrimary,
  },
  replyBox: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#eef8fb',
    borderWidth: 1,
    borderColor: '#d6edf5',
    padding: 10,
    rowGap: 4,
  },
  replyLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  replyContent: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  replyMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    columnGap: 12,
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
  neutralButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d7e4eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  neutralButtonText: {
    color: colors.textPrimary,
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
