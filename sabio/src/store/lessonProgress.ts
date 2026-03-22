import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@sabio_lesson_progress';

export type LessonProgress = {
  completedLessons: string[];
  lastViewedLessonId: string | null;
};

const DEFAULT_PROGRESS: LessonProgress = {
  completedLessons: [],
  lastViewedLessonId: null,
};

async function read(): Promise<LessonProgress> {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  return raw ? JSON.parse(raw) : { ...DEFAULT_PROGRESS };
}

async function persist(progress: LessonProgress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function getProgress(): Promise<LessonProgress> {
  return read();
}

export async function completeLesson(lessonId: string): Promise<void> {
  const progress = await read();
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    await persist(progress);
  }
}

export async function setLastViewed(lessonId: string): Promise<void> {
  const progress = await read();
  progress.lastViewedLessonId = lessonId;
  await persist(progress);
}

export async function isCompleted(lessonId: string): Promise<boolean> {
  const progress = await read();
  return progress.completedLessons.includes(lessonId);
}
