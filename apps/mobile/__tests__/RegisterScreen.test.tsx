import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../app/(tabs)/screens/RegisterScreen";

const mockRegister = jest.fn();
const navigation = {
  navigate: jest.fn(),
} as any;

jest.mock("expo-checkbox", () => ({
  Checkbox: ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => {
    const React = require("react");
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable testID="agreement-checkbox" onPress={() => onValueChange(!value)}>
        <Text>{value ? "Đã chọn" : "Chưa chọn"}</Text>
      </Pressable>
    );
  },
}));

jest.mock("../app/(tabs)/context/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("yêu cầu đồng ý điều khoản trước khi đăng ký", () => {
    const screen = render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(screen.getByText("Tạo tài khoản"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Lỗi",
      "Vui lòng đồng ý điều khoản sử dụng."
    );
  });

  it("đăng ký owner đúng tham số và hiển thị hướng dẫn nhập OTP", async () => {
    mockRegister.mockResolvedValueOnce({
      email: "owner@example.com",
      message: "Đã gửi mã OTP xác minh email.",
    });

    const screen = render(<RegisterScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByPlaceholderText("Họ và tên"), "Nguyễn Chủ Địa Điểm");
    fireEvent.changeText(screen.getByPlaceholderText("Địa chỉ email"), "owner@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Mật khẩu"), "secret123");
    fireEvent.changeText(screen.getByPlaceholderText("Xác nhận mật khẩu"), "secret123");
    fireEvent.press(screen.getByText("Chủ địa điểm"));
    fireEvent.press(screen.getByTestId("agreement-checkbox"));
    fireEvent.press(screen.getByText("Tạo tài khoản"));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "owner@example.com",
        "secret123",
        "Nguyễn Chủ Địa Điểm",
        "owner"
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Kiểm tra email",
      "Đã gửi mã OTP xác minh email.",
      expect.any(Array)
    );
  });
});
