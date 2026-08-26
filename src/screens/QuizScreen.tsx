import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { findSubject } from '../data';
import { Question } from '../data/types';
import { OptionButton } from '../components/OptionButton';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, subjectColors } from '../theme/colors';
import { saveSubjectResult } from '../utils/storage';

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

export function QuizScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey } = route.params;
  const subject = findSubject(gradeKey, termKey, subjectKey);
  const accentColor = subjectColors[subjectKey] ?? colors.primary;

  const questions: Question[] = useMemo(() => shuffle(subject?.questions ?? []), [subject]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!subject || questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>This subject has no questions yet.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = selectedIndex !== null;

  function handleSelect(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedIndex(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissedIds((ids) => [...ids, currentQuestion.id]);
    }
  }

  async function handleNext() {
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      return;
    }

    setSaving(true);
    await saveSubjectResult(gradeKey, termKey, subjectKey, correctCount, questions.length);
    setSaving(false);

    navigation.replace('Results', {
      gradeKey,
      termKey,
      subjectKey,
      score: correctCount,
      total: questions.length,
      missedQuestionIds: missedIds,
    });
  }

  function getOptionState(optionIndex: number): 'idle' | 'correct' | 'incorrect' | 'reveal-correct' {
    if (!hasAnswered) return 'idle';
    if (optionIndex === currentQuestion.correctIndex) {
      return optionIndex === selectedIndex ? 'correct' : 'reveal-correct';
    }
    return optionIndex === selectedIndex ? 'incorrect' : 'reveal-correct';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.subjectLabel, { color: accentColor }]}>
          {subject.emoji} {subject.title}
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
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={option}
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
                  selectedIndex === currentQuestion.correctIndex ? colors.successBg : colors.dangerBg,
              },
            ]}
          >
            <Text style={styles.explanationTitle}>
              {selectedIndex === currentQuestion.correctIndex ? 'Correct! 🎉' : 'Not quite.'}
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
