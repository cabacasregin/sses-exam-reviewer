export type RootStackParamList = {
  Welcome: undefined;
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
    missedQuestionIds: string[];
  };
};
