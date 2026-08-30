import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { QuestionDoc, SetDoc, setIdOf, subjectPathOf } from './types';

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

// Firestore listeners can briefly error out (e.g. a permission check racing
// with sign-out while a screen is unmounting); log instead of throwing so a
// stale listener never crashes the app.
function logSnapshotError(error: unknown) {
  console.warn('Firestore listener error:', error);
}

// Learner-facing: only approved sets for a subject, sorted by their intended
// order. Teacher-facing screens use subscribeAllSets instead so they also
// see pending drafts.
export function subscribeApprovedSets(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  callback: (sets: SetDoc[]) => void
): () => void {
  const subjectPath = subjectPathOf(gradeKey, termKey, subjectKey);
  const q = query(
    collection(db, 'sets'),
    where('subjectPath', '==', subjectPath),
    where('status', '==', 'approved')
  );
  return onSnapshot(
    q,
    (snapshot) => callback(sortByOrder(snapshot.docs.map((d) => d.data() as SetDoc))),
    logSnapshotError
  );
}

export function subscribeAllSets(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  callback: (sets: SetDoc[]) => void
): () => void {
  const subjectPath = subjectPathOf(gradeKey, termKey, subjectKey);
  const q = query(collection(db, 'sets'), where('subjectPath', '==', subjectPath));
  return onSnapshot(
    q,
    (snapshot) => callback(sortByOrder(snapshot.docs.map((d) => d.data() as SetDoc))),
    logSnapshotError
  );
}

export function subscribeSet(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKey: string,
  callback: (set: SetDoc | null) => void
): () => void {
  const setId = setIdOf(gradeKey, termKey, subjectKey, setKey);
  return onSnapshot(
    doc(db, 'sets', setId),
    (snapshot) => callback(snapshot.exists() ? (snapshot.data() as SetDoc) : null),
    logSnapshotError
  );
}

export function subscribeApprovedQuestions(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKey: string,
  callback: (questions: QuestionDoc[]) => void
): () => void {
  const setId = setIdOf(gradeKey, termKey, subjectKey, setKey);
  const q = query(
    collection(db, 'questions'),
    where('setId', '==', setId),
    where('status', '==', 'approved')
  );
  return onSnapshot(
    q,
    (snapshot) => callback(sortByOrder(snapshot.docs.map((d) => d.data() as QuestionDoc))),
    logSnapshotError
  );
}

export function subscribeAllQuestions(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  setKey: string,
  callback: (questions: QuestionDoc[]) => void
): () => void {
  const setId = setIdOf(gradeKey, termKey, subjectKey, setKey);
  const q = query(collection(db, 'questions'), where('setId', '==', setId));
  return onSnapshot(
    q,
    (snapshot) => callback(sortByOrder(snapshot.docs.map((d) => d.data() as QuestionDoc))),
    logSnapshotError
  );
}

export function subscribePendingCounts(
  callback: (counts: { pendingSets: number; pendingQuestions: number }) => void
): () => void {
  let pendingSets = 0;
  let pendingQuestions = 0;
  const unsubSets = onSnapshot(
    query(collection(db, 'sets'), where('status', '==', 'pending')),
    (snapshot) => {
      pendingSets = snapshot.size;
      callback({ pendingSets, pendingQuestions });
    },
    logSnapshotError
  );
  const unsubQuestions = onSnapshot(
    query(collection(db, 'questions'), where('status', '==', 'pending')),
    (snapshot) => {
      pendingQuestions = snapshot.size;
      callback({ pendingSets, pendingQuestions });
    },
    logSnapshotError
  );
  return () => {
    unsubSets();
    unsubQuestions();
  };
}

export async function fetchQuestionsForSet(setId: string): Promise<QuestionDoc[]> {
  const snapshot = await getDocs(query(collection(db, 'questions'), where('setId', '==', setId)));
  return sortByOrder(snapshot.docs.map((d) => d.data() as QuestionDoc));
}

export async function getQuestion(questionId: string): Promise<QuestionDoc | null> {
  const snap = await getDoc(doc(db, 'questions', questionId));
  return snap.exists() ? (snap.data() as QuestionDoc) : null;
}

export async function updateQuestion(
  questionId: string,
  patch: Partial<Pick<QuestionDoc, 'question' | 'options' | 'correctIndex' | 'explanation' | 'status'>>,
  updatedBy: string
): Promise<void> {
  await updateDoc(doc(db, 'questions', questionId), {
    ...patch,
    updatedAt: Date.now(),
    updatedBy,
  });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const snap = await getDoc(doc(db, 'questions', questionId));
  const setId = snap.exists() ? (snap.data() as QuestionDoc).setId : null;
  await deleteDoc(doc(db, 'questions', questionId));
  if (setId) {
    await updateDoc(doc(db, 'sets', setId), { questionCount: increment(-1) });
  }
}

export async function setQuestionStatus(
  questionId: string,
  status: 'approved' | 'pending',
  updatedBy: string
): Promise<void> {
  await updateQuestion(questionId, { status }, updatedBy);
}

export async function createQuestion(
  question: Omit<QuestionDoc, 'createdAt' | 'updatedAt' | 'updatedBy' | 'setId' | 'subjectPath'>,
  updatedBy: string
): Promise<void> {
  const subjectPath = subjectPathOf(question.gradeKey, question.termKey, question.subjectKey);
  const setId = setIdOf(question.gradeKey, question.termKey, question.subjectKey, question.setKey);
  const doc_: QuestionDoc = {
    ...question,
    subjectPath,
    setId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    updatedBy,
  };
  await setDoc(doc(db, 'questions', question.id), doc_);
  await updateDoc(doc(db, 'sets', setId), { questionCount: increment(1) });
}

export async function createSet(
  gradeKey: string,
  termKey: string,
  subjectKey: string,
  key: string,
  title: string,
  order: number,
  updatedBy: string
): Promise<string> {
  const subjectPath = subjectPathOf(gradeKey, termKey, subjectKey);
  const setId = setIdOf(gradeKey, termKey, subjectKey, key);
  const setDocData: SetDoc = {
    id: setId,
    gradeKey,
    termKey,
    subjectKey,
    key,
    subjectPath,
    title,
    order,
    questionCount: 0,
    status: 'pending',
    updatedAt: Date.now(),
    updatedBy,
  };
  await setDoc(doc(db, 'sets', setId), setDocData);
  return setId;
}

export async function updateSet(
  setId: string,
  patch: Partial<Pick<SetDoc, 'title' | 'status' | 'order'>>,
  updatedBy: string
): Promise<void> {
  await updateDoc(doc(db, 'sets', setId), {
    ...patch,
    updatedAt: Date.now(),
    updatedBy,
  });
}

export async function deleteSet(setId: string): Promise<void> {
  await deleteDoc(doc(db, 'sets', setId));
}

export async function fetchAllQuestionsMap(): Promise<Map<string, QuestionDoc>> {
  const snapshot = await getDocs(collection(db, 'questions'));
  const map = new Map<string, QuestionDoc>();
  for (const d of snapshot.docs) {
    map.set(d.id, d.data() as QuestionDoc);
  }
  return map;
}

export async function setSetStatus(
  setId: string,
  status: 'approved' | 'pending',
  updatedBy: string
): Promise<void> {
  await updateSet(setId, { status }, updatedBy);
}
