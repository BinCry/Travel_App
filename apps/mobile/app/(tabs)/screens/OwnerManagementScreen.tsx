import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchOwnerPlaces } from '../../../lib/api/owner';
import type { OwnerPlace } from '../../../lib/api/owner';
import { colors } from '../common/colors';
import { toUserMessage } from '../common/errorMessages';
import type { AppNavigationOnlyProps } from '../types/navigation';
import styles from './OwnerManagementScreen.styles';

function renderPlace(item: OwnerPlace, onEdit: (item: OwnerPlace) => void) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {item.location}
        </Text>
        <View style={[styles.buttonRow, { justifyContent: 'flex-end' }]}>
          <TouchableOpacity style={styles.btnEdit} onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={14} color="#212121" />
            <Text style={styles.btnEditText}>Sửa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function OwnerManagementScreen({
  navigation,
}: AppNavigationOnlyProps<'Manage'>) {
  const [places, setPlaces] = useState<OwnerPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOwnerPlaces();
      setPlaces(data);
      setLoadError(null);
    } catch (error) {
      setPlaces([]);
      setLoadError(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPlaces();
    }, [loadPlaces])
  );

  const handleEditPress = (item: OwnerPlace) => {
    navigation.navigate('Manage Place', { placeId: item.id });
  };

  const headerComponent = () => (
    <View>
      <View
        style={{
          flexDirection: 'row',
          margin: 10,
          marginBottom: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
          <View style={styles.roundButton}>
            <Ionicons name="storefront" size={35} color={colors.primary} />
          </View>
          <View style={{ flexDirection: 'column', margin: 10, flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20 }} numberOfLines={2}>
              Quản lý địa điểm
            </Text>
            <Text style={[styles.linkText, { color: '#90a4ae' }]} numberOfLines={2}>
              Theo dõi địa điểm và ưu đãi của bạn
            </Text>
          </View>
        </View>
        <View style={{ paddingRight: 10 }}>
          <Ionicons name="briefcase" size={28} color="black" />
        </View>
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Add Location')}>
          <Text style={styles.buttonText}>+ Thêm địa điểm mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && places.length === 0 && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', marginTop: 30 }}>
      <FlatList
        data={places}
        renderItem={({ item }) => renderPlace(item, handleEditPress)}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadPlaces}
        ListEmptyComponent={
          loadError ? (
            <View
              style={{
                marginHorizontal: 14,
                marginTop: 16,
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
                Không thể tải danh sách quản lý
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
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ marginBottom: 10 }}>Bạn chưa có địa điểm nào.</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Add Location')}>
                <Text style={styles.buttonText}>+ Thêm địa điểm mới</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}
