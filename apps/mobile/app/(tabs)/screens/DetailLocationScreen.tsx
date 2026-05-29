import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { addFavorite, removeFavorite } from '../../../lib/api/favorites';
import { fetchPlaceDetail } from '../../../lib/api/places';
import type { PlaceDetail } from '../../../lib/api/types';
import UserAvatar from '../components/UserAvatar';
import { RatingStartBar } from '../components/Rating';
import { PicturesContainer } from '../components/ReviewPicture';
import { colors } from '../common/colors';
import { useAuth } from '../context/AuthContext';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';
import styles from './DetailLocationScreen.styles';

export default function DetailLocationScreen({
  navigation,
  route,
}: AppScreenProps<'Detail Location'>) {
  const { user } = useAuth();
  const placeId = route.params?.placeId as string | undefined;
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPlace = useCallback(async () => {
    if (!placeId) {
      setPlace(null);
      setLoadError('Thiếu thông tin địa điểm cần xem.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchPlaceDetail(placeId);
      setPlace(data);
      setIsLiked(Boolean(data.isFavorite));
      setLoadError(null);
    } catch (error) {
      setPlace(null);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

  const toggleFavorite = async () => {
    if (!placeId) return;
    try {
      if (isLiked) {
        await removeFavorite(placeId);
        setIsLiked(false);
      } else {
        await addFavorite(placeId);
        setIsLiked(true);
      }
    } catch (error) {
      Alert.alert('Không thể cập nhật yêu thích', toUserMessage(error));
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>
          Không thể mở địa điểm này
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: colors.textSecondary,
            lineHeight: 22,
            textAlign: 'center',
          }}>
          {loadError ?? 'Dữ liệu địa điểm hiện không khả dụng.'}
        </Text>
        <Pressable
          onPress={() => void loadPlace()}
          style={{
            marginTop: 14,
            borderRadius: 12,
            backgroundColor: colors.primary,
            paddingHorizontal: 18,
            paddingVertical: 10,
          }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tải lại</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, marginTop: 14, fontWeight: '600' }}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const firstReview = place.reviews[0];

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF', marginVertical: 40 }}>
      <ScrollView style={[styles.container, { margin: 0 }]}>
        <View style={{ margin: 0, position: 'relative' }}>
          <View style={[styles.imageFrame, { height: 350, borderRadius: 0, borderWidth: 0 }]}>
            <Image source={{ uri: place.imageUrl }} style={{ width: '100%', height: '100%' }} />
          </View>
          <Pressable style={styles.roundButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={25} color="white" />
          </Pressable>
          <Pressable
            style={[
              styles.roundButton,
              {
                position: 'absolute',
                right: 15,
                top: 15,
                zIndex: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 20,
                padding: 5,
              },
            ]}
            onPress={toggleFavorite}>
            <Ionicons name="heart" size={24} color={isLiked ? 'red' : 'white'} />
          </Pressable>
        </View>

        <View style={{ borderRadius: 20, backgroundColor: '#FFFFFF', marginTop: -20 }}>
          <View style={{ flexDirection: 'column', margin: 15 }}>
            <Text style={{ fontSize: 25, fontWeight: '700', marginTop: 10 }}>{place.name}</Text>
            <View style={{ flexDirection: 'row', columnGap: 7 }}>
              <Ionicons name="location-sharp" size={18} color="#00B4D8" />
              <Text style={{ color: '#353232da', fontWeight: '600' }}>{place.location}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderRadius: 15 }}>
              <View style={[styles.detailCard, { marginLeft: 3 }]}>
                <View style={{ borderRadius: 20, backgroundColor: '#FEF9C3', margin: 15, padding: 10 }}>
                  <Ionicons name="star" size={18} color="#EAB308" />
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 15 }}>
                  <View style={{ flexDirection: 'row', columnGap: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 18 }}>{place.rating}</Text>
                    <Text style={{ fontWeight: '400', color: '#6B7280' }}>({place.ratingCount})</Text>
                  </View>
                  <Text style={{ fontWeight: '600', color: '#6B7280' }}>ĐÁNH GIÁ</Text>
                </View>
              </View>

              {place.priceLevel != null && (
                <View style={styles.detailCard}>
                  <View style={{ borderRadius: 20, backgroundColor: '#DCFCE7', margin: 15, padding: 10 }}>
                    <Ionicons name="logo-usd" size={18} color="#22C55E" />
                  </View>
                  <View style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 15 }}>
                    <Text style={{ fontWeight: '700', fontSize: 18 }}>{place.priceLevel}</Text>
                    <Text style={{ fontWeight: '600', color: '#6B7280' }}>MỨC GIÁ</Text>
                  </View>
                </View>
              )}

              <View style={styles.detailCard}>
                <View style={{ borderRadius: 20, backgroundColor: '#E0F2FE', margin: 15, padding: 10 }}>
                  <Ionicons name="people" size={18} color="#0EA5E9" />
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 15 }}>
                  <Text style={{ fontWeight: '700', fontSize: 18 }}>{place.featureLabel}</Text>
                  <Text style={{ fontWeight: '600', color: '#6B7280' }}>NỔI BẬT</Text>
                </View>
              </View>
            </ScrollView>

            <Text style={{ fontSize: 25, fontWeight: '700', marginTop: 10 }}>Giới thiệu</Text>
            <Text style={{ marginTop: 10, color: '#353232da', fontWeight: '600', textAlign: 'justify' }}>
              {place.about || 'Chưa có mô tả.'}
            </Text>
          </View>

          {user?.role !== 'owner' ? (
            <View style={{ marginHorizontal: 15, marginBottom: 10 }}>
              <Pressable
                onPress={() =>
                  navigation.navigate('Booking Checkout', {
                    placeId: place.id,
                    placeName: place.name,
                  })
                }
                style={{
                  marginTop: 4,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#b7e7f3',
                  backgroundColor: '#f3fbfe',
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 21, fontWeight: '700', color: colors.textPrimary }}>
                    Đặt chỗ ngay trên app
                  </Text>
                  <Text style={{ marginTop: 6, color: colors.textSecondary, lineHeight: 21 }}>
                    Chọn slot còn chỗ, gửi booking và theo dõi trạng thái xác nhận từ owner.
                  </Text>
                </View>
                <Ionicons name="calendar-outline" size={28} color={colors.primary} />
              </Pressable>
            </View>
          ) : null}

          {firstReview ? (
            <View style={{ flexDirection: 'column', margin: 15 }}>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Text style={{ fontSize: 25, fontWeight: '700', flex: 1 }}>Đánh giá</Text>

                <Text
                  style={{ color: '#00B4D8', fontWeight: '600' }}
                  onPress={() =>
                    navigation.navigate('All Reviews', {
                      placeId: place.id,
                      placeName: place.name,
                    })
                  }>
                  Xem tất cả
                </Text>
              </View>

              <PicturesContainer pictures={firstReview.imageUrls} />

              <View
                style={[
                  styles.detailCard,
                  { flexDirection: 'column', margin: 0, marginTop: 30, padding: 10, rowGap: 10 },
                ]}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.imageFrame, { width: 60, height: 60, borderRadius: 30, borderWidth: 0 }]}>
                    <UserAvatar uri={firstReview.avatarUrl} size={60} borderWidth={0} />
                  </View>
                  <View style={{ flexDirection: 'column', marginHorizontal: 10, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700' }}>{firstReview.name}</Text>
                    <Text style={{ color: '#353232da', fontWeight: '600' }}>{firstReview.date}</Text>
                  </View>
                </View>
                <RatingStartBar ratingValue={firstReview.rating} size={20} />
                <Text style={{ marginLeft: 5 }}>{firstReview.content}</Text>
                {firstReview.ownerReply ? (
                  <View
                    style={{
                      borderRadius: 14,
                      backgroundColor: '#eef8fb',
                      borderWidth: 1,
                      borderColor: '#d6edf5',
                      padding: 12,
                      rowGap: 4,
                    }}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>
                      Phản hồi từ {firstReview.ownerReply.ownerName}
                    </Text>
                    <Text style={{ color: colors.textPrimary, lineHeight: 20 }}>
                      {firstReview.ownerReply.content}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {firstReview.ownerReply.date}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={{ marginHorizontal: 15, marginBottom: 24 }}>
              <Text style={{ fontSize: 25, fontWeight: '700', marginBottom: 8 }}>Đánh giá</Text>
              <Text style={{ color: colors.textSecondary }}>Chưa có đánh giá nào cho địa điểm này.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
