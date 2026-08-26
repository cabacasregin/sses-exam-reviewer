export type RootStackParamList = {
  Home: undefined;
  Quiz: { gradeKey: string; termKey: string; subjectKey: string };
  Results: {
    gradeKey: string;
    termKey: string;
    subjectKey: string;
    score: number;
    total: number;
    missedQuestionIds: string[];
  };
};
