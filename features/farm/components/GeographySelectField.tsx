import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BottomSheet, SearchInput } from '@/components/ui';
import { Body, Caption, Label } from '@/components/ui/Typography';
import type { GeographyOption } from '@/constants/geography/types';
import { colors, radius, spacing } from '@/theme';

interface GeographySelectFieldProps {
  label: string;
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  options: GeographyOption[];
  disabled?: boolean;
  emptyMessage?: string;
  onSelect: (option: GeographyOption) => void;
}

export function GeographySelectField({
  label,
  value,
  placeholder,
  searchPlaceholder,
  options,
  disabled = false,
  emptyMessage = 'No options',
  onSelect,
}: GeographySelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.value} ${o.nativeLabel ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  const openSheet = () => {
    if (disabled) return;
    setQuery('');
    setOpen(true);
  };

  return (
    <>
      <View style={styles.wrap}>
        <Label style={styles.label}>{label}</Label>
        <Pressable
          onPress={openSheet}
          disabled={disabled}
          style={[styles.field, disabled && styles.fieldDisabled, value ? styles.fieldFilled : null]}
        >
          <Body style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
            {value || placeholder}
          </Body>
          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color={disabled ? colors.textTertiary : colors.primary}
          />
        </Pressable>
      </View>

      <BottomSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title={label}
      >
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
        />
        {options.length === 0 ? (
          <Caption style={styles.empty}>{emptyMessage}</Caption>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => `${item.code}-${item.value}`}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Caption style={styles.empty}>{emptyMessage}</Caption>
            }
            renderItem={({ item }) => {
              const selected = item.value === value || item.label === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  style={[styles.row, selected && styles.rowSelected]}
                >
                  <View style={styles.rowText}>
                    <Body style={styles.rowLabel}>{item.label}</Body>
                    {item.nativeLabel && item.nativeLabel !== item.label ? (
                      <Caption>{item.nativeLabel}</Caption>
                    ) : item.label !== item.value ? (
                      <Caption>{item.value}</Caption>
                    ) : null}
                  </View>
                  {selected ? (
                    <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textSecondary, fontSize: 13 },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  fieldFilled: { borderColor: `${colors.primary}55` },
  fieldDisabled: { opacity: 0.55, backgroundColor: colors.background },
  value: { flex: 1, color: colors.textPrimary },
  placeholder: { color: colors.textTertiary },
  list: { maxHeight: 360, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rowSelected: { backgroundColor: `${colors.primary}10` },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15 },
  empty: {
    textAlign: 'center',
    color: colors.textTertiary,
    paddingVertical: spacing.lg,
  },
});
