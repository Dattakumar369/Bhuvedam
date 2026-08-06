import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface MapErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage: string;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

/** Catches MapLibre native crashes and keeps polam koluvu usable. */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Map native failures — GPS walk can continue without satellite tiles.
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Caption style={styles.text}>{this.props.fallbackMessage}</Caption>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    height: 280,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: `${colors.warning}12`,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  text: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
