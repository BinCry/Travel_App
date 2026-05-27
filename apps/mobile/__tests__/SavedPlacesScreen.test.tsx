import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import SavedPlacesScreen from "../app/(tabs)/screens/SavedPlacesScreen";

const mockFetchFavorites = jest.fn();
const mockRemoveFavorite = jest.fn();
const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as any;

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("../lib/api/favorites", () => ({
  fetchFavorites: () => mockFetchFavorites(),
  removeFavorite: (...args: unknown[]) => mockRemoveFavorite(...args),
}));

describe("SavedPlacesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hiển thị trạng thái trống khi chưa có địa điểm đã lưu", async () => {
    mockFetchFavorites.mockResolvedValueOnce([]);

    const screen = render(<SavedPlacesScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByText("Chưa có địa điểm yêu thích")).toBeTruthy();
      expect(screen.getByText("Thêm địa điểm vào danh sách yêu thích để quay lại nhanh hơn.")).toBeTruthy();
    });
  });
});
