export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Subject {
  key: string;
  title: string;
  emoji: string;
  description: string;
  questions: Question[];
}

export interface Term {
  key: string;
  title: string;
  subjects: Subject[];
}

export interface GradeLevel {
  key: string;
  title: string;
  terms: Term[];
}
