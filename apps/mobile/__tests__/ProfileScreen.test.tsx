import React from "react";
import { render } from "@testing-library/react-native";
import ProfileScreen from "../app/(tabs)/screens/ProfileScreen";

const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock("../app/(tabs)/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: "demo@example.com",
      emailVerified: true,
      fullName: "Alex Johnson",
      username: "Alex_love_travel",
      location: "Viá»‡t Nam",
      avatarUrl: "https://example.com/avatar.jpg",
      name: "Alex Johnson",
      role: "traveler",
    },
  }),
}));

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders inside a scroll container and shows the key profile actions", () => {
    const screen = render(<ProfileScreen navigation={navigation} />);

    expect(screen.getByTestId("profile-scroll-view")).toBeTruthy();
    expect(screen.getByText("Alex Johnson")).toBeTruthy();
    expect(screen.getByText("Tài khoản & bảo mật")).toBeTruthy();
    expect(screen.getByText("Địa điểm đã lưu")).toBeTruthy();
    expect(screen.getByText("Bộ sưu tập")).toBeTruthy();
    expect(screen.getByText("Thông báo")).toBeTruthy();
    expect(screen.getByText("Đánh giá của bạn")).toBeTruthy();
  });
});
