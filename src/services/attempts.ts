import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import {
  AttemptAnswer,
  AttemptDoc,
  ProgressDoc,
  UserDoc,
  progressIdOf,
  setIdOf,
  subjectPathOf,
} from './types';

export async function recordAttempt(
  learnerUid: string,
  learnerName: string,
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKey: string,
  score: number,
  total: number,
  answers: AttemptAnswer[]
): Promise<ProgressDoc> {
  const subjectPath = subjectPathOf(gradeKey, termKey, subjectKey);
  const setId = setIdOf(gradeKey, termKey, subjectKey, setKey);

  const attempt: Omit<AttemptDoc, 'id'> = {
    learnerUid,
    learnerName,
    gradeKey,
    termKey,
    subjectKey,
    setKey,
    setId,
    subjectPath,
    score,
    total,
    answers,
    completedAt: Date.now(),
  };
  await addDoc(collection(db, 'attempts'), attempt);

  const progressId = progressIdOf(learnerUid, setId);
  const progressRef = doc(db, 'progress', progressId);
  const existingSnap = await getDoc(progressRef);
  const existing = existingSnap.exists() ? (existingSnap.data() as ProgressDoc) : null;

  const isNewBest = !existing || score / total > existing.bestScore / existing.bestTotal;
  const updated: ProgressDoc = {
    id: progressId,
    learnerUid,
    learnerName,
    gradeKey,
    termKey,
    subjectKey,
    setKey,
    setId,
    subjectPath,
    bestScore: isNewBest ? score : existing!.bestScore,
    bestTotal: isNewBest ? total : existing!.bestTotal,
    lastScore: score,
    lastTotal: total,
    attempts: (existing?.attempts ?? 0) + 1,
    updatedAt: Date.now(),
  };
  await setDoc(progressRef, updated);
  return updated;
}

function logSnapshotError(error: unknown) {
  console.warn('Firestore listener error:', error);
}

export function subscribeLearnerProgress(
  learnerUid: string,
  callback: (progress: ProgressDoc[]) => void
): () => void {
  const q = query(collection(db, 'progress'), where('learnerUid', '==', learnerUid));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => d.data() as ProgressDoc)),
    logSnapshotError
  );
}

export function subscribeAllLearners(callback: (learners: (UserDoc & { uid: string })[]) => void): () => void {
  const q = query(collection(db, 'users'), where('role', '==', 'learner'));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ ...(d.data() as UserDoc), uid: d.id }))),
    logSnapshotError
  );
}

export function subscribeAllProgress(callback: (progress: ProgressDoc[]) => void): () => void {
  return onSnapshot(
    collection(db, 'progress'),
    (snapshot) => callback(snapshot.docs.map((d) => d.data() as ProgressDoc)),
    logSnapshotError
  );
}

export async function fetchAllAttempts(): Promise<AttemptDoc[]> {
  const snapshot = await getDocs(collection(db, 'attempts'));
  return snapshot.docs.map((d) => ({ ...(d.data() as Omit<AttemptDoc, 'id'>), id: d.id }));
}
