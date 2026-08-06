import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  GradientHeader,
  QuickAction,
  SectionTitle,
  WeatherCard,
  WeatherSkeleton,
} from '@/components/ui';
import { Body, Caption } from '@/components/ui/Typography';
import { LiveLocationBadge } from '@/features/weather/components/LocationBanner';
import { FarmAlertsCard } from '@/features/alerts/FarmAlertsCard';
import { getLocalizedGreeting } from '@/constants/i18n/appTranslations';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppColors } from '@/hooks/useAppColors';
import { useWeather } from '@/hooks/useWeather';
import { useAIStore } from '@/store/aiStore';
import { useAlertStore } from '@/store/alertStore';
import { useUserStore } from '@/store/userStore';
import { truncate } from '@/utils/format';
import { colors, layout, radius, spacing } from '@/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const { app, language } = useTranslation();
  const user = useUserStore((s) => s.user);
  const { data, isLoading, load, location, lastFetched } = useWeather();
  const conversations = useAIStore((s) => s.conversations);
  const initializeConversations = useAIStore((s) => s.initializeConversations);
  const refreshAlerts = useAlertStore((s) => s.refreshAlerts);

  useEffect(() => {
    load();
    initializeConversations();
    void refreshAlerts({ force: true, notify: useAlertStore.getState().notificationsEnabled });
  }, [load, initializeConversations, refreshAlerts]);

  const firstName = user?.name?.split(' ')[0] ?? app.farmerDefault;
  const greeting = getLocalizedGreeting(language);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        title={`${greeting}, ${firstName}!`}
        subtitle={app.homeSubtitle}
      >
        <View style={styles.headerIllustration}>
          <MaterialCommunityIcons name="barley" size={64} color="rgba(255,255,255,0.3)" />
        </View>
      </GradientHeader>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.weatherSection}>
          {location ? (
            <LiveLocationBadge location={location.label} lastUpdated={lastFetched} />
          ) : null}
          {isLoading || !data ? (
            <WeatherSkeleton />
          ) : (
            <WeatherCard data={data} compact />
          )}
        </View>

        <FarmAlertsCard />

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <SectionTitle title={app.quickActions} />
          <View style={styles.actionsRow}>
            <QuickAction
              icon="robot-outline"
              label={app.askAi}
              color={colors.primary}
              onPress={() => router.push('/(tabs)/ai')}
            />
            <QuickAction
              icon="weather-partly-cloudy"
              label={app.weather}
              color={colors.info}
              onPress={() => router.push('/weather' as Href)}
            />
            <QuickAction
              icon="leaf"
              label={app.fertilizers}
              color="#388E3C"
              onPress={() => router.push('/fertilizers' as Href)}
            />
            <QuickAction
              icon="spray"
              label={app.pesticides}
              color="#1565C0"
              onPress={() => router.push('/pesticides' as Href)}
            />
            <QuickAction
              icon="water-opacity"
              label={app.fungicides}
              color="#E65100"
              onPress={() => router.push('/fungicides' as Href)}
            />
            <QuickAction
              icon="shield-bug-outline"
              label={app.sprayGuide}
              color="#7B1FA2"
              onPress={() => router.push('/crop-protection' as Href)}
            />
            <QuickAction
              icon="storefront-outline"
              label={app.mandiRates}
              color={colors.warning}
              onPress={() => router.push('/mandi-rates' as Href)}
            />
            <QuickAction
              icon="map-marker-radius"
              label={app.nearbyPlaces}
              color="#00897B"
              onPress={() => router.push('/nearby-places' as Href)}
            />
            <QuickAction
              icon="bank-outline"
              label={app.schemes}
              color="#1565C0"
              onPress={() => router.push('/pathakalu' as Href)}
            />
            <QuickAction
              icon="walk"
              label={app.fieldMeasure}
              color="#2E7D32"
              onPress={() => router.push('/measure-field' as Href)}
            />
            <QuickAction
              icon="sprout"
              label={app.cropGuide}
              color={colors.accent}
              onPress={() => router.push('/(tabs)/crop')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <SectionTitle
            title={app.recentChats}
            actionLabel={app.seeAll}
            onAction={() => router.push('/(tabs)/ai')}
          />
          {conversations.length === 0 ? (
            <Card variant="outlined">
              <Body style={styles.emptyChat}>{app.emptyChat}</Body>
            </Card>
          ) : (
            conversations.slice(0, 3).map((conv) => (
              <Pressable
                key={conv.id}
                onPress={() => router.push(`/(tabs)/ai/${conv.id}` as Href)}
                style={styles.chatItem}
              >
                <View style={styles.chatIcon}>
                  <MaterialCommunityIcons name="chat-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.chatContent}>
                  <Body style={styles.chatTitle} numberOfLines={1}>
                    {conv.title}
                  </Body>
                  <Caption numberOfLines={1}>
                    {truncate(conv.messages[conv.messages.length - 1]?.content ?? '', 50)}
                  </Caption>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textTertiary}
                />
              </Pressable>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerIllustration: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    marginTop: -spacing.xl,
    gap: spacing.xl,
  },
  weatherSection: { marginTop: spacing.sm },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  emptyChat: { textAlign: 'center', color: colors.textSecondary },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: { flex: 1 },
  chatTitle: { fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
});
