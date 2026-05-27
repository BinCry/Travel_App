import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import VerifyEmailScreen from "../app/(tabs)/screens/VerifyEmailScreen";

const mockVerifyEmail = jest.fn();
const mockResendVerificationOtp = jest.fn();
const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock("../app/(tabs)/context/AuthContext", () => ({
  useAuth: () => ({
    verifyEmail: mockVerifyEmail,
    resendVerificationOtp: mockResendVerificationOtp,
  }),
}));

describe("VerifyEmailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("gọi verifyEmail với OTP người dùng nhập", async () => {
    mockVerifyEmail.mockResolvedValueOnce({
      message: "Xác minh thành công.",
      accessToken: "token",
      user: { id: 1, email: "user@example.com" },
    });

    const screen = render(
      <VerifyEmailScreen
        navigation={navigation}
        route={{ key: "verify", name: "Verify Email", params: { email: "user@example.com" } } as any}
      />
    );

    fireEvent.changeText(screen.getByPlaceholderText("Nhập mã OTP gồm 6 chữ số"), "123456");
    fireEvent.press(screen.getByText("Xác minh và bắt đầu"));

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith("user@example.com", "123456");
    });
  });

  it("gọi gửi lại OTP khi người dùng yêu cầu", async () => {
    mockResendVerificationOtp.mockResolvedValueOnce({
      message: "Đã gửi lại mã OTP.",
    });

    const screen = render(
      <VerifyEmailScreen
        navigation={navigation}
        route={{ key: "verify", name: "Verify Email", params: { email: "user@example.com" } } as any}
      />
    );

    fireEvent.press(screen.getByText("Gửi lại mã OTP"));

    await waitFor(() => {
      expect(mockResendVerificationOtp).toHaveBeenCalledWith("user@example.com");
    });
  });
});
