import React from "react";
import { StyleSheet } from "react-native";
import { render } from "@testing-library/react-native";
import UserAvatar from "../app/(tabs)/components/UserAvatar";

describe("UserAvatar", () => {
  it("fills the requested frame size when rendering a remote avatar", () => {
    const screen = render(
      <UserAvatar uri="https://example.com/avatar.jpg" size={150} borderWidth={0} />
    );

    const avatar = screen.getByTestId("user-avatar-image");
    expect(StyleSheet.flatten(avatar.props.style)).toMatchObject({
      width: 150,
      height: 150,
      borderRadius: 75,
    });
  });

  it("keeps fallback avatars on the same circular frame", () => {
    const screen = render(<UserAvatar size={150} borderWidth={0} />);

    const avatar = screen.getByTestId("user-avatar-fallback");
    expect(StyleSheet.flatten(avatar.props.style)).toMatchObject({
      width: 150,
      height: 150,
      borderRadius: 75,
    });
  });
});
