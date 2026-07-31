import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { Caption, Label, Subtitle } from '@/components/ui/Typography';
import { WEATHER_CONDITIONS } from '@/constants/weather';
import type { DailyForecast, HourlyForecast } from '@/types/weather';
import { formatTemperature } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

interface HourlyForecastCardProps {
  data: HourlyForecast[];
}

export function HourlyForecastCard({ data }: HourlyForecastCardProps) {
  return (
    <View style={styles.hourlyContainer}>
      {data.map((item, index) => {
        const condition = WEATHER_CONDITIONS[item.condition];
        return (
          <Animated.View
            key={item.time}
            entering={FadeInRight.delay(index * 80).springify()}
            style={styles.hourlyItem}
          >
            <Caption>{item.time}</Caption>
            <MaterialCommunityIcons
              name={(condition?.icon ?? 'weather-partly-cloudy') as never}
              size={28}
              color={colors.primary}
            />
            <Subtitle>{formatTemperature(item.temperature)}</Subtitle>
            <Caption style={styles.precip}>{item.precipitation}%</Caption>
          </Animated.View>
        );
      })}
    </View>
  );
}

interface DailyForecastCardProps {
  data: DailyForecast[];
}

export function DailyForecastCard({ data }: DailyForecastCardProps) {
  return (
    <View style={styles.dailyContainer}>
      {data.map((item, index) => {
        const condition = WEATHER_CONDITIONS[item.condition];
        return (
          <Animated.View
            key={item.date}
            entering={FadeInRight.delay(index * 60).springify()}
            style={styles.dailyRow}
          >
            <Label style={styles.dayLabel}>{item.day}</Label>
            <MaterialCommunityIcons
              name={(condition?.icon ?? 'weather-partly-cloudy') as never}
              size={24}
              color={colors.textSecondary}
            />
            <Caption style={styles.precipSmall}>{item.precipitation}%</Caption>
            <View style={styles.tempRange}>
              <Subtitle>{formatTemperature(item.high)}</Subtitle>
              <Caption style={styles.lowTemp}>{formatTemperature(item.low)}</Caption>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hourlyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourlyItem: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    minWidth: 64,
  },
  precip: { color: colors.info, fontSize: 10 },
  dailyContainer: { gap: spacing.sm },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  dayLabel: { width: 40 },
  precipSmall: { width: 32, color: colors.info },
  tempRange: { flexDirection: 'row', gap: spacing.sm, marginLeft: 'auto' },
  lowTemp: { color: colors.textTertiary },
});
