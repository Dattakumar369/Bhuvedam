import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, GradientHeader, SearchInput } from '@/components/ui';
import { ConversationListItem } from '@/features/ai/components/ConversationListItem';
import { useTranslation } from '@/hooks/useTranslation';
import { useAIStore } from '@/store/aiStore';
import { colors, layout, spacing } from '@/theme';

export default function AIListScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const conversations = useAIStore((s) => s.conversations);
  const createConversation = useAIStore((s) => s.createConversation);
  const initializeConversations = useAIStore((s) => s.initializeConversations);
  const hydrate = useAIStore((s) => s.hydrate);

  useFocusEffect(
    useCallback(() => {
      void hydrate();
      initializeConversations();
    }, [hydrate, initializeConversations]),
  );

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleNewChat = () => {
    const id = createConversation();
    router.push(`/(tabs)/ai/${id}` as Href);
  };

  return (
    <View style={styles.container}>
      <GradientHeader title={t.aiAssistantTitle} subtitle={t.aiAssistantSubtitle}>
        <Pressable style={styles.newChatFab} onPress={handleNewChat} accessibilityLabel={t.startNewChat}>
          <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
        </Pressable>
      </GradientHeader>

      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <SearchInput value={search} onChangeText={setSearch} placeholder={t.searchConversations} />

        {filtered.length === 0 ? (
          <EmptyState
            icon="robot-outline"
            title={t.noConversationsTitle}
            description={t.noConversationsDesc}
            actionLabel={t.startNewChat}
            onAction={handleNewChat}
          />
        ) : (
          <FlashList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationListItem
                conversation={item}
                onPress={() => router.push(`/(tabs)/ai/${item.id}` as Href)}
              />
            )}
            contentContainerStyle={{ paddingTop: spacing.md }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    marginTop: -spacing.lg,
  },
  newChatFab: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
