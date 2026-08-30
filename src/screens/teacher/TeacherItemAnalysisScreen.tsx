import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { findSubject } from '../../data';
import { colors, subjectColors } from '../../theme/colors';
import { fetchAllAttempts } from '../../services/attempts';
import { fetchAllQuestionsMap } from '../../services/content';
import { computeItemAnalysis, QuestionStat, TopicStat } from '../../services/itemAnalysis';

const GRADE_KEY = 'grade1';
const TERM_KEY = 'term1';
const MAX_HARDEST_QUESTIONS = 15;

export function TeacherItemAnalysisScreen() {
  const [loading, setLoading] = useState(true);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    Promise.all([fetchAllAttempts(), fetchAllQuestionsMap()]).then(([attempts, questionsById]) => {
      const { topicStats: topics, questionStats: questions } = computeItemAnalysis(attempts, questionsById);
      setTopicStats(topics);
      setQuestionStats(questions.slice(0, MAX_HARDEST_QUESTIONS));
      setTotalAttempts(attempts.length);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Crunching the numbers...</Text>
      </View>
    );
  }

  if (totalAttempts === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No quiz attempts yet. Check back once learners start practicing.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={questionStats}
      keyExtractor={(item) => item.questionId}
      ListHeaderComponent={
        <>
          <Text style={styles.sectionTitle}>Least Learned Topics</Text>
          <Text style={styles.sectionSubtitle}>
            Average correct rate across every attempt, lowest first.
          </Text>
          {topicStats.map((topic) => {
            const subject = findSubject(GRADE_KEY, TERM_KEY, topic.subjectKey);
            const accentColor = subjectColors[topic.subjectKey] ?? colors.primary;
            return (
              <View key={topic.subjectKey} style={styles.topicRow}>
                <Text style={[styles.topicTitle, { color: accentColor }]}>
                  {subject?.emoji} {subject?.title ?? topic.subjectKey}
                </Text>
                <Text style={styles.topicScore}>{Math.round(topic.correctRate * 100)}% correct</Text>
              </View>
            );
          })}

          <Text style={[styles.sectionTitle, styles.hardestTitle]}>Hardest Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Questions with the highest wrong-answer rate across all learners.
          </Text>
        </>
      }
      renderItem={({ item, index }) => (
        <View style={styles.questionCard}>
          <Text style={styles.questionRank}>#{index + 1}</Text>
          <View style={styles.questionTextWrap}>
            <Text style={styles.questionText}>{item.question}</Text>
            <Text style={styles.questionMeta}>
              {item.subjectKey} • {item.setKey} • answered {item.timesAnswered} time
              {item.timesAnswered === 1 ? '' : 's'}
            </Text>
          </View>
          <Text style={styles.wrongRate}>{Math.round(item.wrongRate * 100)}% wrong</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
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
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  hardestTitle: {
    marginTop: 24,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicScore: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  questionRank: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    width: 28,
  },
  questionTextWrap: {
    flex: 1,
    gap: 2,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  questionMeta: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  wrongRate: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
  },
});
