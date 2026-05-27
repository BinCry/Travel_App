import { getApiErrorMessage } from '../context/AuthContext';

const defaultMessages: Record<string, string> = {
  VALIDATION: 'Thông tin chưa hợp lệ.',
  INVALID_CREDENTIALS: 'Sai email hoặc mật khẩu.',
  ACCOUNT_NOT_FOUND: 'Email này chưa được đăng ký.',
  EMAIL_TAKEN: 'Email đã được sử dụng.',
  EMAIL_NOT_VERIFIED: 'Email của bạn chưa được xác minh.',
  EMAIL_ALREADY_VERIFIED: 'Email này đã được xác minh.',
  USERNAME_TAKEN: 'Tên người dùng đã được sử dụng.',
  OTP_INVALID: 'Mã OTP không đúng.',
  OTP_EXPIRED: 'Mã OTP đã hết hạn.',
  PASSWORD_TOO_WEAK: 'Mật khẩu phải từ 8 đến 72 ký tự.',
  EMAIL_DELIVERY_FAILED: 'Không thể gửi email lúc này.',
  PLACE_NOT_FOUND: 'Không tìm thấy địa điểm.',
  REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá.',
  PROMOTION_NOT_FOUND: 'Không tìm thấy ưu đãi.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  UNAUTHORIZED: 'Vui lòng đăng nhập lại để tiếp tục.',
  INVALID_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  RATE_LIMITED: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
  AI_UNAVAILABLE: 'Tính năng AI tạm thời chưa khả dụng.',
  AI_RATE_LIMITED: 'AI đang bận. Vui lòng thử lại sau.',
  STORAGE_UNAVAILABLE: 'Tính năng tải ảnh tạm thời chưa sẵn sàng.',
  UPLOAD_FAILED: 'Không thể tải ảnh lên lúc này.',
  UNSUPPORTED_MEDIA_TYPE: 'Định dạng tệp chưa được hỗ trợ.',
  FILE_TOO_LARGE: 'Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.',
  MISSING_FILE: 'Bạn chưa chọn tệp tải lên.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  INTERNAL: 'Có lỗi xảy ra. Vui lòng thử lại.',
};

export function toUserMessage(error: unknown, overrides: Record<string, string> = {}) {
  const code = getApiErrorMessage(error);
  return overrides[code] ?? defaultMessages[code] ?? defaultMessages.INTERNAL;
}
