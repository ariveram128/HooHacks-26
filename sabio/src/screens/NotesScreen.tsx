import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, fonts } from '../theme';
import { CloseIcon, TrashIcon, PlusIcon } from '../components/Icons';
import { getNotes, addNote, removeNote, NoteItem } from '../store/notes';

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [customText, setCustomText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    const items = await getNotes();
    setNotes(items);
  };

  const handleAdd = async () => {
    const text = customText.trim();
    if (!text) return;
    await addNote({ type: 'custom', originalText: text });
    setCustomText('');
    loadNotes();
  };

  const handleDelete = async (id: string) => {
    await removeNote(id);
    loadNotes();
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const typeLabel = (type: NoteItem['type']) => {
    switch (type) {
      case 'translation':
        return '🇪🇸  Translation';
      case 'explanation':
        return '💡  Explanation';
      case 'custom':
        return '✏️  Note';
    }
  };

  const renderNote = ({ item }: { item: NoteItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{typeLabel(item.type)}</Text>
        <Pressable onPress={() => handleDelete(item.id)} hitSlop={12}>
          <TrashIcon size={16} color={colors.warmGrayLight} />
        </Pressable>
      </View>
      <Text style={styles.cardOriginal}>{item.originalText}</Text>
      {item.translatedText && (
        <Text style={styles.cardTranslation}>→ {item.translatedText}</Text>
      )}
      <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <CloseIcon size={22} color={colors.charcoal} />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Save translations and explanations from Dillow by tapping them, or write
        your own notes below.
      </Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptyText}>
                Save translations or explanations from Dillow by tapping them
                during your conversation.
              </Text>
            </View>
          }
        />

        <View style={[styles.addRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.addInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Write a note..."
            placeholderTextColor={colors.warmGrayLight}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            blurOnSubmit
          />
          <Pressable
            onPress={handleAdd}
            style={[styles.addBtn, !customText.trim() && styles.addBtnDisabled]}
            disabled={!customText.trim()}
          >
            <PlusIcon size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.warmGray,
    paddingHorizontal: 20,
    marginBottom: 12,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.creamLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.creamDark,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardOriginal: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.charcoal,
    lineHeight: 22,
  },
  cardTranslation: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.teal,
    marginTop: 4,
  },
  cardTime: {
    fontFamily: fonts.light,
    fontSize: 11,
    color: colors.warmGrayLight,
    marginTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.charcoal,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
    backgroundColor: colors.cream,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.creamLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.creamDark,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: colors.warmGrayLight },
});
