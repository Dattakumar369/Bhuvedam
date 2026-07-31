import { StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Headline } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onDismiss, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.sheet,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.handle} />
        {title ? <Headline style={styles.title}>{title}</Headline> : null}
        {children}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    marginTop: 'auto',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.md },
});
