import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Label } from '@/components/ui/Typography';
import { getUnreadAlerts, useAlertStore } from '@/store/alertStore';
import { colors, radius, spacing } from '@/theme';

function severityColor(severity: string): string {
  if (severity === 'urgent') return colors.error;
  if (severity === 'warning') return colors.accent;
  return colors.info;
}

export function FarmAlertsCard() {
  const alerts = useAlertStore((s) => s.alerts);
  const markRead = useAlertStore((s) => s.markRead);
  const markAllRead = useAlertStore((s) => s.markAllRead);
  const unread = getUnreadAlerts(alerts);

  if (!unread.length) return null;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="bell-ring-outline" size={20} color={colors.primary} />
        <Label style={styles.headerTitle}>Farm alerts</Label>
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Caption style={styles.markAll}>Mark all read</Caption>
        </Pressable>
      </View>

      {unread.map((alert) => (
        <Pressable
          key={alert.id}
          onPress={() => markRead(alert.id)}
          style={styles.row}
        >
          <View style={[styles.dot, { backgroundColor: severityColor(alert.severity) }]} />
          <View style={styles.rowText}>
            <Body style={styles.title}>{alert.title}</Body>
            <Caption style={styles.body}>{alert.body}</Caption>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { flex: 1, color: colors.primary },
  markAll: { color: colors.textTertiary, fontSize: 11 },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  rowText: { flex: 1 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  body: { color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
});
