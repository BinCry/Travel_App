import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addPlaceToCollection,
  createCollection,
  fetchCollections,
  removePlaceFromCollection,
} from '../../../lib/api/collections';
import type { CollectionSummary } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { TOP_SAFE_AREA_EDGES, withBottomInset } from '../common/edgeToEdge';
import { toUserMessage } from '../common/errorMessages';
import type { AppScreenProps } from '../types/navigation';

export default function CollectionsScreen({
  navigation,
  route,
}: AppScreenProps<'Collections'>) {
  const insets = useSafeAreaInsets();
  const placeId = route.params?.placeId;
  const placeName = route.params?.placeName ?? 'địa điểm này';
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPublic, setDraftPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCollections(placeId);
      setCollections(data);
      setLoadError(null);
    } catch (error) {
      setCollections([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useFocusEffect(
    useCallback(() => {
      void loadCollections();
    }, [loadCollections])
  );

  const handleCreateCollection = async () => {
    if (!draftTitle.trim()) {
      Alert.alert('Thiếu tên bộ sưu tập', 'Vui lòng nhập tên trước khi tạo.');
      return;
    }

    setCreating(true);
    try {
      const created = await createCollection({
        title: draftTitle.trim(),
        isPublic: draftPublic,
      });

      if (placeId) {
        await addPlaceToCollection(created.id, placeId);
      }

      setDraftTitle('');
      setDraftPublic(false);
      await loadCollections();
    } catch (error) {
      Alert.alert('Không thể tạo bộ sưu tập', toUserMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePlace = async (collection: CollectionSummary) => {
    if (!placeId) {
      return;
    }

    setMutatingId(collection.id);
    try {
      if (collection.containsPlace) {
        await removePlaceFromCollection(collection.id, placeId);
      } else {
        await addPlaceToCollection(collection.id, placeId);
      }
      await loadCollections();
    } catch (error) {
      Alert.alert('Không thể cập nhật bộ sưu tập', toUserMessage(error));
    } finally {
      setMutatingId(null);
    }
  };

  if (loading && collections.length === 0 && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f8fb' }} edges={TOP_SAFE_AREA_EDGES}>
      <FlatList
        testID="collections-list"
        data={collections}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadCollections}
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
                padding: 20,
                borderWidth: 1,
                borderColor: '#e7eef5',
              }}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>
                {placeId ? 'Lưu vào bộ sưu tập' : 'Bộ sưu tập của bạn'}
              </Text>
              <Text style={{ marginTop: 8, color: colors.textSecondary, lineHeight: 22 }}>
                {placeId
                  ? `Chọn nơi lưu ${placeName} để gom địa điểm theo chuyến đi, gu khám phá hoặc danh sách yêu thích riêng.`
                  : 'Tạo các bộ sưu tập riêng để gom địa điểm theo lịch trình, phong cách du lịch hoặc nhóm bạn đồng hành.'}
              </Text>
            </View>

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
                Tạo bộ sưu tập mới
              </Text>
              <TextInput
                placeholder="Ví dụ: Wishlist mùa hè"
                placeholderTextColor="#9ca3af"
                value={draftTitle}
                onChangeText={setDraftTitle}
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
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                    Chia sẻ công khai
                  </Text>
                  <Text style={{ marginTop: 4, color: colors.textSecondary, lineHeight: 20 }}>
                    Bật nếu bạn muốn dùng bộ sưu tập này như một danh sách gợi ý mở.
                  </Text>
                </View>
                <Switch value={draftPublic} onValueChange={setDraftPublic} />
              </View>
              <Pressable
                testID="collections-create-button"
                onPress={() => void handleCreateCollection()}
                style={{
                  borderRadius: 16,
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: creating ? 0.7 : 1,
                }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>
                  {creating ? 'Đang tạo...' : placeId ? 'Tạo và lưu ngay' : 'Tạo bộ sưu tập'}
                </Text>
              </Pressable>
            </View>

            {loadError ? (
              <View
                style={{
                  borderRadius: 18,
                  backgroundColor: '#fff7f7',
                  borderWidth: 1,
                  borderColor: '#f7c9c7',
                  padding: 16,
                }}>
                <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 16 }}>
                  Không thể tải bộ sưu tập
                </Text>
                <Text style={{ marginTop: 6, color: colors.textSecondary, lineHeight: 21 }}>
                  {loadError}
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const isManagingPlace = Boolean(placeId);
          const isMutating = mutatingId === item.id;
          return (
            <Pressable
              onPress={() =>
                isManagingPlace
                  ? undefined
                  : navigation.navigate('Collection Detail', { collectionId: item.id })
              }
              style={{
                borderRadius: 22,
                backgroundColor: '#ffffff',
                padding: 18,
                borderWidth: 1,
                borderColor: '#e7eef5',
                opacity: isMutating ? 0.8 : 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>
                    {item.title}
                  </Text>
                  <Text style={{ marginTop: 6, color: colors.textSecondary }}>
                    {item.placeCount} địa điểm • {item.isPublic ? 'Công khai' : 'Riêng tư'}
                  </Text>
                  {isManagingPlace ? (
                    <Text
                      style={{
                        marginTop: 8,
                        color: item.containsPlace ? colors.success : colors.textSecondary,
                        fontWeight: '700',
                      }}>
                      {item.containsPlace ? 'Đã chứa địa điểm này' : 'Chưa lưu địa điểm này'}
                    </Text>
                  ) : (
                    <Text style={{ marginTop: 8, color: colors.textSecondary }}>
                      Cập nhật gần nhất {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </View>

                {isManagingPlace ? (
                  <Pressable
                    onPress={() => void handleTogglePlace(item)}
                    style={{
                      borderRadius: 14,
                      backgroundColor: item.containsPlace ? '#eef8fb' : '#111827',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      minWidth: 92,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: item.containsPlace ? colors.primary : '#fff',
                        fontWeight: '800',
                      }}>
                      {isMutating
                        ? 'Đang lưu...'
                        : item.containsPlace
                          ? 'Bỏ lưu'
                          : 'Lưu vào'}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>Chi tiết</Text>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loadError ? (
            <View
              style={{
                borderRadius: 22,
                backgroundColor: '#ffffff',
                padding: 24,
                borderWidth: 1,
                borderColor: '#e7eef5',
                alignItems: 'center',
              }}>
              <Text
                style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
                Chưa có bộ sưu tập nào
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: colors.textSecondary,
                  lineHeight: 22,
                  textAlign: 'center',
                }}>
                Tạo bộ sưu tập đầu tiên để gom nơi bạn muốn đi, chỗ định quay lại hoặc các gợi ý cho chuyến tiếp theo.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
