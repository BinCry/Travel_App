import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import ManagePlaceScreen from "../app/(tabs)/screens/ManagePlaceScreen";

const mockFetchOwnerPlace = jest.fn();
const mockFetchOwnerPlaceReviews = jest.fn();

const navigation = {
  goBack: jest.fn(),
} as any;

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("../lib/api/owner", () => ({
  fetchOwnerPlace: (...args: unknown[]) => mockFetchOwnerPlace(...args),
  fetchOwnerPlaceReviews: (...args: unknown[]) => mockFetchOwnerPlaceReviews(...args),
  updateOwnerPlace: jest.fn(),
  deleteOwnerPlace: jest.fn(),
  createOwnerPlaceUpdate: jest.fn(),
  updateOwnerPlaceUpdate: jest.fn(),
  deleteOwnerPlaceUpdate: jest.fn(),
  createPromotion: jest.fn(),
  updatePromotion: jest.fn(),
  togglePromotion: jest.fn(),
  deletePromotion: jest.fn(),
  upsertOwnerReviewReply: jest.fn(),
  deleteOwnerReviewReply: jest.fn(),
}));

jest.mock("../lib/api/uploads", () => ({
  uploadPlaceCover: jest.fn(),
}));

describe("ManagePlaceScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the owner reply and opens the editor", async () => {
    mockFetchOwnerPlace.mockResolvedValueOnce({
      id: "place-1",
      name: "Lantern Cafe",
      location: "Hoi An",
      imageUrl: "https://cdn.example.com/place-1.jpg",
      category: "dining",
      about: "Quiet place for coffee.",
      featureLabel: "Đang mở cửa",
      priceLevel: 2,
      latitude: null,
      longitude: null,
      promotions: [],
      updates: [],
    });
    mockFetchOwnerPlaceReviews.mockResolvedValueOnce([
      {
        id: "review-1",
        username: "Linh Nguyễn",
        rating: 5,
        date: "29/05/2026",
        content: "Wonderful place",
        avatarUrl: null,
        imageUrls: [],
        likes: 3,
        ownerReply: {
          id: "reply-1",
          ownerName: "Minh Hoàng",
          content: "Thank you for visiting.",
          date: "29/05/2026",
        },
      },
    ]);

    const screen = render(
      <ManagePlaceScreen
        navigation={navigation}
        route={{ key: "Manage Place-key", name: "Manage Place", params: { placeId: "place-1" } } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Phản hồi từ Minh Hoàng")).toBeTruthy();
      expect(screen.getByText("Thank you for visiting.")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Sửa phản hồi"));

    await waitFor(() => {
      expect(screen.getByText("Chỉnh sửa phản hồi")).toBeTruthy();
      expect(screen.getByDisplayValue("Thank you for visiting.")).toBeTruthy();
    });
  });
});
