import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Title } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface AgricultureTipCardProps {
  tip: string;
}

export function AgricultureTipCard({ tip }: AgricultureTipCardProps) {
  return (
    <Card variant="filled" animate delay={400}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="sprout" size={24} color={colors.primary} />
        </View>
        <Title style={styles.title}>Agriculture Recommendation</Title>
      </View>
      <Body style={styles.tip}>{tip}</Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16 },
  tip: { color: colors.textSecondary, lineHeight: 22 },
});
