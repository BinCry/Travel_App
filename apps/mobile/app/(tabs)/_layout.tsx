import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarStyle: {
                    display: 'none'
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Khám phá',
                }}
            />
            <Tabs.Screen name="AuthStyles" options={{ href: null }} />
            <Tabs.Screen name="screens/LoginScreen" options={{ href: null }} />
            <Tabs.Screen name="screens/RegisterScreen" options={{ href: null }} />
        </Tabs>
    );
}
