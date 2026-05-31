import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import BookingHistoryScreen from '../app/(tabs)/screens/BookingHistoryScreen';

const mockFetchMyBookings = jest.fn();
const mockCancelBooking = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('../lib/api/bookings', () => ({
  fetchMyBookings: () => mockFetchMyBookings(),
  cancelBooking: (...args: unknown[]) => mockCancelBooking(...args),
}));

describe('BookingHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when user has no bookings', async () => {
    mockFetchMyBookings.mockResolvedValueOnce([]);

    const screen = render(<BookingHistoryScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByText('Bạn chưa có booking nào')).toBeTruthy();
      expect(screen.getByText('Lịch đặt chỗ')).toBeTruthy();
    });
  });

  it('navigates to booking detail when tapping a booking card', async () => {
    mockFetchMyBookings.mockResolvedValueOnce([
      {
        id: 'booking-1',
        placeId: 'place-1',
        placeName: 'Happy Restaurant',
        placeImageUrl: 'https://cdn.example.com/place.jpg',
        optionId: 'option-1',
        optionTitle: 'Bàn tối cho 2 người',
        slotId: 'slot-1',
        slotDateLabel: '15/06/2026',
        slotTimeLabel: '18:00 - 19:30',
        slotStartAt: '2026-06-15T11:00:00.000Z',
        slotEndAt: '2026-06-15T12:30:00.000Z',
        partySize: 2,
        note: null,
        status: 'CONFIRMED',
        createdAt: '2026-05-29T11:00:00.000Z',
        updatedAt: '2026-05-29T11:00:00.000Z',
        canCancel: false,
      },
    ]);

    const screen = render(<BookingHistoryScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByText('Happy Restaurant')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Happy Restaurant'));
    expect(navigation.navigate).toHaveBeenCalledWith('Booking Detail', { bookingId: 'booking-1' });
  });
});
