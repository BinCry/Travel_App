import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  deleteCollection,
  fetchCollectionDetail,
  removePlaceFromCollection,
  updateCollection,
} from '../../../lib/api/collections';
import type { CollectionDetail, CollectionPlaceItem } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { TOP_SAFE_AREA_EDGES, withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

function PlaceCard({
  item,
  onRemove,
  onOpen,
  removing,
}: {
  item: CollectionPlaceItem;
  onRemove: () => void;
  onOpen: () => void;
  removing: boolean;
}) {
  return (
    <Pressable
      onPress={onOpen}
      style={{
        borderRadius: 22,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e7eef5',
        overflow: 'hidden',
      }}>
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: '100%', height: 170, backgroundColor: '#eef4f8' }}
      />
      <View style={{ padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>
          {item.name}
        </Text>
        <Text style={{ color: colors.textSecondary }}>{item.location}</Text>
        <Text style={{ color: colors.textSecondary }}>
          {item.rating} • {item.ratingCount} đánh giá
        </Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>{item.featureLabel}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Đã thêm {new Date(item.addedAt).toLocaleDateString('vi-VN')}
          </Text>
          <Pressable
            onPress={onRemove}
            style={{
              borderRadius: 12,
              backgroundColor: '#fee2e2',
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}>
            <Text style={{ color: colors.danger, fontWeight: '800' }}>
              {removing ? 'Đang gỡ...' : 'Gỡ khỏi bộ sưu tập'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function CollectionDetailScreen({
  navigation,
  route,
}: AppScreenProps<'Collection Detail'>) {
  const insets = useSafeAreaInsets();
  const collectionId = route.params.collectionId;
  const [detail, setDetail] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingPlaceId, setRemovingPlaceId] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCollectionDetail(collectionId);
      setDetail(data);
      setTitle(data.title);
      setIsPublic(data.isPublic);
      setLoadError(null);
    } catch (error) {
      setDetail(null);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useFocusEffect(
    useCallback(() => {
      void loadDetail();
    }, [loadDetail])
  );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu tên bộ sưu tập', 'Vui lòng nhập tên trước khi lưu.');
      return;
    }

    setSaving(true);
    try {
      await updateCollection(collectionId, {
        title: title.trim(),
        isPublic,
      });
      await loadDetail();
    } catch (error) {
      Alert.alert('Không thể cập nhật', toUserMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Xóa bộ sưu tập', 'Bạn muốn xóa bộ sưu tập này chứ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteCollection(collectionId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Không thể xóa', toUserMessage(error));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleRemovePlace = (place: CollectionPlaceItem) => {
    Alert.alert('Gỡ địa điểm', `Bạn muốn gỡ "${place.name}" khỏi bộ sưu tập này?`, [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Gỡ',
        style: 'destructive',
        onPress: async () => {
          setRemovingPlaceId(place.id);
          try {
            await removePlaceFromCollection(collectionId, place.id);
            await loadDetail();
          } catch (error) {
            Alert.alert('Không thể gỡ địa điểm', toUserMessage(error));
          } finally {
            setRemovingPlaceId(null);
          }
        },
      },
    ]);
  };

  if (loading && !detail && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f8fb' }} edges={TOP_SAFE_AREA_EDGES}>
      <FlatList
        testID="collection-detail-list"
        data={detail?.places ?? []}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadDetail}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: withBottomInset(insets.bottom, 24),
          gap: 14,
        }}
        ListHeaderComponent={
          <View style={{ gap: 14 }}>
            <View
              style={{
                borderRadius: 24,
                backgroundColor: '#ffffff',
                padding: 18,
                borderWidth: 1,
                borderColor: '#e7eef5',
                gap: 12,
              }}>
              <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>
                Cài đặt bộ sưu tập
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Tên bộ sưu tập"
                placeholderTextColor="#9ca3af"
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#d7e4ed',
                  backgroundColor: '#fbfdff',
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  backgroundColor: '#f7fafc',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                    Bộ sưu tập công khai
                  </Text>
                  <Text style={{ marginTop: 4, color: colors.textSecondary, lineHeight: 20 }}>
                    Khi bật, bạn có thể dùng bộ sưu tập này như một danh sách giới thiệu mở.
                  </Text>
                </View>
                <Switch value={isPublic} onValueChange={setIsPublic} />
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => void handleSave()}
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    backgroundColor: colors.primary,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: saving ? 0.7 : 1,
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  style={{
                    borderRadius: 16,
                    backgroundColor: '#111827',
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    opacity: deleting ? 0.7 : 1,
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>
                    {deleting ? 'Đang xóa...' : 'Xóa'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                borderRadius: 24,
                backgroundColor: '#ffffff',
                padding: 18,
                borderWidth: 1,
                borderColor: '#e7eef5',
              }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>
                {detail?.title ?? 'Bộ sưu tập'}
              </Text>
              <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 22 }}>
                {detail
                  ? `${detail.placeCount} địa điểm • ${detail.isPublic ? 'Công khai' : 'Riêng tư'} • cập nhật ${new Date(detail.updatedAt).toLocaleDateString('vi-VN')}`
                  : loadError ?? 'Đang tải dữ liệu bộ sưu tập.'}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PlaceCard
            item={item}
            removing={removingPlaceId === item.id}
            onOpen={() => navigation.navigate('Detail Location', { placeId: item.id })}
            onRemove={() => handleRemovePlace(item)}
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              borderRadius: 24,
              backgroundColor: '#ffffff',
              padding: 22,
              borderWidth: 1,
              borderColor: '#e7eef5',
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>
              {loadError ? 'Không thể tải bộ sưu tập' : 'Chưa có địa điểm nào'}
            </Text>
            <Text
              style={{
                marginTop: 8,
                color: colors.textSecondary,
                lineHeight: 22,
                textAlign: 'center',
              }}>
              {loadError ??
                'Hãy quay lại trang chi tiết địa điểm để lưu thêm những nơi bạn muốn gom vào bộ sưu tập này.'}
            </Text>
            {loadError ? (
              <Pressable
                onPress={() => void loadDetail()}
                style={{
                  marginTop: 14,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}
