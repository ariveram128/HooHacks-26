import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sabio_practice_progress';

export type PracticeProgress = {
  masteredPhrases: string[];
  currentStreak: number;
  bestStreak: number;
  colorGameHighScore: number;
};

const DEFAULT: PracticeProgress = {
  masteredPhrases: [],
  currentStreak: 0,
  bestStreak: 0,
  colorGameHighScore: 0,
};

async function read(): Promise<PracticeProgress> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : { ...DEFAULT };
}

async function persist(p: PracticeProgress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
}

export async function getProgress(): Promise<PracticeProgress> {
  return read();
}

export async function masterPhrase(phraseId: string): Promise<void> {
  const p = await read();
  if (!p.masteredPhrases.includes(phraseId)) {
    p.masteredPhrases.push(phraseId);
    await persist(p);
  }
}

export async function updateStreak(correct: boolean): Promise<PracticeProgress> {
  const p = await read();
  if (correct) {
    p.currentStreak += 1;
    if (p.currentStreak > p.bestStreak) {
      p.bestStreak = p.currentStreak;
    }
  } else {
    p.currentStreak = 0;
  }
  await persist(p);
  return p;
}

export async function setHighScore(score: number): Promise<void> {
  const p = await read();
  if (score > p.colorGameHighScore) {
    p.colorGameHighScore = score;
    await persist(p);
  }
}
