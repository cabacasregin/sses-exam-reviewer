import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubjectProgress {
  bestScore: number;
  bestTotal: number;
  lastScore: number;
  lastTotal: number;
  attempts: number;
  updatedAt: number;
}

function progressKey(gradeKey: string, termKey: string, subjectKey: string) {
  return `progress:${gradeKey}:${termKey}:${subjectKey}`;
}

export async function getSubjectProgress(
  gradeKey: string,
  termKey: string,
  subjectKey: string
): Promise<SubjectProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(progressKey(gradeKey, termKey, subjectKey));
    return raw ? (JSON.parse(raw) as SubjectProgress) : null;
  } catch {
    return null;
  }
}

export async function saveSubjectResult(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  score: number,
  total: number
): Promise<SubjectProgress> {
  const existing = await getSubjectProgress(gradeKey, termKey, subjectKey);
  const nextBest =
    !existing || score / total > existing.bestScore / existing.bestTotal
      ? { bestScore: score, bestTotal: total }
      : { bestScore: existing.bestScore, bestTotal: existing.bestTotal };

  const updated: SubjectProgress = {
    ...nextBest,
    lastScore: score,
    lastTotal: total,
    attempts: (existing?.attempts ?? 0) + 1,
    updatedAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(
      progressKey(gradeKey, termKey, subjectKey),
      JSON.stringify(updated)
    );
  } catch {
    // Ignore storage errors; progress simply won't persist this session.
  }

  return updated;
}

export async function getAllProgressForTerm(
  gradeKey: string,
  termKey: string,
  subjectKeys: string[]
): Promise<Record<string, SubjectProgress | null>> {
  const entries = await Promise.all(
    subjectKeys.map(async (key) => [key, await getSubjectProgress(gradeKey, termKey, key)] as const)
  );
  return Object.fromEntries(entries);
}
