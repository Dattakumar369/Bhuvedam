import { StyleSheet, View } from 'react-native';
import { Portal, Modal } from 'react-native-paper';

import { Headline, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/theme';

interface AppDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function AppDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: AppDialogProps) {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onCancel} contentContainerStyle={styles.container}>
        <Headline>{title}</Headline>
        <Body style={styles.message}>{message}</Body>
        <View style={styles.actions}>
          <Button label={cancelLabel} onPress={onCancel} variant="ghost" />
          <Button
            label={confirmLabel}
            onPress={onConfirm}
            variant={destructive ? 'secondary' : 'primary'}
          />
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  message: { marginVertical: spacing.md, color: colors.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
