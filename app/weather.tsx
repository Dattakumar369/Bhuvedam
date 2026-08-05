import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  Card,
  DailyForecastCard,
  Header,
  HourlyForecastCard,
  SectionTitle,
  WeatherCard,
  WeatherSkeleton,
} from '@/components/ui';
import { AgricultureTipCard } from '@/features/weather/components/AgricultureTipCard';
import {
  LiveLocationBadge,
  LocationBanner,
} from '@/features/weather/components/LocationBanner';
import { WeatherMetricsGrid } from '@/features/weather/components/WeatherMetricsGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeather } from '@/hooks/useWeather';
import { formatPercentage, formatWindSpeed } from '@/utils/format';
import {
  getHourlyForDate,
  getTodayDateKey,
  hourlySectionTitle,
} from '@/utils/weatherForecast';
import { colors, layout, spacing } from '@/theme';
import { router } from 'expo-router';

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const { screens } = useTranslation();
  const { data, location, isLoading, error, lastFetched, load, refresh, retryWithLocation } =
    useWeather();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (data?.daily[0]?.date) {
      setSelectedDate(data.daily[0].date);
    }
  }, [data?.daily[0]?.date]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const activeDate = selectedDate ?? (data ? getTodayDateKey(data) : '');
  const selectedHourly = useMemo(
    () => (data ? getHourlyForDate(data, activeDate) : []),
    [data, activeDate],
  );
  const isTodaySelected = data ? activeDate === getTodayDateKey(data) : false;

  if (error && !data) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Header title={screens.weather} showBack onBack={() => router.back()} />
        <LocationBanner error={error} onRetry={retryWithLocation} />
      </View>
    );
  }

  const metrics = data
    ? [
        { icon: 'water-percent' as const, label: screens.humidity, value: formatPercentage(data.current.humidity) },
        { icon: 'weather-windy' as const, label: screens.windSpeed, value: formatWindSpeed(data.current.windSpeed) },
        { icon: 'gauge' as const, label: screens.pressure, value: `${data.current.pressure} hPa` },
        { icon: 'eye-outline' as const, label: screens.visibility, value: `${data.current.visibility} km` },
        { icon: 'white-balance-sunny' as const, label: screens.uvIndex, value: String(data.current.uvIndex) },
        { icon: 'weather-rainy' as const, label: screens.rainChance, value: formatPercentage(data.current.precipitation) },
      ]
    : [];

  return (
    <View style={styles.container}>
      <Header title={screens.weather} showBack onBack={() => router.back()} />
      {isLoading && !data ? (
        <WeatherSkeleton />
      ) : data ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.locationRow}>
            <LiveLocationBadge
              location={location?.label ?? data.location}
              lastUpdated={lastFetched}
            />
          </View>

          <WeatherCard data={data} />

          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
            <WeatherMetricsGrid metrics={metrics} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <SectionTitle
              title={data ? hourlySectionTitle(data, activeDate) : screens.hourlyForecast}
              subtitle="Swipe to see full day →"
            />
            <Card variant="elevated">
              <HourlyForecastCard
                data={selectedHourly}
                scrollToCurrentHour={isTodaySelected}
              />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <SectionTitle title={screens.forecast7Day} subtitle="Tap a day for hourly details" />
            <Card variant="elevated">
              <DailyForecastCard
                data={data.daily}
                selectedDate={activeDate}
                onSelectDay={setSelectedDate}
              />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
            <AgricultureTipCard tip={data.agricultureTip} />
          </Animated.View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center' },
  locationRow: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.lg,
  },
});
