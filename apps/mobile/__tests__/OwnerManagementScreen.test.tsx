import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import OwnerManagementScreen from "../app/(tabs)/screens/OwnerManagementScreen";

const mockFetchOwnerPlaces = jest.fn();
const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("../lib/api/owner", () => ({
  fetchOwnerPlaces: () => mockFetchOwnerPlaces(),
}));

describe("OwnerManagementScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hiển thị danh sách địa điểm và cho phép điều hướng sang màn sửa", async () => {
    mockFetchOwnerPlaces.mockResolvedValueOnce([
      {
        id: "place-1",
        name: "Cầu Rồng",
        location: "Đà Nẵng",
        imageUrl: "https://example.com/dragon-bridge.jpg",
      },
    ]);

    const screen = render(<OwnerManagementScreen navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByText("Cầu Rồng")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Sửa"));

    expect(navigation.navigate).toHaveBeenCalledWith("Manage Place", { placeId: "place-1" });
  });
});
