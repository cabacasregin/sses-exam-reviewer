import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { findSubject } from '../data';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, subjectColors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

function getRatingMessage(percent: number): { emoji: string; message: string } {
  if (percent === 100) return { emoji: '🏆', message: 'Perfect score! Excellent work!' };
  if (percent >= 80) return { emoji: '⭐', message: 'Great job! You know this well!' };
  if (percent >= 60) return { emoji: '👍', message: 'Good effort! A little more practice will help.' };
  return { emoji: '💪', message: "Keep practicing! You'll get better each time." };
}

function getStarCount(percent: number): number {
  if (percent === 100) return 3;
  if (percent >= 60) return 2;
  if (percent >= 30) return 1;
  return 0;
}

export function ResultsScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey, setKey, score, total, missedQuestions } = route.params;
  const subject = findSubject(gradeKey, termKey, subjectKey);
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const { emoji, message } = getRatingMessage(percent);
  const starCount = getStarCount(percent);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.summaryCard, { borderColor: accentColor }]}>
        <Text style={styles.bigEmoji}>{emoji}</Text>
        <Text style={styles.subjectTitle}>
          {subject?.emoji} {subject?.title}
        </Text>
        <Text style={styles.scoreText}>
          {score} / {total}
        </Text>
        <Text style={styles.percentText}>{percent}% correct</Text>
        <View style={styles.stars}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={styles.star}>
              {i < starCount ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>

      {missedQuestions.length > 0 && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Review these items</Text>
          {missedQuestions.map((q) => (
            <View key={q.id} style={styles.reviewCard}>
              <Text style={styles.reviewQuestion}>{q.question}</Text>
              <Text style={styles.reviewAnswer}>
                Correct answer: {q.options[q.correctIndex]}
              </Text>
              <Text style={styles.reviewExplanation}>{q.explanation}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label="Try Again"
          onPress={() =>
            navigation.replace('Quiz', { gradeKey, termKey, subjectKey, setKey })
          }
        />
        <PrimaryButton
          label="Back to Practice Sets"
          variant="outline"
          onPress={() => navigation.pop(1)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 3,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  bigEmoji: {
    fontSize: 48,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  percentText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  star: {
    fontSize: 26,
  },
  message: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  reviewSection: {
    gap: 12,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  reviewQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  reviewAnswer: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  reviewExplanation: {
    fontSize: 13,
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
  },
});
