import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { planTrip } from '../../../lib/api/ai';
import { fetchPlaces } from '../../../lib/api/places';
import type { PlaceCategory, PlaceListItem } from '../../../lib/api/types';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import type { AppNavigationOnlyProps, AppNavigationProp } from '../types/navigation';
import styles from './HomeScreen.styles';

type Place = PlaceListItem;

const CATEGORY_OPTIONS: {
  value: PlaceCategory;
  label: string;
  icon: ImageSourcePropType;
  flex: number;
}[] = [
  {
    value: 'attractions',
    label: 'Điểm đến',
    icon: require('../../../assets/images/camera-icon.png'),
    flex: 1.08,
  },
  {
    value: 'dining',
    label: 'Ẩm thực',
    icon: require('../../../assets/images/dining-icon.png'),
    flex: 1.04,
  },
  {
    value: 'festivals',
    label: 'Lễ hội',
    icon: require('../../../assets/images/festival-icon.png'),
    flex: 0.88,
  },
];

function renderPlaceCard(item: Place, navigation: AppNavigationProp<'Home'>) {
  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={{ flexDirection: 'column', flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '600' }} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={{ color: colors.textSecondary }} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text>⭐</Text>
          <Text style={{ fontWeight: '700' }}>{item.rating}</Text>
          <Text style={{ fontWeight: '400', color: colors.textMuted }}>({item.ratingCount})</Text>
        </View>
      </View>

      <View style={styles.TagContainer} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#BFF0DB',
            backgroundColor: '#e5f6ef',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            flexShrink: 1,
            marginRight: 12,
          }}>
          <Text style={{ color: '#00875A', fontWeight: '600' }} numberOfLines={1}>
            {item.featureLabel}
          </Text>
        </View>

        <Pressable onPress={() => navigation.navigate('Detail Location', { placeId: item.id })}>
          <Text style={{ fontWeight: '600', color: colors.primary }}>Chi tiết</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: AppNavigationOnlyProps<'Home'>) {
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>('attractions');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlaces(activeCategory);
      setPlaces(data);
      setLoadError(null);
    } catch (error) {
      setPlaces([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  const handlePlanWithAi = async () => {
    const q = searchQuery.trim() || 'chuyến đi cuối tuần';
    setAiLoading(true);
    try {
      const plan = await planTrip(q, 'Gần bạn');
      const body = plan.suggestions
        .map((suggestion, index) => `${index + 1}. ${suggestion.title}\n${suggestion.description}`)
        .join('\n\n');
      Alert.alert('Gợi ý chuyến đi', `${body}\n\n${plan.note}`);
    } catch (error) {
      Alert.alert('Lỗi', toUserMessage(error));
    } finally {
      setAiLoading(false);
    }
  };

  const renderPlaceItem = useCallback(
    ({ item }: { item: Place }) => renderPlaceCard(item, navigation),
    [navigation]
  );

  const emptyState = useMemo(() => {
    if (loadError) {
      return (
        <View
          style={{
            marginTop: 22,
            marginHorizontal: 10,
            padding: 18,
            borderRadius: 16,
            backgroundColor: '#fff7f7',
            borderWidth: 1,
            borderColor: '#f7c9c7',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.danger,
              fontWeight: '700',
              fontSize: 16,
              textAlign: 'center',
            }}>
            Không thể tải danh sách địa điểm
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: colors.textSecondary,
              lineHeight: 20,
              textAlign: 'center',
            }}>
            {loadError}
          </Text>
          <Pressable
            style={{
              marginTop: 14,
              borderRadius: 12,
              backgroundColor: colors.primary,
              paddingHorizontal: 18,
              paddingVertical: 10,
            }}
            onPress={() => void loadPlaces()}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Thử tải lại</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>
        Chưa có địa điểm nào trong danh mục này.
      </Text>
    );
  }, [loadError, loadPlaces]);

  const renderHeader = () => (
    <View style={[styles.container, styles.headerSection]}>
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ color: colors.textSecondary }}>Khu vực gợi ý</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-sharp" size={18} color={colors.primary} />
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 4 }}>Gần bạn</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Bạn muốn khám phá điều gì?"
            style={{ flex: 1 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textMuted}
          />
          <Ionicons name="search" size={20} color={colors.textSecondary} />
        </View>
      </View>

      <View style={styles.categoryRow}>
        {CATEGORY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.categoryButton,
              { flex: option.flex },
              activeCategory === option.value ? styles.categoryButtonActive : undefined,
            ]}
            onPress={() => setActiveCategory(option.value)}>
            <View style={styles.containerCategoryButton}>
              <View style={styles.categoryIconSlot}>
                <Image source={option.icon} style={styles.categoryIconImage} resizeMode="contain" />
              </View>
              <Text
                style={styles.categoryButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.95}>
                {option.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>
        <Pressable
          style={[styles.aiCard, { flex: 1 }]}
          onPress={handlePlanWithAi}
          disabled={aiLoading}>
          <View style={styles.aiCardContent}>
            <Image
              source={require('../../../assets/images/AIPlan-icon.png')}
              style={styles.aiCardIcon}
            />
            <View style={styles.aiCardTextBlock}>
              <Text style={styles.aiCardTitle} numberOfLines={1}>
                {aiLoading ? 'Đang tạo gợi ý...' : 'Lên kế hoạch với AI'}
              </Text>
              <Text style={styles.aiCardSubtitle} numberOfLines={2}>
                Nhận gợi ý hành trình phù hợp với nhu cầu của bạn
              </Text>
            </View>
            <Image
              source={require('../../../assets/images/right-arrow-icon.png')}
              style={styles.aiCardArrow}
            />
          </View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <Text style={{ flex: 1, fontWeight: '500', fontSize: 23 }}>Nổi bật tuần này</Text>
      </View>
    </View>
  );

  if (loading && places.length === 0 && !loadError) {
    return (
      <View
        style={[
          styles.background,
          { justifyContent: 'center', alignItems: 'center', marginTop: 35 },
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.background, { justifyContent: 'center', marginTop: 35 }]}>
      <View style={styles.container}>
        <FlatList
          data={places}
          renderItem={renderPlaceItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadPlaces}
          ListEmptyComponent={emptyState}
        />
      </View>
    </View>
  );
}
