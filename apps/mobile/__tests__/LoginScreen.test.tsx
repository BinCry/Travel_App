import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import LoginScreen from "../app/(tabs)/screens/LoginScreen";

const mockLogin = jest.fn();
const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock("../app/(tabs)/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  getApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "INTERNAL",
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("shows an error when email or password is missing", () => {
    const screen = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(screen.getByText("Đăng nhập"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Lỗi",
      "Vui lòng nhập email và mật khẩu."
    );
  });

  it("trims the email before calling login", async () => {
    const screen = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByPlaceholderText("Địa chỉ email"), "  user@example.com  ");
    fireEvent.changeText(screen.getByPlaceholderText("Mật khẩu"), "secret123");
    fireEvent.press(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "secret123");
    });
  });

  it("shows the unverified email warning when backend returns EMAIL_NOT_VERIFIED", async () => {
    mockLogin.mockRejectedValueOnce(new Error("EMAIL_NOT_VERIFIED"));
    const screen = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Địa chỉ email"),
      "minh.host@example.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("Mật khẩu"), "travel1234");
    fireEvent.press(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Email chưa xác minh",
        "Bạn cần xác minh email trước khi sử dụng ứng dụng.",
        expect.any(Array)
      );
    });
  });
});
