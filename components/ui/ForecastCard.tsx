import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useEffect, useRef } from 'react';

import { Caption, Label, Subtitle } from '@/components/ui/Typography';
import { WEATHER_CONDITIONS } from '@/constants/weather';
import type { DailyForecast, HourlyForecast } from '@/types/weather';
import { formatTemperature } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

const HOURLY_ITEM_WIDTH = 72;

interface HourlyForecastCardProps {
  data: HourlyForecast[];
  scrollToCurrentHour?: boolean;
}

export function HourlyForecastCard({ data, scrollToCurrentHour = false }: HourlyForecastCardProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!scrollToCurrentHour || !data.length) return;

    const nowHour = new Date().getHours();
    const idx = data.findIndex(
      (item) => item.isoTime && new Date(item.isoTime).getHours() === nowHour,
    );
    if (idx <= 0) return;

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: idx * HOURLY_ITEM_WIDTH, animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [data, scrollToCurrentHour]);

  if (!data.length) {
    return (
      <Caption style={styles.emptyHint}>Hourly forecast not available for this day.</Caption>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hourlyScrollContent}
      decelerationRate="fast"
    >
      {data.map((item, index) => {
        const condition = WEATHER_CONDITIONS[item.condition];
        const key = item.isoTime ?? `${item.time}-${index}`;
        return (
          <Animated.View
            key={key}
            entering={FadeInRight.delay(Math.min(index, 8) * 40).springify()}
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
    </ScrollView>
  );
}

interface DailyForecastCardProps {
  data: DailyForecast[];
  selectedDate?: string;
  onSelectDay?: (date: string) => void;
}

export function DailyForecastCard({ data, selectedDate, onSelectDay }: DailyForecastCardProps) {
  const todayKey = data[0]?.date;

  return (
    <View style={styles.dailyContainer}>
      {data.map((item) => {
        const condition = WEATHER_CONDITIONS[item.condition];
        const isSelected = selectedDate === item.date;
        const isToday = item.date === todayKey;

        return (
          <Pressable
            key={item.date}
            onPress={() => onSelectDay?.(item.date)}
            style={({ pressed }) => [
              styles.dailyRow,
              isSelected && styles.dailyRowSelected,
              pressed && styles.dailyRowPressed,
            ]}
          >
            <View style={styles.dayCol}>
              <Label style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                {isToday ? 'Today' : item.day}
              </Label>
              <Caption style={styles.dateLabel}>{item.dateLabel}</Caption>
            </View>
            <MaterialCommunityIcons
              name={(condition?.icon ?? 'weather-partly-cloudy') as never}
              size={24}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
            <Caption style={styles.precipSmall}>{item.precipitation}%</Caption>
            <View style={styles.tempRange}>
              <Subtitle>{formatTemperature(item.high)}</Subtitle>
              <Caption style={styles.lowTemp}>{formatTemperature(item.low)}</Caption>
            </View>
            {onSelectDay ? (
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={isSelected ? colors.primary : colors.textTertiary}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hourlyScrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  hourlyItem: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    width: HOURLY_ITEM_WIDTH,
  },
  emptyHint: {
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  precip: { color: colors.info, fontSize: 10 },
  dailyContainer: { gap: spacing.xs },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  dailyRowSelected: {
    backgroundColor: colors.primary + '12',
    borderBottomColor: colors.primary + '30',
  },
  dailyRowPressed: { opacity: 0.85 },
  dayCol: { width: 56 },
  dayLabel: { fontWeight: '600' },
  dayLabelSelected: { color: colors.primary },
  dateLabel: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  precipSmall: { width: 32, color: colors.info },
  tempRange: { flexDirection: 'row', gap: spacing.sm, marginLeft: 'auto' },
  lowTemp: { color: colors.textTertiary },
});
