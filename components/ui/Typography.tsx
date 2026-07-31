import { Text, TextProps } from 'react-native';

import { useAppColors } from '@/hooks/useAppColors';
import { typography, TypographyVariant } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

export function AppText({ variant = 'body', color, style, ...props }: AppTextProps) {
  const c = useAppColors();
  const defaultColor =
    variant === 'caption' || variant === 'subtitle' ? c.textSecondary : c.textPrimary;

  return (
    <Text
      {...props}
      style={[typography[variant], { color: color ?? defaultColor }, style]}
    />
  );
}

export const Display = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="display" {...props} />
);
export const Headline = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="headline" {...props} />
);
export const Title = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="title" {...props} />
);
export const Subtitle = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="subtitle" {...props} />
);
export const Body = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="body" {...props} />
);
export const Caption = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="caption" {...props} />
);
export const Label = (props: Omit<AppTextProps, 'variant'>) => (
  <AppText variant="label" {...props} />
);
