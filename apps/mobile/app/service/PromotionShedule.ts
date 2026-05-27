import { Schedule } from '../(tabs)/types/promotion';
export const getScheduleString = (schedule: Schedule): string => {
  const { startDate, endDate, days, startTime, endTime, specificTime } = schedule;

  // Map chữ cái viết tắt sang tên đầy đủ (tùy chọn)
  const dayMap: { [key: string]: string } = {
    'M': 'Thứ 2',
    'T': 'Thứ 3',
    'W': 'Thứ 4',
    'Th': 'Thứ 5',
    'F': 'Thứ 6',
    'Sa': 'Thứ 7',
    'S': 'Chủ nhật'
  };

  // Lưu ý: Trong logic thực tế, bạn cần phân biệt T (Tue/Thu) và S (Sat/Sun) 
  // bằng cách lưu Index (0-6) thay vì chữ cái nếu muốn chính xác tuyệt đối.
  const daysText = days.map(day => dayMap[day]).join(', ');

  const timeText = specificTime ? `${startTime} - ${endTime}` : 'Cả ngày';

  return `Ưu đãi áp dụng từ ${startDate} đến ${endDate}, vào ${daysText}, khung giờ ${timeText}`;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    month: '2-digit',
    day: 'numeric',
    year: 'numeric',
  });
};

// Hàm chuyển đổi chuỗi "HH:mm AM/PM" thành giá trị số để so sánh
export const getTimeValue = (timeStr: string) => {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes; // Trả về tổng số phút trong ngày
};
