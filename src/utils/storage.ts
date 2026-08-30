import AsyncStorage from '@react-native-async-storage/async-storage';

const LEARNER_NAME_KEY = 'learnerName';

export async function getLearnerName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LEARNER_NAME_KEY);
  } catch {
    return null;
  }
}

export async function saveLearnerName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LEARNER_NAME_KEY, name);
  } catch {
    // Ignore storage errors; the name simply won't persist this session.
  }
}

export interface SetProgress {
  bestScore: number;
  bestTotal: number;
  lastScore: number;
  lastTotal: number;
  attempts: number;
  updatedAt: number;
}

function progressKey(gradeKey: string, termKey: string, subjectKey: string, setKey: string) {
  return `progress:${gradeKey}:${termKey}:${subjectKey}:${setKey}`;
}

export async function getSetProgress(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKey: string
): Promise<SetProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(progressKey(gradeKey, termKey, subjectKey, setKey));
    return raw ? (JSON.parse(raw) as SetProgress) : null;
  } catch {
    return null;
  }
}

export async function saveSetResult(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKey: string,
  score: number,
  total: number
): Promise<SetProgress> {
  const existing = await getSetProgress(gradeKey, termKey, subjectKey, setKey);
  const nextBest =
    !existing || score / total > existing.bestScore / existing.bestTotal
      ? { bestScore: score, bestTotal: total }
      : { bestScore: existing.bestScore, bestTotal: existing.bestTotal };

  const updated: SetProgress = {
    ...nextBest,
    lastScore: score,
    lastTotal: total,
    attempts: (existing?.attempts ?? 0) + 1,
    updatedAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(
      progressKey(gradeKey, termKey, subjectKey, setKey),
      JSON.stringify(updated)
    );
  } catch {
    // Ignore storage errors; progress simply won't persist this session.
  }

  return updated;
}

export async function getSetProgressForSubject(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKeys: string[]
): Promise<Record<string, SetProgress | null>> {
  const entries = await Promise.all(
    setKeys.map(
      async (setKey) => [setKey, await getSetProgress(gradeKey, termKey, subjectKey, setKey)] as const
    )
  );
  return Object.fromEntries(entries);
}
