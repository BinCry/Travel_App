import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const applyAndroidEdgeToEdge = async () => {
      try {
        await SystemUI.setBackgroundColorAsync('transparent');
      } catch {
        // Ignore unsupported runtime implementations.
      }

      try {
        await NavigationBar.setPositionAsync('absolute');
      } catch {
        // Native edge-to-edge builds may already control this.
      }

      try {
        await NavigationBar.setBackgroundColorAsync('#00000000');
      } catch {
        // Background changes are ignored on some Android edge-to-edge setups.
      }

      try {
        await NavigationBar.setBorderColorAsync('#00000000');
      } catch {
        // Divider color is not configurable everywhere.
      }

      try {
        await NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
      } catch {
        // Fall back to config/plugin styling when runtime control is unavailable.
      }

      try {
        NavigationBar.setStyle(colorScheme === 'dark' ? 'dark' : 'light');
      } catch {
        // Only supported on some three-button Android configurations.
      }
    };

    void applyAndroidEdgeToEdge();
  }, [colorScheme]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: '#ffffff' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Hộp thoại' }} />
        </Stack>
        <StatusBar
          style={colorScheme === 'dark' ? 'light' : 'dark'}
          translucent
          backgroundColor="transparent"
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
