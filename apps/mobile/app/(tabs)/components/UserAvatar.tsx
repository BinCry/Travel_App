import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, View } from 'react-native';
import { colors } from '../common/colors';

type UserAvatarProps = {
  uri?: string | null;
  size: number;
  borderWidth?: number;
  borderColor?: string;
  iconSize?: number;
};

export default function UserAvatar({
  uri,
  size,
  borderWidth = 0,
  borderColor = colors.borderLight,
  iconSize,
}: UserAvatarProps) {
  const avatarSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  } as const;

  if (uri) {
    return (
      <Image
        testID="user-avatar-image"
        source={{ uri }}
        style={[
          avatarSize,
          {
            borderWidth,
            borderColor,
          },
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      testID="user-avatar-fallback"
      style={[
        avatarSize,
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primaryLight,
          borderWidth,
          borderColor,
        },
      ]}>
      <Ionicons
        name="person"
        size={iconSize ?? Math.max(20, Math.round(size * 0.44))}
        color={colors.primary}
      />
    </View>
  );
}
