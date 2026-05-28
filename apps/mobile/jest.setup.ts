jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: (props: Record<string, unknown>) => React.createElement("Icon", props),
    MaterialIcons: (props: Record<string, unknown>) => React.createElement("Icon", props),
  };
});

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
