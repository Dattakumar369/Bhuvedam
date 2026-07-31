import React, { useEffect, useState } from 'react';
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
import { useWeather } from '@/hooks/useWeather';
import { formatPercentage, formatWindSpeed } from '@/utils/format';
import { colors, layout, spacing } from '@/theme';
import { router } from 'expo-router';

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const { data, location, isLoading, error, lastFetched, load, refresh, retryWithLocation } =
    useWeather();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (error && !data) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Header title="Weather" showBack onBack={() => router.back()} />
        <LocationBanner error={error} onRetry={retryWithLocation} />
      </View>
    );
  }

  const metrics = data
    ? [
        { icon: 'water-percent' as const, label: 'Humidity', value: formatPercentage(data.current.humidity) },
        { icon: 'weather-windy' as const, label: 'Wind Speed', value: formatWindSpeed(data.current.windSpeed) },
        { icon: 'gauge' as const, label: 'Pressure', value: `${data.current.pressure} hPa` },
        { icon: 'eye-outline' as const, label: 'Visibility', value: `${data.current.visibility} km` },
        { icon: 'white-balance-sunny' as const, label: 'UV Index', value: String(data.current.uvIndex) },
        { icon: 'weather-rainy' as const, label: 'Rain Chance', value: formatPercentage(data.current.precipitation) },
      ]
    : [];

  return (
    <View style={styles.container}>
      <Header title="Weather" showBack onBack={() => router.back()} />
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
            <SectionTitle title="Hourly Forecast" />
            <Card variant="elevated">
              <HourlyForecastCard data={data.hourly} />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <SectionTitle title="7-Day Forecast" />
            <Card variant="elevated">
              <DailyForecastCard data={data.daily} />
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
