import React from 'react';
import { Text, View } from 'react-native';

export default function DashboardScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', marginTop: 40, backgroundColor: '#FFFFFF' }}>
            <View style={{ alignItems: 'center', margin: 10 }}>
                <Text> DASHBOARD</Text>
            </View>
        </View>
    );

}
