import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@sabio_notes';

export type NoteItem = {
  id: string;
  type: 'translation' | 'explanation' | 'custom';
  originalText: string;
  translatedText?: string;
  createdAt: number;
};

async function readAll(): Promise<NoteItem[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function persist(notes: NoteItem[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function getNotes(): Promise<NoteItem[]> {
  return readAll();
}

export async function addNote(
  note: Omit<NoteItem, 'id' | 'createdAt'>
): Promise<NoteItem> {
  const notes = await readAll();
  const newNote: NoteItem = {
    ...note,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  notes.unshift(newNote);
  await persist(notes);
  return newNote;
}

export async function removeNote(id: string): Promise<void> {
  const notes = await readAll();
  await persist(notes.filter((n) => n.id !== id));
}

export async function findNoteByOriginal(
  originalText: string
): Promise<NoteItem | undefined> {
  const notes = await readAll();
  return notes.find(
    (n) => n.originalText.toLowerCase() === originalText.toLowerCase()
  );
}

export async function toggleNote(
  note: Omit<NoteItem, 'id' | 'createdAt'>
): Promise<{ saved: boolean; note?: NoteItem }> {
  const existing = await findNoteByOriginal(note.originalText);
  if (existing) {
    await removeNote(existing.id);
    return { saved: false };
  }
  const saved = await addNote(note);
  return { saved: true, note: saved };
}
