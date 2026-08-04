import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { BhuvedamSplashAnimation, SPLASH_MIN_DURATION_MS } from '@/components/brand/BhuvedamSplashAnimation';
import { colors } from '@/theme';

export { SPLASH_MIN_DURATION_MS };

export function SplashScreen() {
  return (
    <LinearGradient colors={[...colors.gradient.header]} style={styles.container}>
      <View style={styles.content}>
        <BhuvedamSplashAnimation />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', justifyContent: 'center', width: '100%' },
});
