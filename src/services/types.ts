export type ContentStatus = 'approved' | 'pending';

export type Role = 'teacher' | 'learner';

export interface UserDoc {
  role: Role;
  displayName: string;
  username?: string; // learners only
  createdAt: number;
}

export interface QuestionDoc {
  id: string;
  gradeKey: string;
  termKey: string;
  subjectKey: string;
  setKey: string;
  setId: string;
  subjectPath: string;
  order: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  status: ContentStatus;
  createdAt: number;
  updatedAt: number;
  updatedBy: string | null;
}

export interface SetDoc {
  id: string;
  gradeKey: string;
  termKey: string;
  subjectKey: string;
  key: string;
  subjectPath: string;
  title: string;
  order: number;
  questionCount: number;
  status: ContentStatus;
  updatedAt: number;
  updatedBy: string | null;
}

export interface AttemptAnswer {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
}

export interface AttemptDoc {
  id: string;
  learnerUid: string;
  learnerName: string;
  gradeKey: string;
  termKey: string;
  subjectKey: string;
  setKey: string;
  setId: string;
  subjectPath: string;
  score: number;
  total: number;
  answers: AttemptAnswer[];
  completedAt: number;
}

export interface ProgressDoc {
  id: string;
  learnerUid: string;
  learnerName: string;
  gradeKey: string;
  termKey: string;
  subjectKey: string;
  setKey: string;
  setId: string;
  subjectPath: string;
  bestScore: number;
  bestTotal: number;
  lastScore: number;
  lastTotal: number;
  attempts: number;
  updatedAt: number;
}

export function subjectPathOf(gradeKey: string, termKey: string, subjectKey: string): string {
  return `${gradeKey}_${termKey}_${subjectKey}`;
}

export function setIdOf(gradeKey: string, termKey: string, subjectKey: string, setKey: string): string {
  return `${subjectPathOf(gradeKey, termKey, subjectKey)}_${setKey}`;
}

export function progressIdOf(learnerUid: string, setId: string): string {
  return `${learnerUid}_${setId}`;
}
