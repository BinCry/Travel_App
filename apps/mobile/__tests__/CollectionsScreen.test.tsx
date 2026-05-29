import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CollectionsScreen from '../app/(tabs)/screens/CollectionsScreen';

const mockFetchCollections = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('../lib/api/collections', () => ({
  fetchCollections: (...args: unknown[]) => mockFetchCollections(...args),
  createCollection: jest.fn(),
  addPlaceToCollection: jest.fn(),
  removePlaceFromCollection: jest.fn(),
}));

describe('CollectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collections and navigates to detail in browse mode', async () => {
    mockFetchCollections.mockResolvedValueOnce([
      {
        id: 'collection-1',
        title: 'Bộ sưu tập hè 2026',
        isPublic: false,
        placeCount: 2,
        createdAt: '2026-05-30T10:00:00.000Z',
        updatedAt: '2026-05-30T10:00:00.000Z',
      },
    ]);

    const screen = render(
      <CollectionsScreen
        navigation={navigation}
        route={{ key: 'Collections-key', name: 'Collections', params: undefined } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bộ sưu tập hè 2026')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Bộ sưu tập hè 2026'));

    expect(navigation.navigate).toHaveBeenCalledWith('Collection Detail', {
      collectionId: 'collection-1',
    });
  });
});
