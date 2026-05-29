import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingCheckoutScreen from '../app/(tabs)/screens/BookingCheckoutScreen';

const mockFetchPlaceBookingOptions = jest.fn();
const mockCreateBooking = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock('../lib/api/bookings', () => ({
  fetchPlaceBookingOptions: (...args: unknown[]) => mockFetchPlaceBookingOptions(...args),
  createBooking: (...args: unknown[]) => mockCreateBooking(...args),
}));

describe('BookingCheckoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(((_title?: string, _message?: string, buttons?: any) => {
      buttons?.[0]?.onPress?.();
    }) as any);
  });

  it('submits a booking for the selected slot', async () => {
    mockFetchPlaceBookingOptions.mockResolvedValueOnce([
      {
        id: 'option-1',
        placeId: 'place-1',
        title: 'Bàn tối cho 2 người',
        description: 'View đẹp',
        priceLabel: '350.000đ / bàn',
        durationMinutes: 90,
        maxPartySize: 2,
        isActive: true,
        slots: [
          {
            id: 'slot-1',
            optionId: 'option-1',
            startAt: '2026-06-15T11:00:00.000Z',
            endAt: '2026-06-15T12:30:00.000Z',
            dateLabel: '15/06/2026',
            timeLabel: '18:00 - 19:30',
            capacity: 4,
            remainingCapacity: 4,
            isActive: true,
            isBookable: true,
          },
        ],
      },
    ]);
    mockCreateBooking.mockResolvedValueOnce({
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
      note: 'Bàn gần cửa sổ',
      status: 'PENDING',
      createdAt: '2026-05-29T11:00:00.000Z',
      updatedAt: '2026-05-29T11:00:00.000Z',
      canCancel: true,
    });

    const screen = render(
      <BookingCheckoutScreen
        navigation={navigation}
        route={{
          key: 'Booking Checkout-key',
          name: 'Booking Checkout',
          params: { placeId: 'place-1', placeName: 'Happy Restaurant' },
        } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bàn tối cho 2 người')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Ví dụ: 2'), '2');
    fireEvent.changeText(
      screen.getByPlaceholderText('Ví dụ: cần bàn gần cửa sổ hoặc đi cùng trẻ nhỏ'),
      'Bàn gần cửa sổ'
    );
    fireEvent.press(screen.getByTestId('submit-booking-button'));

    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith({
        slotId: 'slot-1',
        partySize: 2,
        note: 'Bàn gần cửa sổ',
      });
    });
  });
});
