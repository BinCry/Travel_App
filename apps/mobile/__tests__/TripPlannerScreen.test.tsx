import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import TripPlannerScreen from '../app/(tabs)/screens/TripPlannerScreen';

const mockFetchTrip = jest.fn();
const mockCreateTrip = jest.fn();
const mockUpdateTrip = jest.fn();
const mockCreateTripStop = jest.fn();
const mockUpdateTripStop = jest.fn();
const mockDeleteTrip = jest.fn();
const mockDeleteTripStop = jest.fn();

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

jest.mock('../lib/api/trips', () => ({
  fetchTrip: (...args: unknown[]) => mockFetchTrip(...args),
  createTrip: (...args: unknown[]) => mockCreateTrip(...args),
  updateTrip: (...args: unknown[]) => mockUpdateTrip(...args),
  createTripStop: (...args: unknown[]) => mockCreateTripStop(...args),
  updateTripStop: (...args: unknown[]) => mockUpdateTripStop(...args),
  deleteTrip: (...args: unknown[]) => mockDeleteTrip(...args),
  deleteTripStop: (...args: unknown[]) => mockDeleteTripStop(...args),
}));

describe('TripPlannerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tạo hành trình mới và điều hướng sang bản đã lưu', async () => {
    mockCreateTrip.mockResolvedValueOnce({
      id: 'trip-1',
      title: 'Kyoto chill',
      destination: 'Kyoto',
      startDate: '2026-06-12',
      endDate: '2026-06-14',
      budget: 'balanced',
      notes: 'Slow travel only',
      stopCount: 0,
      dayCount: 0,
      updatedAt: '2026-05-29T10:30:00.000Z',
      stops: [],
    });

    const screen = render(
      <TripPlannerScreen
        navigation={navigation}
        route={{ key: 'Trip Planner-key', name: 'Trip Planner', params: undefined } as any}
      />
    );

    fireEvent.changeText(screen.getByTestId('trip-title-input'), 'Kyoto chill');
    fireEvent.changeText(screen.getByPlaceholderText('Ví dụ: Kyoto, Nhật Bản'), 'Kyoto');
    fireEvent.press(screen.getByTestId('save-trip-button'));

    await waitFor(() => {
      expect(mockCreateTrip).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Trip Planner', { tripId: 'trip-1' });
    });
  });

  it('hiển thị điểm dừng hiện có ở màn chỉnh sửa', async () => {
    mockFetchTrip.mockResolvedValueOnce({
      id: 'trip-1',
      title: 'Kyoto chill',
      destination: 'Kyoto',
      startDate: '2026-06-12',
      endDate: '2026-06-14',
      budget: 'balanced',
      notes: 'Slow travel only',
      stopCount: 1,
      dayCount: 1,
      updatedAt: '2026-05-29T10:30:00.000Z',
      stops: [
        {
          id: 'stop-1',
          dayNumber: 1,
          orderIndex: 1,
          title: 'Walk around Gion',
          location: 'Kyoto',
          note: 'Golden hour',
          startTime: '16:30',
          endTime: '18:00',
        },
      ],
    });

    const screen = render(
      <TripPlannerScreen
        navigation={navigation}
        route={{ key: 'Trip Planner-key', name: 'Trip Planner', params: { tripId: 'trip-1' } } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Walk around Gion')).toBeTruthy();
      expect(screen.getByText('Golden hour')).toBeTruthy();
    });
  });
});
