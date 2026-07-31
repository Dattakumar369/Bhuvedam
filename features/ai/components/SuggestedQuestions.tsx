import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui';
import { Caption } from '@/components/ui/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing } from '@/theme';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.wrapper}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Caption style={styles.hint}>{t.topicPickerHint}</Caption>
      {t.aiTopicCategories.map((category) => (
        <View key={category.title} style={styles.section}>
          <Caption style={styles.sectionTitle}>{category.title}</Caption>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {category.questions.map((question) => (
              <Chip key={question} label={question} onPress={() => onSelect(question)} />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { maxHeight: 220 },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  section: { gap: spacing.xs },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: colors.textPrimary,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
});
