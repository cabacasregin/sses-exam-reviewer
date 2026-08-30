import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { findSubject } from '../data';
import { OptionButton } from '../components/OptionButton';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, subjectColors } from '../theme/colors';
import { subscribeApprovedQuestions, subscribeSet } from '../services/content';
import { recordAttempt } from '../services/attempts';
import { QuestionDoc, AttemptAnswer, SetDoc } from '../services/types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

const LETTERS = ['A', 'B', 'C', 'D'];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionOptions(question: QuestionDoc): { options: string[]; correctIndex: number } {
  const order = shuffle(question.options.map((_, i) => i));
  return {
    options: order.map((i) => question.options[i]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}

export function QuizScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey, setKey } = route.params;
  const subject = findSubject(gradeKey, termKey, subjectKey);
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const { session } = useAuth();

  const [set, setSet] = useState<SetDoc | null>(null);
  const [liveQuestions, setLiveQuestions] = useState<QuestionDoc[] | null>(null);
  const [questions, setQuestions] = useState<QuestionDoc[]>([]);

  useEffect(() => {
    return subscribeSet(gradeKey, termKey, subjectKey, setKey, setSet);
  }, [gradeKey, termKey, subjectKey, setKey]);

  useEffect(() => {
    return subscribeApprovedQuestions(gradeKey, termKey, subjectKey, setKey, (fetched) => {
      setLiveQuestions(fetched);
    });
  }, [gradeKey, termKey, subjectKey, setKey]);

  // Freeze the shuffled question order once loaded, instead of re-shuffling
  // on every live-data update.
  useEffect(() => {
    if (liveQuestions && questions.length === 0) {
      setQuestions(shuffle(liveQuestions));
    }
  }, [liveQuestions, questions.length]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [missedQuestions, setMissedQuestions] = useState<QuestionDoc[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const hasAnswered = selectedIndex !== null;

  const shuffledQuestion = useMemo(
    () => (currentQuestion ? shuffleQuestionOptions(currentQuestion) : null),
    [currentQuestion]
  );

  if (liveQuestions === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Loading questions...</Text>
      </View>
    );
  }

  if (!subject || !set || questions.length === 0 || !currentQuestion || !shuffledQuestion) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>This subject has no approved questions yet.</Text>
      </View>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const { options: shuffledOptions, correctIndex: shuffledCorrectIndex } = shuffledQuestion;

  function handleSelect(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedIndex(optionIndex);
    const correct = optionIndex === shuffledCorrectIndex;
    setAnswers((a) => [
      ...a,
      {
        questionId: currentQuestion.id,
        selectedIndex: optionIndex,
        correctIndex: shuffledCorrectIndex,
        correct,
      },
    ]);
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissedQuestions((qs) => [...qs, currentQuestion]);
    }
  }

  async function handleNext() {
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      return;
    }

    if (session) {
      setSaving(true);
      await recordAttempt(
        session.user.uid,
        session.displayName,
        gradeKey,
        termKey,
        subjectKey,
        setKey,
        correctCount,
        questions.length,
        answers
      );
      setSaving(false);
    }

    navigation.replace('Results', {
      gradeKey,
      termKey,
      subjectKey,
      setKey,
      score: correctCount,
      total: questions.length,
      missedQuestions: missedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    });
  }

  function getOptionState(optionIndex: number): 'idle' | 'correct' | 'incorrect' | 'reveal-correct' {
    if (!hasAnswered) return 'idle';
    if (optionIndex === shuffledCorrectIndex) {
      return optionIndex === selectedIndex ? 'correct' : 'reveal-correct';
    }
    return optionIndex === selectedIndex ? 'incorrect' : 'reveal-correct';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.subjectLabel, { color: accentColor }]}>
          {subject.emoji} {subject.title} • {set.title}
        </Text>
        <Text style={styles.counter}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <ProgressBar progress={(currentIndex + 1) / questions.length} color={accentColor} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.options}>
          {shuffledOptions.map((option, index) => (
            <OptionButton
              key={`${currentQuestion.id}-${index}`}
              label={option}
              letter={LETTERS[index]}
              state={getOptionState(index)}
              onPress={() => handleSelect(index)}
            />
          ))}
        </View>

        {hasAnswered && (
          <View
            style={[
              styles.explanationCard,
              {
                backgroundColor:
                  selectedIndex === shuffledCorrectIndex ? colors.successBg : colors.dangerBg,
              },
            ]}
          >
            <Text style={styles.explanationTitle}>
              {selectedIndex === shuffledCorrectIndex ? 'Correct! 🎉' : 'Not quite.'}
            </Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {hasAnswered && (
        <View style={styles.footer}>
          <PrimaryButton
            label={isLastQuestion ? (saving ? 'Saving...' : 'See Results') : 'Next Question'}
            onPress={handleNext}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  subjectLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  counter: {
    fontSize: 13,
    color: colors.textMuted,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  options: {
    gap: 12,
  },
  explanationCard: {
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  explanationTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  explanationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
});
