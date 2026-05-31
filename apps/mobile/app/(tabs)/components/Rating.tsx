import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../common/colors';
import type { ReviewListItem } from '../../../lib/api/types';

const BAR_COLOR = '#E0F0F7';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const RatingStartBar = ({ ratingValue, size }: { ratingValue: number; size: number }) => {
  return (
    <View style={{ flexDirection: 'row', marginLeft: 5 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        let iconName: IoniconName = "star-outline";

        if (ratingValue >= star - 0.2) {
          iconName = "star";
        } else if (ratingValue >= star - 0.6) {
          iconName = "star-half";
        }

        return (
          <Ionicons
            key={star}
            name={iconName}
            size={size}
            color='#FFD700'
          />
        );
      })}
    </View>
  );
};

export const RatingBar = ({ stars, percentage }: { stars: number, percentage: number }) => {
  return (
    <View style={ratingBarStyles.barRowContainer}>
      <View style={ratingBarStyles.starContainer}>
        <Text style={ratingBarStyles.starText}>{stars}</Text>
      </View>

      <View style={ratingBarStyles.progressTrack}>
        <View
          style={[
            ratingBarStyles.progressFilled,
            { width: `${percentage}%` }
          ]}
        />
      </View>

      <View style={ratingBarStyles.percentageContainer}>
        <Text numberOfLines={1} style={ratingBarStyles.percentageText}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

export const ratingBarStyles = StyleSheet.create({
  mainContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  barRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  starContainer: {
    width: 20,
    alignItems: 'flex-start',
    marginRight: 10,
  },
  starText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BAR_COLOR,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    backgroundColor: BAR_COLOR,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 15,
  },
  progressFilled: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  percentageContainer: {
    width: 44,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  percentageText: {
    fontSize: 14,
    color: BAR_COLOR,
    textAlign: 'right',
  },
});

export const calculateRatingStats = (data: ReviewListItem[]) => {
  const totalReviews = data.length;

  const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  data.forEach(item => {
    if (counts[item.rating] !== undefined) {
      counts[item.rating]++;
    }
  });

  const stats = [5, 4, 3, 2, 1].map(star => {
    const count = counts[star];
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    return {
      stars: star,
      percentage: Math.round(percentage)
    };
  });

  return stats;
};
