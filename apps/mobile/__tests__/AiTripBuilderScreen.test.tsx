import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AiTripBuilderScreen from '../app/(tabs)/screens/AiTripBuilderScreen';

const mockPlanTrip = jest.fn();
const mockCreateTrip = jest.fn();
const mockCreateTripStop = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock('../lib/api/ai', () => ({
  planTrip: (...args: unknown[]) => mockPlanTrip(...args),
}));

jest.mock('../lib/api/trips', () => ({
  createTrip: (...args: unknown[]) => mockCreateTrip(...args),
  createTripStop: (...args: unknown[]) => mockCreateTripStop(...args),
}));

describe('AiTripBuilderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(((_title?: string, _message?: string, buttons?: any) => {
      buttons?.[0]?.onPress?.();
    }) as any);
  });

  it('generates AI suggestions and persists them as a trip', async () => {
    mockPlanTrip.mockResolvedValueOnce({
      query: 'chuyến đi cuối tuần',
      location: 'Đà Nẵng',
      suggestions: [
        { title: 'Sáng ở biển Mỹ Khê', description: 'Đi dạo và ăn sáng', duration: '3 giờ' },
        { title: 'Chiều ở Sơn Trà', description: 'Ngắm cảnh và cà phê', duration: '4 giờ' },
        { title: 'Tối ăn hải sản', description: 'Kết thúc nhẹ nhàng', duration: '2 giờ' },
      ],
      note: 'Ưu tiên nhịp đi chậm và dễ di chuyển.',
    });
    mockCreateTrip.mockResolvedValueOnce({
      id: 'trip-1',
      title: 'AI: chuyến đi cuối tuần',
      destination: 'Đà Nẵng',
      startDate: '2026-05-29',
      endDate: '2026-05-31',
      budget: 'balanced',
      notes: 'Ưu tiên nhịp đi chậm và dễ di chuyển.',
      stopCount: 0,
      dayCount: 0,
      updatedAt: '2026-05-29T10:00:00.000Z',
      stops: [],
    });
    mockCreateTripStop.mockResolvedValue({
      id: 'trip-1',
      title: 'AI: chuyến đi cuối tuần',
      destination: 'Đà Nẵng',
      startDate: '2026-05-29',
      endDate: '2026-05-31',
      budget: 'balanced',
      notes: 'Ưu tiên nhịp đi chậm và dễ di chuyển.',
      stopCount: 1,
      dayCount: 1,
      updatedAt: '2026-05-29T10:00:00.000Z',
      stops: [],
    });

    const screen = render(
      <AiTripBuilderScreen
        navigation={navigation}
        route={{
          key: 'AI Trip Builder-key',
          name: 'AI Trip Builder',
          params: { initialQuery: 'chuyến đi cuối tuần', initialLocation: 'Đà Nẵng' },
        } as any}
      />
    );

    fireEvent.press(screen.getByTestId('generate-ai-trip-button'));

    await waitFor(() => {
      expect(screen.getByText('Gợi ý cho Đà Nẵng')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('create-trip-from-ai-button'));

    await waitFor(() => {
      expect(mockCreateTrip).toHaveBeenCalled();
      expect(mockCreateTripStop).toHaveBeenCalledTimes(3);
    });
  });
});
