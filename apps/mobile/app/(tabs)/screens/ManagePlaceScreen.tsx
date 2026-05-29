import { formatDate } from '@/app/service/PromotionShedule';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { placeCategories } from '../common/placeCategories';
import PromotionCard from '../components/PromotionCard';
import PromotionEditor from '../components/PromotionEditor';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import { styles as formStyles } from './AddLocationScreen.style';
import {
  createPromotion,
  deleteOwnerReviewReply,
  deleteOwnerPlace,
  deletePromotion,
  fetchOwnerPlace,
  fetchOwnerPlaceReviews,
  updateOwnerPlace,
  updatePromotion,
  upsertOwnerReviewReply,
  togglePromotion,
} from '../../../lib/api/owner';
import { uploadPlaceCover } from '../../../lib/api/uploads';
import type {
  OwnerPlaceDetail,
  OwnerPlaceReview,
  PlaceCategory,
  PromotionItem,
} from '../../../lib/api/types';
import type { AppScreenProps } from '../types/navigation';

const DEFAULT_SCHEDULE = {
  startDate: formatDate(new Date()),
  endDate: formatDate(new Date()),
  days: ['M'],
  startTime: '8:00 AM',
  endTime: '5:00 PM',
  specificTime: false,
};

export default function ManagePlaceScreen({
  navigation,
  route,
}: AppScreenProps<'Manage Place'>) {
  const placeId = route.params.placeId;
  const [place, setPlace] = useState<OwnerPlaceDetail | null>(null);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('attractions');
  const [about, setAbout] = useState('');
  const [featureLabel, setFeatureLabel] = useState('');
  const [priceLevel, setPriceLevel] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [addingPromotion, setAddingPromotion] = useState(false);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<OwnerPlaceReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [editingReplyReviewId, setEditingReplyReviewId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [savingReplyReviewId, setSavingReplyReviewId] = useState<string | null>(null);
  const [deletingReplyReviewId, setDeletingReplyReviewId] = useState<string | null>(null);

  const hydratePlace = useCallback((data: OwnerPlaceDetail) => {
    setPlace(data);
    setName(data.name);
    setRegion(data.location);
    setCategory(data.category);
    setAbout(data.about);
    setFeatureLabel(data.featureLabel);
    setPriceLevel(data.priceLevel == null ? '' : String(data.priceLevel));
    setCoverPreview(data.imageUrl);
    setPromotions(data.promotions);
  }, []);

  const loadPlace = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOwnerPlace(placeId);
      hydratePlace(data);
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [hydratePlace, navigation, placeId]);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await fetchOwnerPlaceReviews(placeId);
      setReviews(data);
      setReviewsError(null);
    } catch (error) {
      setReviews([]);
      setReviewsError(toUserMessage(error));
    } finally {
      setReviewsLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    void loadPlace();
    void loadReviews();
  }, [loadPlace, loadReviews]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverPreview(result.assets[0].uri);
    }
  };

  const handleSavePlace = async () => {
    if (!name.trim() || !region.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên địa điểm và khu vực.');
      return;
    }

    setSaving(true);
    try {
      let coverImageUrl = place?.imageUrl || coverPreview;
      if (/^(file|content):/i.test(coverPreview)) {
        coverImageUrl = await uploadPlaceCover(coverPreview);
      }

      await updateOwnerPlace(placeId, {
        name: name.trim(),
        region: region.trim(),
        category,
        about: about.trim(),
        featureLabel: featureLabel.trim() || undefined,
        coverImageUrl,
        priceLevel: priceLevel.trim() ? Number(priceLevel) : undefined,
      });
      await loadPlace();
      Alert.alert('Thành công', 'Đã cập nhật địa điểm.');
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlace = () => {
    Alert.alert('Xóa địa điểm', 'Bạn có chắc muốn xóa địa điểm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteOwnerPlace(placeId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Lỗi', toUserMessage(error));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleCreatePromotion = async (data: { title: string; schedule: PromotionItem['schedule'] }) => {
    try {
      await createPromotion(placeId, {
        title: data.title,
        isActive: true,
        schedule: data.schedule,
      });
      setAddingPromotion(false);
      await loadPlace();
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  const handleUpdatePromotion = async (
    promotionId: string,
    data: { title: string; schedule: PromotionItem['schedule'] }
  ) => {
    try {
      await updatePromotion(promotionId, {
        title: data.title,
        schedule: data.schedule,
      });
      setEditingPromotionId(null);
      await loadPlace();
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  const handleTogglePromotion = async (promotionId: string) => {
    try {
      await togglePromotion(promotionId);
      await loadPlace();
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      await deletePromotion(promotionId);
      await loadPlace();
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    }
  };

  const handleStartReply = (review: OwnerPlaceReview) => {
    setEditingReplyReviewId(review.id);
    setReplyDraft(review.ownerReply?.content ?? '');
  };

  const handleCancelReply = () => {
    setEditingReplyReviewId(null);
    setReplyDraft('');
  };

  const handleSaveReply = async (reviewId: string) => {
    if (!replyDraft.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setSavingReplyReviewId(reviewId);
    try {
      await upsertOwnerReviewReply(reviewId, { content: replyDraft.trim() });
      handleCancelReply();
      await loadReviews();
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setSavingReplyReviewId(null);
    }
  };

  const handleDeleteReply = (review: OwnerPlaceReview) => {
    Alert.alert('Xóa phản hồi', `Bạn muốn xóa phản hồi cho review của ${review.username}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeletingReplyReviewId(review.id);
          try {
            await deleteOwnerReviewReply(review.id);
            if (editingReplyReviewId === review.id) {
              handleCancelReply();
            }
            await loadReviews();
          } catch (error) {
            Alert.alert('Lỗi', toUserMessage(error));
          } finally {
            setDeletingReplyReviewId(null);
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

  if (!place) {
    return (
      <View style={screenStyles.center}>
        <Text style={{ marginBottom: 12, color: colors.textPrimary }}>Không tìm thấy địa điểm</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={screenStyles.background}>
      <ScrollView contentContainerStyle={screenStyles.content}>
        <View style={screenStyles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={screenStyles.headerTitle}>Quản lý địa điểm</Text>
          <TouchableOpacity onPress={handleDeletePlace} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <Text style={screenStyles.deleteLink}>Xóa</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[formStyles.button, { marginTop: 12, backgroundColor: '#111827' }]}
            onPress={() =>
              navigation.navigate('Manage Bookings', {
                placeId: place.id,
                placeName: place.name,
              })
            }>
            <Text style={formStyles.buttonText}>Quản lý booking & slot</Text>
          </TouchableOpacity>
        </View>

        <View style={formStyles.card}>
          <TouchableOpacity style={screenStyles.coverBox} onPress={handlePickImage}>
            {coverPreview ? (
              <Image source={{ uri: coverPreview }} style={screenStyles.coverImage} />
            ) : (
              <Text style={screenStyles.coverPlaceholder}>Nhấn để tải ảnh bìa</Text>
            )}
          </TouchableOpacity>

          <Text style={formStyles.label}>Tên địa điểm</Text>
          <TextInput style={formStyles.input} value={name} onChangeText={setName} />

          <Text style={formStyles.label}>Khu vực / Thành phố</Text>
          <TextInput style={formStyles.input} value={region} onChangeText={setRegion} />

          <Text style={formStyles.label}>Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.chipScroll}>
            {placeCategories.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setCategory(item.value)}
                style={[formStyles.chip, category === item.value && formStyles.chipActive]}
              >
                <Text
                  style={[
                    formStyles.chipText,
                    category === item.value && formStyles.chipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={formStyles.label}>Nhãn nổi bật</Text>
          <TextInput style={formStyles.input} value={featureLabel} onChangeText={setFeatureLabel} />

          <Text style={formStyles.label}>Mức giá</Text>
          <TextInput
            style={formStyles.input}
            value={priceLevel}
            onChangeText={setPriceLevel}
            keyboardType="numeric"
          />

          <Text style={formStyles.label}>Mô tả</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea]}
            value={about}
            onChangeText={setAbout}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={formStyles.button} onPress={handleSavePlace} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={formStyles.buttonText}>Lưu địa điểm</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>Ưu đãi</Text>
          {!addingPromotion && !editingPromotionId ? (
            <TouchableOpacity onPress={() => setAddingPromotion(true)}>
              <Text style={screenStyles.addLink}>+ Thêm ưu đãi</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {addingPromotion ? (
          <PromotionEditor
            initialData={{ title: '', schedule: DEFAULT_SCHEDULE }}
            onSave={handleCreatePromotion}
            onCancel={() => setAddingPromotion(false)}
          />
        ) : null}

        {promotions.map((item) =>
          editingPromotionId === item.id ? (
            <PromotionEditor
              key={item.id}
              initialData={item}
              onSave={(data) => void handleUpdatePromotion(item.id, data)}
              onCancel={() => setEditingPromotionId(null)}
            />
          ) : (
            <PromotionCard
              key={item.id}
              item={item}
              onToggle={() => void handleTogglePromotion(item.id)}
              onEdit={() => setEditingPromotionId(item.id)}
              onDelete={() => void handleDeletePromotion(item.id)}
            />
          )
        )}

        {promotions.length === 0 && !addingPromotion ? (
          <View style={screenStyles.emptyPromo}>
            <Text style={screenStyles.emptyPromoTitle}>Chưa có ưu đãi nào</Text>
            <Text style={screenStyles.emptyPromoText}>
              Tạo ưu đãi đầu tiên để thu hút thêm khách ghé thăm.
            </Text>
          </View>
        ) : null}
        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>Đánh giá & phản hồi</Text>
        </View>

        {reviewsLoading ? (
          <View style={screenStyles.emptyPromo}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[screenStyles.emptyPromoText, { marginTop: 10 }]}>
              Đang tải đánh giá của khách...
            </Text>
          </View>
        ) : reviewsError ? (
          <View style={screenStyles.reviewErrorCard}>
            <Text style={screenStyles.reviewErrorTitle}>Không thể tải đánh giá</Text>
            <Text style={screenStyles.reviewErrorText}>{reviewsError}</Text>
            <TouchableOpacity onPress={() => void loadReviews()}>
              <Text style={screenStyles.addLink}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : reviews.length === 0 ? (
          <View style={screenStyles.emptyPromo}>
            <Text style={screenStyles.emptyPromoTitle}>Chưa có đánh giá nào</Text>
            <Text style={screenStyles.emptyPromoText}>
              Khi khách để lại review, bạn có thể phản hồi trực tiếp ngay tại đây.
            </Text>
          </View>
        ) : (
          reviews.map((review) => {
            const isEditingReply = editingReplyReviewId === review.id;
            const isSavingReply = savingReplyReviewId === review.id;
            const isDeletingReply = deletingReplyReviewId === review.id;

            return (
              <View key={review.id} style={screenStyles.reviewCard}>
                <View style={screenStyles.reviewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={screenStyles.reviewAuthor}>{review.username}</Text>
                    <Text style={screenStyles.reviewMeta}>
                      {review.date} • {review.rating}/5 • {review.likes} lượt thích
                    </Text>
                  </View>
                </View>

                <Text style={screenStyles.reviewBody}>{review.content}</Text>

                {review.imageUrls.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={screenStyles.reviewImagesRow}>
                    {review.imageUrls.map((imageUrl, index) => (
                      <Image
                        key={`${review.id}-${index}`}
                        source={{ uri: imageUrl }}
                        style={screenStyles.reviewImage}
                      />
                    ))}
                  </ScrollView>
                ) : null}

                {review.ownerReply && !isEditingReply ? (
                  <View style={screenStyles.ownerReplyBox}>
                    <Text style={screenStyles.ownerReplyLabel}>
                      Phản hồi từ {review.ownerReply.ownerName}
                    </Text>
                    <Text style={screenStyles.ownerReplyContent}>{review.ownerReply.content}</Text>
                    <Text style={screenStyles.ownerReplyMeta}>{review.ownerReply.date}</Text>
                  </View>
                ) : null}

                {isEditingReply ? (
                  <View style={screenStyles.replyEditorCard}>
                    <Text style={screenStyles.replyEditorTitle}>
                      {review.ownerReply ? 'Chỉnh sửa phản hồi' : 'Phản hồi cho khách'}
                    </Text>
                    <TextInput
                      value={replyDraft}
                      onChangeText={setReplyDraft}
                      placeholder="Viết phản hồi ngắn gọn, lịch sự và hữu ích..."
                      multiline
                      style={screenStyles.replyEditorInput}
                    />
                    <View style={screenStyles.replyActionsRow}>
                      <TouchableOpacity
                        style={screenStyles.replyPrimaryButton}
                        onPress={() => void handleSaveReply(review.id)}
                        disabled={isSavingReply}>
                        {isSavingReply ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={screenStyles.replyPrimaryButtonText}>Lưu phản hồi</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={screenStyles.replySecondaryButton}
                        onPress={handleCancelReply}>
                        <Text style={screenStyles.replySecondaryButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={screenStyles.replyActionsRow}>
                    <TouchableOpacity onPress={() => handleStartReply(review)}>
                      <Text style={screenStyles.replyLinkText}>
                        {review.ownerReply ? 'Sửa phản hồi' : 'Phản hồi ngay'}
                      </Text>
                    </TouchableOpacity>
                    {review.ownerReply ? (
                      <TouchableOpacity
                        onPress={() => handleDeleteReply(review)}
                        disabled={isDeletingReply}>
                        {isDeletingReply ? (
                          <ActivityIndicator color={colors.danger} size="small" />
                        ) : (
                          <Text style={screenStyles.replyDeleteText}>Xóa phản hồi</Text>
                        )}
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deleteLink: {
    color: colors.danger,
    fontWeight: '700',
  },
  coverBox: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.primaryLight,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  coverPlaceholder: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyPromo: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyPromoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyPromoText: {
    color: colors.textSecondary,
  },
  reviewCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    rowGap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  reviewBody: {
    color: colors.textPrimary,
    lineHeight: 21,
  },
  reviewImagesRow: {
    columnGap: 10,
  },
  reviewImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#e8eef3',
  },
  ownerReplyBox: {
    borderRadius: 14,
    backgroundColor: '#eef8fb',
    borderWidth: 1,
    borderColor: '#d6edf5',
    padding: 14,
    rowGap: 6,
  },
  ownerReplyLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  ownerReplyContent: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  ownerReplyMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  replyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 16,
  },
  replyLinkText: {
    color: colors.primary,
    fontWeight: '700',
  },
  replyDeleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
  replyEditorCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9e7ef',
    backgroundColor: '#fbfdff',
    padding: 14,
    rowGap: 10,
  },
  replyEditorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  replyEditorInput: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d9e3eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  replyPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyPrimaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  replySecondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d9e3eb',
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replySecondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  reviewErrorCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f7c9c7',
    backgroundColor: '#fff7f7',
    padding: 18,
    rowGap: 8,
  },
  reviewErrorTitle: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
  reviewErrorText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
