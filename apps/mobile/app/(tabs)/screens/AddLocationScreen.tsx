import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { formatDate } from '@/app/service/PromotionShedule';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import PromotionCard from "../components/PromotionCard";
import PromotionEditor from '../components/PromotionEditor';
import { placeCategories } from '../common/placeCategories';
import { styles } from './AddLocationScreen.style';
import { getApiErrorMessage } from '../context/AuthContext';
import { createOwnerPlace } from '../../../lib/api/owner';
import { uploadPlaceCover } from '../../../lib/api/uploads';
import type { PlaceCategory } from '../../../lib/api/types';
import type { PromotionItem } from '../types/promotion';
import type { AppNavigationOnlyProps } from '../types/navigation';

const AddLocationScreen = ({ navigation }: AppNavigationOnlyProps<'Add Location'>) => {
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>('attractions');
  const [isAdding, setIsAdding] = useState(false);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('Việt Nam');
  const [preview, setPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleToggle = (id: string) => {
    setPromotions(prevPromos =>
      prevPromos.map(promo =>
        promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
      )
    );
  };

  const handleSavePromo = (id: string | null, newData: Partial<PromotionItem>) => {
    if (id) {
      setPromotions(prev => prev.map(p => p.id === id ? { ...p, ...newData } : p));
      setEditingId(null);
    } else {
      const newPromo: PromotionItem = {
        id: Date.now().toString(),
        title: newData.title || '',
        isActive: true,
        schedule: newData.schedule!,
      };
      setPromotions([newPromo, ...promotions]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setPromotions(promotions.filter(item => item.id !== id));
  };

  const handleImageChange = async () => {
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
      setPreview(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!placeName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên địa điểm.');
      return;
    }
    if (!preview) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh bìa cho địa điểm trước khi đăng.');
      return;
    }
    setSaving(true);
    try {
      let coverImageUrl = '';
      try {
        coverImageUrl = await uploadPlaceCover(preview);
      } catch (err) {
        const code = getApiErrorMessage(err);
        if (code === 'STORAGE_UNAVAILABLE') {
          Alert.alert(
            'Tải ảnh chưa sẵn sàng',
            'Kiểm tra PUBLIC_BASE_URL, UPLOADS_DIR và volume uploads trên backend/Coolify, sau đó chạy: npm run storage:verify'
          );
        } else {
          Alert.alert('Lỗi', toUserMessage(err));
        }
        return;
      }
      await createOwnerPlace({
        name: placeName.trim(),
        region: region.trim() || 'Việt Nam',
        category: activeCategory,
        about: description.trim(),
        coverImageUrl,
        featureLabel: 'Đang mở cửa',
        promotions: promotions.map((p) => ({
          title: p.title,
          isActive: p.isActive,
          schedule: p.schedule,
        })),
      });
      Alert.alert('Thành công', 'Đã tạo địa điểm mới.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setPlaceName('');
    setDescription('');
    setRegion('Việt Nam');
    setPreview('');
    setPromotions([]);
    setActiveCategory('attractions');
  };

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm địa điểm mới</Text>
        <TouchableOpacity onPress={resetForm}>
          <Text style={styles.resetText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.alertContainer}>
          <Ionicons name="warning" size={20} color={colors.warning} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Lưu ý</Text>
            <Text style={styles.alertText}>
              Hãy kiểm tra kỹ thông tin trước khi đăng để nội dung hiển thị chính xác cho người dùng.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Tên địa điểm</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Quán cà phê Phố Cũ"
            placeholderTextColor={colors.textMuted}
            value={placeName}
            onChangeText={setPlaceName}
          />

          <Text style={styles.label}>Khu vực / Thành phố</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Quận 1, Thành phố Hồ Chí Minh"
            placeholderTextColor={colors.textMuted}
            value={region}
            onChangeText={setRegion}
          />

          <Text style={styles.label}>Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {placeCategories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setActiveCategory(cat.value)}
                style={[styles.chip, activeCategory === cat.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, activeCategory === cat.value && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả điều khiến địa điểm này nổi bật..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Text style={styles.sectionTitle}>Hình ảnh</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.uploadBox, { marginTop: 0 }]}
            onPress={handleImageChange}
          >
            {preview ? (
              <Image source={{ uri: preview }} style={{ width: '100%', height: 120, borderRadius: 8 }} />
            ) : (
              <>
                <View style={{ backgroundColor: colors.primaryLight, padding: 10, borderRadius: 30, marginBottom: 8 }}>
                  <Ionicons name="cloud-upload" size={24} color={colors.primary} />
                </View>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Nhấn để tải ảnh bìa</Text>
                <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Hỗ trợ JPG, PNG (tối đa 5MB)</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handlePublish} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.buttonText}>Lưu và đăng địa điểm </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Ưu đãi hiện có</Text>
        </View>

        {promotions.map((item) => (
          editingId === item.id ? (
            <PromotionEditor
              key={item.id}
              initialData={item}
              onSave={(data) => handleSavePromo(item.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <PromotionCard
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onEdit={() => { setEditingId(item.id); setIsAdding(false); }}
              onDelete={() => handleDelete(item.id)}
            />
          )
        ))}

        {!isAdding && (
          <View style={[styles.uploadBox, { padding: 16, borderStyle: 'dashed' }]}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Muốn thu hút thêm khách?</Text>
            <TouchableOpacity onPress={() => { setIsAdding(true); setEditingId(null); }}>
              <Text style={[styles.linkText, { fontWeight: 'bold' }]}>Tạo ưu đãi theo mùa</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAdding && (
          <PromotionEditor
            initialData={{
              title: '',
              schedule: {
                startDate: formatDate(new Date()),
                endDate: formatDate(new Date()),
                days: ['M'],
                startTime: '8:00 AM',
                endTime: '5:00 PM',
                specificTime: false,
              }
            }}
            onSave={(data) => handleSavePromo(null, data)}
            onCancel={() => setIsAdding(false)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddLocationScreen;
