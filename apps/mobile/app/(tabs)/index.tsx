import AddLocationScreen from './screens/AddLocationScreen';
import AiTripBuilderScreen from './screens/AiTripBuilderScreen';
import BookingCheckoutScreen from './screens/BookingCheckoutScreen';
import BookingDetailScreen from './screens/BookingDetailScreen';
import BookingHistoryScreen from './screens/BookingHistoryScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import CollectionDetailScreen from './screens/CollectionDetailScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import DetailLocationScreen from './screens/DetailLocationScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import LogoutScreen from './screens/LogoutScreen';
import ManageBookingsScreen from './screens/ManageBookingsScreen';
import ManagePlaceScreen from './screens/ManagePlaceScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import OwnerManagementScreen from './screens/OwnerManagementScreen';
import OwnerBookingDetailScreen from './screens/OwnerBookingDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import SavedPlacesScreen from './screens/SavedPlacesScreen';
import TermsScreen from './screens/TermsScreen';
import TripPlannerScreen from './screens/TripPlannerScreen';
import TripsScreen from './screens/TripsScreen';
import UserReviewsScreen from './screens/UserReviewsScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import ViewReviewsScreen from './screens/ViewReviewsScreen';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { colors } from './common/colors';
import type {
  MainTabParamList,
  OwnerTabParamList,
  RootStackParamList,
} from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const OwnerTab = createBottomTabNavigator<OwnerTabParamList>();

const MainTabs = () => {
  return (
    <MainTab.Navigator screenOptions={() => ({
      tabBarActiveTintColor: '#00B4D8',
      tabBarInactiveTintColor: 'gray'
    })}>
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Khám phá',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen name="Profile" component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} />
    </MainTab.Navigator>
  );
};

const OwnerTabs = () => {
  return (
    <OwnerTab.Navigator screenOptions={() => ({
      tabBarActiveTintColor: '#00B4D8',
      tabBarInactiveTintColor: 'gray'
    })}>
      <OwnerTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Khám phá',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <OwnerTab.Screen name="Manage" component={OwnerManagementScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Quản lý',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <OwnerTab.Screen name="Profile" component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} />
    </OwnerTab.Navigator>
  );
};

const AuthenticatedStack = ({ isOwner }: { isOwner: boolean }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Main"
      component={isOwner ? OwnerTabs : MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Detail Location"
      component={DetailLocationScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Booking Checkout"
      component={BookingCheckoutScreen}
      options={{
        headerShown: true,
        title: 'Đặt chỗ',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Booking History"
      component={BookingHistoryScreen}
      options={{
        headerShown: true,
        title: 'Lịch đặt chỗ',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Booking Detail"
      component={BookingDetailScreen}
      options={{
        headerShown: true,
        title: 'Chi tiết booking',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="All Reviews"
      component={ViewReviewsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Saved Places"
      component={SavedPlacesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Collections"
      component={CollectionsScreen}
      options={{
        headerShown: true,
        title: 'Bộ sưu tập của bạn',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Collection Detail"
      component={CollectionDetailScreen}
      options={{
        headerShown: true,
        title: 'Chi tiết bộ sưu tập',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        headerShown: true,
        title: 'Thông báo',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Trips"
      component={TripsScreen}
      options={{
        headerShown: true,
        title: 'Hành trình của bạn',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Trip Planner"
      component={TripPlannerScreen}
      options={{
        headerShown: true,
        title: 'Chi tiết hành trình',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="AI Trip Builder"
      component={AiTripBuilderScreen}
      options={{
        headerShown: true,
        title: 'AI Trip Builder',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Your Reviews"
      component={UserReviewsScreen}
      options={{ headerShown: false }}
    />
    {isOwner ? (
      <>
        <Stack.Screen
          name="Add Location"
          component={AddLocationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Manage Place"
          component={ManagePlaceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Manage Bookings"
          component={ManageBookingsScreen}
          options={{
            headerShown: true,
            title: 'Quản lý booking',
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerShadowVisible: false,
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen
          name="Owner Booking Detail"
          component={OwnerBookingDetailScreen}
          options={{
            headerShown: true,
            title: 'Chi tiết booking',
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerShadowVisible: false,
            headerTintColor: '#000',
          }}
        />
      </>
    ) : null}
    <Stack.Screen
      name="Log Out"
      component={LogoutScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Edit Profile"
      component={EditProfileScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        title: "Chỉnh sửa hồ sơ",
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Change Password"
      component={ChangePasswordScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        title: 'Đổi mật khẩu',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
    <Stack.Screen
      name="Delete Account"
      component={DeleteAccountScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        title: 'Xóa tài khoản',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#000',
      }}
    />
  </Stack.Navigator>
);


const RootNavigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{
            headerShown: true,
            title: 'Điều khoản sử dụng',
            headerStyle: { backgroundColor: '#f6fbff' },
            headerShadowVisible: false,
            headerTintColor: '#111827',
          }}
        />
        <Stack.Screen name="Verify Email" component={VerifyEmailScreen} />
        <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }

  return <AuthenticatedStack isOwner={user.role === 'owner'} />;
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
