import { StyleSheet, View } from 'react-native';
import { Portal, Modal as PaperModal } from 'react-native-paper';

import { Headline } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface AppModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
}

export function AppModal({ visible, onDismiss, title, children }: AppModalProps) {
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        {title ? <Headline style={styles.title}>{title}</Headline> : null}
        <View>{children}</View>
      </PaperModal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  title: { marginBottom: spacing.md },
});
