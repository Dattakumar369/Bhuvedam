import Markdown from 'react-native-markdown-display';
import { StyleSheet } from 'react-native';

import { colors, fontFamily } from '@/theme';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return <Markdown style={markdownStyles}>{content}</Markdown>;
}

const markdownStyles = StyleSheet.create({
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  heading1: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  heading2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  strong: {
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
  },
  bullet_list: { marginVertical: 4 },
  ordered_list: { marginVertical: 4 },
  list_item: { marginVertical: 2 },
  paragraph: { marginVertical: 4 },
  link: { color: colors.primary },
  code_inline: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: fontFamily.medium,
  },
});
