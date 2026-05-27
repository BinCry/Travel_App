import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../common/colors';
import type { AppNavigationOnlyProps } from '../types/navigation';

const sections = [
  {
    title: '1. Phạm vi sử dụng',
    body:
      'Travel App hỗ trợ khám phá địa điểm, lưu địa điểm yêu thích, viết đánh giá và quản lý địa điểm dành cho tài khoản chủ địa điểm. Bạn cần cung cấp thông tin chính xác và chỉ sử dụng ứng dụng cho mục đích hợp pháp.',
  },
  {
    title: '2. Tài khoản và bảo mật',
    body:
      'Bạn chịu trách nhiệm bảo mật mật khẩu, mã OTP và thiết bị đăng nhập. Không chia sẻ tài khoản cho người khác. Nếu phát hiện hoạt động bất thường, hãy đổi mật khẩu ngay trong phần tài khoản.',
  },
  {
    title: '3. Nội dung do người dùng đăng',
    body:
      'Đánh giá, hình ảnh và thông tin địa điểm phải trung thực, không vi phạm pháp luật, không chứa nội dung xúc phạm, lừa đảo hoặc xâm phạm quyền riêng tư của người khác.',
  },
  {
    title: '4. Quyền quản lý của chủ địa điểm',
    body:
      'Tài khoản chủ địa điểm chỉ được tạo, sửa hoặc xóa dữ liệu thuộc phạm vi sở hữu của mình. Mọi hành vi can thiệp vào dữ liệu của tài khoản khác sẽ bị từ chối.',
  },
  {
    title: '5. Xóa tài khoản',
    body:
      'Khi bạn xác nhận xóa tài khoản, dữ liệu liên quan sẽ bị xóa vĩnh viễn theo phạm vi quyền của tài khoản. Với chủ địa điểm, địa điểm và ưu đãi do bạn quản lý cũng sẽ bị xóa khỏi hệ thống.',
  },
];

export default function TermsScreen(_: AppNavigationOnlyProps<'Terms'>) {
  return (
    <SafeAreaView style={styles.background}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Điều khoản sử dụng</Text>
          <Text style={styles.subtitle}>
            Vui lòng đọc kỹ trước khi tạo tài khoản và sử dụng đầy đủ các tính năng của Travel App.
          </Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Việc tiếp tục đăng ký đồng nghĩa với việc bạn đồng ý tuân thủ các điều khoản trên.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f6fbff',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    marginTop: 6,
    paddingHorizontal: 6,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
