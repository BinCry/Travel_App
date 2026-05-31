import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import NotificationsScreen from "../app/(tabs)/screens/NotificationsScreen";

const mockFetchNotifications = jest.fn();
const mockMarkNotificationRead = jest.fn();

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("../lib/api/notifications", () => ({
  fetchNotifications: (...args: unknown[]) => mockFetchNotifications(...args),
  markNotificationRead: (...args: unknown[]) => mockMarkNotificationRead(...args),
  markAllNotificationsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

describe("NotificationsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders notifications and opens the linked screen when tapped", async () => {
    mockFetchNotifications.mockResolvedValueOnce([
      {
        id: "notif-1",
        type: "review_reply",
        title: "Chủ địa điểm đã phản hồi đánh giá của bạn",
        message: "Minh Hoàng vừa gửi phản hồi cho review tại Lantern Cafe.",
        payload: {
          screen: "All Reviews",
          params: {
            placeId: "place-1",
            placeName: "Lantern Cafe",
          },
        },
        readAt: null,
        createdAt: "2026-05-30T10:00:00.000Z",
      },
    ]);
    mockMarkNotificationRead.mockResolvedValueOnce({
      id: "notif-1",
      type: "review_reply",
      title: "Chủ địa điểm đã phản hồi đánh giá của bạn",
      message: "Minh Hoàng vừa gửi phản hồi cho review tại Lantern Cafe.",
      payload: {
        screen: "All Reviews",
        params: {
          placeId: "place-1",
          placeName: "Lantern Cafe",
        },
      },
      readAt: "2026-05-30T10:01:00.000Z",
      createdAt: "2026-05-30T10:00:00.000Z",
    });

    const screen = render(
      <NotificationsScreen
        navigation={navigation}
        route={{ key: "Notifications-key", name: "Notifications", params: undefined } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Chủ địa điểm đã phản hồi đánh giá của bạn")).toBeTruthy();
      expect(screen.getByText("Mới")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Chủ địa điểm đã phản hồi đánh giá của bạn"));

    await waitFor(() => {
      expect(mockMarkNotificationRead).toHaveBeenCalledWith("notif-1");
      expect(navigation.navigate).toHaveBeenCalledWith("All Reviews", {
        placeId: "place-1",
        placeName: "Lantern Cafe",
      });
    });
  });
});
