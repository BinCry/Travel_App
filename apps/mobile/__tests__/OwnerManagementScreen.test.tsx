import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import OwnerManagementScreen from '../app/(tabs)/screens/OwnerManagementScreen';

const mockFetchOwnerPlaces = jest.fn();
const mockFetchOwnerAnalyticsSummary = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('../lib/api/owner', () => ({
  fetchOwnerPlaces: () => mockFetchOwnerPlaces(),
  fetchOwnerAnalyticsSummary: () => mockFetchOwnerAnalyticsSummary(),
}));

describe('OwnerManagementScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics summary and navigates to place management', async () => {
    mockFetchOwnerPlaces.mockResolvedValueOnce([
      {
        id: 'place-1',
        name: 'Cau Rong',
        location: 'Da Nang',
        imageUrl: 'https://example.com/dragon-bridge.jpg',
      },
    ]);
    mockFetchOwnerAnalyticsSummary.mockResolvedValueOnce({
      placeCount: 1,
      activePromotionCount: 1,
      totalBookingCount: 3,
      pendingBookingCount: 1,
      confirmedBookingCount: 1,
      completedBookingCount: 1,
      reviewCount: 2,
      favoriteCount: 4,
      averageRating: 4.8,
      topPlaces: [
        {
          placeId: 'place-1',
          placeName: 'Cau Rong',
          bookingCount: 3,
          reviewCount: 2,
          favoriteCount: 4,
          activePromotionCount: 1,
          averageRating: 4.8,
        },
      ],
    });

    const screen = render(<OwnerManagementScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByTestId('owner-analytics-summary')).toBeTruthy();
      expect(screen.getByTestId('owner-top-place-place-1')).toBeTruthy();
      expect(screen.getByTestId('edit-owner-place-place-1')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-owner-place-place-1'));

    expect(navigation.navigate).toHaveBeenCalledWith('Manage Place', { placeId: 'place-1' });
  });
});
