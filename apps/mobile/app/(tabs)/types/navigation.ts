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
  "Manage Bookings": { placeId: string; placeName?: string };
  "Saved Places": undefined;
  Trips: undefined;
  "Trip Planner": undefined | { tripId?: string };
  "AI Trip Builder": undefined | { initialQuery?: string; initialLocation?: string };
  "Booking Checkout": { placeId: string; placeName?: string };
  "Booking History": undefined;
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
