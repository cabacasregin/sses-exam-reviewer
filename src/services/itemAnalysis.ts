import { AttemptDoc, QuestionDoc } from './types';

export interface QuestionStat {
  questionId: string;
  question: string;
  subjectKey: string;
  setKey: string;
  timesAnswered: number;
  timesCorrect: number;
  wrongRate: number; // 0-1, higher = more learners get it wrong
}

export interface TopicStat {
  subjectKey: string;
  timesAnswered: number; // total answers across all attempts for this subject
  timesCorrect: number;
  correctRate: number; // 0-1
}

export function computeItemAnalysis(
  attempts: AttemptDoc[],
  questionsById: Map<string, QuestionDoc>
): { questionStats: QuestionStat[]; topicStats: TopicStat[] } {
  const questionTally = new Map<string, { correct: number; total: number }>();
  const topicTally = new Map<string, { correct: number; total: number }>();

  for (const attempt of attempts) {
    const topic = topicTally.get(attempt.subjectKey) ?? { correct: 0, total: 0 };
    topic.correct += attempt.score;
    topic.total += attempt.total;
    topicTally.set(attempt.subjectKey, topic);

    for (const answer of attempt.answers) {
      const tally = questionTally.get(answer.questionId) ?? { correct: 0, total: 0 };
      tally.total += 1;
      if (answer.correct) tally.correct += 1;
      questionTally.set(answer.questionId, tally);
    }
  }

  const questionStats: QuestionStat[] = [];
  for (const [questionId, tally] of questionTally.entries()) {
    const question = questionsById.get(questionId);
    if (!question) continue;
    questionStats.push({
      questionId,
      question: question.question,
      subjectKey: question.subjectKey,
      setKey: question.setKey,
      timesAnswered: tally.total,
      timesCorrect: tally.correct,
      wrongRate: 1 - tally.correct / tally.total,
    });
  }
  questionStats.sort((a, b) => b.wrongRate - a.wrongRate);

  const topicStats: TopicStat[] = Array.from(topicTally.entries()).map(([subjectKey, tally]) => ({
    subjectKey,
    timesAnswered: tally.total,
    timesCorrect: tally.correct,
    correctRate: tally.total > 0 ? tally.correct / tally.total : 0,
  }));
  topicStats.sort((a, b) => a.correctRate - b.correctRate);

  return { questionStats, topicStats };
}
