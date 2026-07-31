import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import type { VarietyEntry } from '@/constants/cropVarieties';
import { searchVarietyList } from '@/constants/cropVarieties';
import { colors, radius, spacing } from '@/theme';

interface VarietyPickerProps {
  varieties: VarietyEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  liveVarietyIds?: Set<string>;
  search: string;
}

const PREVIEW_LIMIT = 40;

export function VarietyPicker({
  varieties,
  selectedId,
  onSelect,
  liveVarietyIds,
  search,
}: VarietyPickerProps) {
  const filtered = useMemo(() => searchVarietyList(varieties, search), [varieties, search]);
  const isSearching = search.trim().length > 0;
  const visible = isSearching ? filtered : filtered.slice(0, PREVIEW_LIMIT);
  const truncated = !isSearching && filtered.length > PREVIEW_LIMIT;

  return (
    <View style={styles.wrap}>
      <Caption style={styles.count}>
        {filtered.length} varieties {varieties.length !== filtered.length ? `(filtered from ${varieties.length})` : ''}
        {liveVarietyIds?.size ? ` · ${liveVarietyIds.size} live from Agmarknet` : ''}
      </Caption>

      <View style={styles.list}>
        {visible.map((item) => {
          const selected = selectedId === item.id;
          const hasLive = liveVarietyIds?.has(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[styles.row, selected && styles.rowSelected]}
            >
              <View style={styles.rowText}>
                <Caption style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
                  {item.name}
                </Caption>
                {item.isCurated ? (
                  <Caption style={styles.badgeCurated}>Full guide</Caption>
                ) : (
                  <Caption style={styles.badgeLive}>{hasLive ? 'Live rate' : 'Agmarknet'}</Caption>
                )}
              </View>
            </Pressable>
          );
        })}
        {truncated ? (
          <Caption style={styles.hint}>
            Showing first {PREVIEW_LIMIT} of {filtered.length}. Search above to find more varieties.
          </Caption>
        ) : null}
        {!visible.length ? (
          <Caption style={styles.empty}>No varieties match your search.</Caption>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  count: { color: colors.textTertiary },
  list: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowSelected: { backgroundColor: `${colors.primary}12` },
  rowText: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1, fontFamily: 'Poppins_500Medium' },
  nameSelected: { color: colors.primary },
  badgeCurated: { color: colors.success, fontSize: 10 },
  badgeLive: { color: colors.info, fontSize: 10 },
  hint: { padding: spacing.md, color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center' },
  empty: { padding: spacing.lg, textAlign: 'center', color: colors.textTertiary },
});
