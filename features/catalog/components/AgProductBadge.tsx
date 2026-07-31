import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Caption, Label, Title } from '@/components/ui/Typography';
import type { AgCatalogType } from '@/types/agCatalogProduct';
import { colors, radius } from '@/theme';

const ICON_BY_TYPE: Record<AgCatalogType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  fertilizer: 'leaf',
  pesticide: 'spray',
  fungicide: 'water-opacity',
};

const PALETTE = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F', '#C62828', '#4527A0', '#558B2F'];

function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length]!;
}

function shortLabel(name: string): string {
  const first = name.split(/[\s(]/)[0] ?? name;
  return first.length > 14 ? `${first.slice(0, 12)}…` : first;
}

interface AgProductBadgeProps {
  type: AgCatalogType;
  name: string;
  subtitle?: string | null;
  dose?: string | null;
  size?: 'card' | 'detail';
}

/** Honest product visual — unique color + name/dose, no fake stock photos */
export function AgProductBadge({ type, name, subtitle, dose, size = 'card' }: AgProductBadgeProps) {
  const bg = colorForKey(name);
  const isDetail = size === 'detail';

  return (
    <View style={[styles.wrap, isDetail && styles.wrapDetail, { backgroundColor: `${bg}18` }]}>
      <View style={[styles.accent, { backgroundColor: bg }]} />
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={ICON_BY_TYPE[type]}
          size={isDetail ? 28 : 22}
          color={bg}
          style={styles.icon}
        />
        <Title style={[styles.title, isDetail && styles.titleDetail, { color: bg }]} numberOfLines={2}>
          {shortLabel(name)}
        </Title>
        {subtitle ? (
          <Caption style={styles.subtitle} numberOfLines={isDetail ? 3 : 2}>
            {subtitle}
          </Caption>
        ) : null}
        {dose ? <Label style={[styles.dose, { color: bg }]} numberOfLines={1}>{dose}</Label> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 96,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  wrapDetail: {
    height: 180,
    borderRadius: radius.lg,
  },
  accent: { width: 5 },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    gap: 2,
  },
  icon: { marginBottom: 2 },
  title: { fontSize: 13, lineHeight: 16 },
  titleDetail: { fontSize: 18, lineHeight: 22 },
  subtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 13 },
  dose: { fontSize: 10, marginTop: 2 },
});
