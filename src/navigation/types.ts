export interface MissedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type RootStackParamList = {
  // Logged out
  Welcome: undefined;
  LearnerAuth: undefined;
  TeacherAuth: undefined;

  // Learner
  Home: undefined;
  SubjectSets: { gradeKey: string; termKey: string; subjectKey: string };
  Quiz: { gradeKey: string; termKey: string; subjectKey: string; setKey: string };
  Results: {
    gradeKey: string;
    termKey: string;
    subjectKey: string;
    setKey: string;
    score: number;
    total: number;
    missedQuestions: MissedQuestion[];
  };

  // Teacher
  TeacherDashboard: undefined;
  TeacherContent: undefined;
  TeacherSubjectSets: { subjectKey: string };
  TeacherQuestions: { gradeKey: string; termKey: string; subjectKey: string; setKey: string; setId: string };
  TeacherQuestionEditor: {
    gradeKey: string;
    termKey: string;
    subjectKey: string;
    setKey: string;
    setId: string;
    questionId?: string;
  };
  TeacherLearners: undefined;
  TeacherLearnerDetail: { learnerUid: string };
  TeacherItemAnalysis: undefined;
};
