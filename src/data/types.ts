export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuestionSet {
  key: string;
  title: string;
  questions: Question[];
}

export interface Subject {
  key: string;
  title: string;
  emoji: string;
  description: string;
  questionSets: QuestionSet[];
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
