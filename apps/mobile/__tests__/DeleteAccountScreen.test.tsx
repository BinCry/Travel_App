import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import DeleteAccountScreen from "../app/(tabs)/screens/DeleteAccountScreen";

const mockDeleteAccount = jest.fn();

jest.mock("../app/(tabs)/context/AuthContext", () => ({
  useAuth: () => ({
    deleteAccount: mockDeleteAccount,
    user: {
      role: "owner",
    },
  }),
}));

describe("DeleteAccountScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("báo lỗi nếu chưa nhập mật khẩu hiện tại", () => {
    const screen = render(<DeleteAccountScreen />);

    fireEvent.press(screen.getByText("Xóa vĩnh viễn"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Lỗi",
      "Vui lòng nhập mật khẩu hiện tại để xác nhận."
    );
  });

  it("xác nhận xóa và gọi deleteAccount khi người dùng đồng ý", async () => {
    mockDeleteAccount.mockResolvedValueOnce(
      "Tài khoản và toàn bộ địa điểm, ưu đãi liên quan đã được xóa vĩnh viễn."
    );

    const screen = render(<DeleteAccountScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Nhập mật khẩu hiện tại"),
      "secret123"
    );
    fireEvent.press(screen.getByText("Xóa vĩnh viễn"));

    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    await act(async () => {
      await buttons[1].onPress();
    });

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledWith("secret123");
    });
  });
});
