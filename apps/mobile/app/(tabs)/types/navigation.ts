import type { NavigationProp, RouteProp } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type OwnerTabParamList = {
  Home: undefined;
  Manage: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Terms: undefined;
  "Verify Email": { email: string };
  "Forgot Password": undefined;
  Main: undefined;
  "Detail Location": { placeId: string };
  "Log Out": undefined;
  "All Reviews": { placeId: string; placeName?: string };
  "Edit Profile": undefined;
  "Change Password": undefined;
  "Delete Account": undefined;
  "Add Location": undefined;
  "Manage Place": { placeId: string };
  "Saved Places": undefined;
  "Your Reviews": undefined;
};

export type AppRouteParamList = RootStackParamList &
  MainTabParamList &
  OwnerTabParamList;

export type AppNavigationProp<
  RouteName extends keyof AppRouteParamList = keyof AppRouteParamList,
> = NavigationProp<AppRouteParamList, RouteName>;

export type AppNavigationOnlyProps<RouteName extends keyof AppRouteParamList> = {
  navigation: AppNavigationProp<RouteName>;
};

export type AppScreenProps<RouteName extends keyof AppRouteParamList> = {
  navigation: AppNavigationProp<RouteName>;
  route: RouteProp<AppRouteParamList, RouteName>;
};
