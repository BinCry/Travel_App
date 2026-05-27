import { formatDate, getTimeValue } from '@/app/service/PromotionShedule';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors } from '../common/colors';
import { styles } from '../screens/AddLocationScreen.style';
import type { PromotionItem } from '../types/promotion';
import { PromotionEditorStyles } from './PromotionEditor.style';

interface EditorProps {
  initialData?: { title: string; schedule: PromotionItem['schedule'] };
  onSave: (data: { title: string; schedule: PromotionItem['schedule'] }) => void;
  onCancel: () => void;
}

const DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'S'];

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;

  const parts = dateStr.replace(',', '').split(' ');
  if (parts.length < 3) return null;

  const monthIndex = MONTH_MAP[parts[0]];
  const day = Number(parts[1]);
  const year = Number(parts[2]);
  if (monthIndex === undefined || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, monthIndex, day);
}

export default function PromotionEditor({
  initialData,
  onSave,
  onCancel,
}: EditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [startDate, setStartDate] = useState(initialData?.schedule?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.schedule?.endDate || '');
  const [endTime, setEndTime] = useState(initialData?.schedule?.endTime || '');
  const [startTime, setStartTime] = useState(initialData?.schedule?.startTime || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.schedule?.days || []);
  const [specificTime, setSpecificTime] = useState<boolean>(
    initialData?.schedule?.specificTime || false
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [activePicker, setActivePicker] = useState<'start' | 'end'>('start');
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<'start' | 'end'>('start');

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  };

  const showDatePicker = (type: 'start' | 'end') => {
    setActivePicker(type);
    setDatePickerVisibility(true);
  };

  const showTimePicker = (type: 'start' | 'end') => {
    setActiveTimePicker(type);
    setTimePickerVisibility(true);
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = formatDate(date);
    if (activePicker === 'start') {
      setStartDate(formattedDate);
    } else {
      setEndDate(formattedDate);
    }
    setDatePickerVisibility(false);
  };

  const handleConfirmTime = (date: Date) => {
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (activeTimePicker === 'start') {
      setStartTime(formattedTime);
    } else {
      setEndTime(formattedTime);
    }
    setTimePickerVisibility(false);
  };

  const handleCancel = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setSelectedDays([]);
    setSpecificTime(false);
    onCancel();
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề ưu đãi.');
      return;
    }
    if (!startDate || !endDate || selectedDays.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày bắt đầu, ngày kết thúc và ít nhất một ngày lặp.');
      return;
    }
    if (specificTime && (!startTime || !endTime)) {
      Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ giờ bắt đầu và giờ kết thúc.');
      return;
    }

    const startD = parseDateString(startDate);
    const endD = parseDateString(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if ((startD?.getTime() ?? 0) < today.getTime()) {
      Alert.alert('Lỗi', 'Ngày bắt đầu không được nằm trong quá khứ.');
      return;
    }

    if ((startD?.getTime() ?? 0) > (endD?.getTime() ?? 0)) {
      Alert.alert('Lỗi', 'Ngày bắt đầu phải sớm hơn hoặc bằng ngày kết thúc.');
      return;
    }

    if (specificTime) {
      const startValue = getTimeValue(startTime);
      const endValue = getTimeValue(endTime);

      if (startValue >= endValue) {
        Alert.alert('Lỗi', 'Giờ bắt đầu phải sớm hơn giờ kết thúc.');
        return;
      }
    }

    onSave({
      title,
      schedule: {
        startDate,
        endDate,
        days: selectedDays,
        startTime,
        endTime,
        specificTime,
      },
    });
  };

  return (
    <View style={[styles.card, { borderColor: colors.primary, borderWidth: 1.5 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="pricetag" size={20} color={colors.primary} />
          <Text style={{ fontWeight: 'bold', marginLeft: 8, color: colors.primary }}>
            {initialData ? 'Chỉnh sửa ưu đãi' : 'Tạo ưu đãi mới'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={{ color: colors.textSecondary }}>Hủy</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput
        style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
        placeholder="Ví dụ: Giảm 20% cho thực đơn buổi trưa"
        multiline
        value={title}
        onChangeText={setTitle}
      />

      <View style={PromotionEditorStyles.dateRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Ngày bắt đầu</Text>
          <TouchableOpacity
            style={PromotionEditorStyles.dateInputBox}
            onPress={() => showDatePicker('start')}>
            <Text style={{ fontSize: 12 }}>{startDate}</Text>
            <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Ngày kết thúc</Text>
          <TouchableOpacity
            style={PromotionEditorStyles.dateInputBox}
            onPress={() => showDatePicker('end')}>
            <Text style={{ fontSize: 12 }}>{endDate}</Text>
            <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Lặp lại vào</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => toggleDay(day)}
            style={[
              PromotionEditorStyles.dayCircle,
              selectedDays.includes(day) && PromotionEditorStyles.dayCircleActive,
            ]}>
            <Text
              style={{
                fontSize: 10,
                color: selectedDays.includes(day) ? 'white' : colors.textPrimary,
              }}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Thời gian áp dụng</Text>
      <View style={PromotionEditorStyles.timeToggleContainer}>
        <TouchableOpacity
          onPress={() => setSpecificTime(false)}
          style={[
            PromotionEditorStyles.timeToggleButton,
            !specificTime && PromotionEditorStyles.timeToggleButtonActive,
          ]}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: !specificTime ? colors.primary : colors.textSecondary,
            }}>
            Cả ngày
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSpecificTime(true)}
          style={[
            PromotionEditorStyles.timeToggleButton,
            specificTime && PromotionEditorStyles.timeToggleButtonActive,
          ]}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: specificTime ? colors.primary : colors.textSecondary,
            }}>
            Khung giờ
          </Text>
        </TouchableOpacity>
      </View>

      {specificTime ? (
        <View style={PromotionEditorStyles.dateRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Giờ bắt đầu</Text>
            <TouchableOpacity
              style={PromotionEditorStyles.dateInputBox}
              onPress={() => showTimePicker('start')}>
              <Text style={{ fontSize: 12 }}>{startTime}</Text>
              <Ionicons name="time-outline" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Giờ kết thúc</Text>
            <TouchableOpacity
              style={PromotionEditorStyles.dateInputBox}
              onPress={() => showTimePicker('end')}>
              <Text style={{ fontSize: 12 }}>{endTime}</Text>
              <Ionicons name="time-outline" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu ưu đãi</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisibility(false)}
        is24Hour={false}
      />
    </View>
  );
}
