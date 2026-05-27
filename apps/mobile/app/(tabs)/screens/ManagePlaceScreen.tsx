import { formatDate } from '@/app/service/PromotionShedule';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { placeCategories } from '../common/placeCategories';
import PromotionCard from '../components/PromotionCard';
import PromotionEditor from '../components/PromotionEditor';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import { styles as formStyles } from './AddLocationScreen.style';
import {
  createPromotion,
  deleteOwnerPlace,
  deletePromotion,
  fetchOwnerPlace,
  updateOwnerPlace,
  updatePromotion,
  togglePromotion,
} from '../../../lib/api/owner';
import { uploadPlaceCover } from '../../../lib/api/uploads';
import type { OwnerPlaceDetail, PlaceCategory, PromotionItem } from '../../../lib/api/types';
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

  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

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
});
