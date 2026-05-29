import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import TripsScreen from '../app/(tabs)/screens/TripsScreen';

const mockFetchTrips = jest.fn();
const mockDeleteTrip = jest.fn();
const mockDuplicateTrip = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('../lib/api/trips', () => ({
  fetchTrips: () => mockFetchTrips(),
  deleteTrip: (...args: unknown[]) => mockDeleteTrip(...args),
  duplicateTrip: (...args: unknown[]) => mockDuplicateTrip(...args),
}));

describe('TripsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hiển thị empty state khi chưa có hành trình', async () => {
    mockFetchTrips.mockResolvedValueOnce([]);

    const screen = render(<TripsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByText('Bạn chưa có hành trình nào')).toBeTruthy();
      expect(screen.getByText('Tạo trước một kế hoạch cơ bản để sau đó thêm AI gợi ý, sắp xếp ngày đi và chuẩn bị booking.')).toBeTruthy();
    });
  });

  it('đi tới màn tạo hành trình mới', async () => {
    mockFetchTrips.mockResolvedValueOnce([]);

    const screen = render(<TripsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByTestId('create-trip-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('create-trip-button'));
    expect(navigation.navigate).toHaveBeenCalledWith('Trip Planner');
  });
});
