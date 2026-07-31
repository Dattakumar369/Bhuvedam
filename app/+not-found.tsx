import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, EmptyState } from '@/components/ui';
import { colors } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <EmptyState
          icon="map-marker-question"
          title="Page Not Found"
          description="The page you're looking for doesn't exist."
          actionLabel="Go Home"
          onAction={() => router.replace('/(tabs)')}
        />
        <Button
          label="Back to Home"
          onPress={() => router.replace('/(tabs)')}
          variant="outline"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
});
