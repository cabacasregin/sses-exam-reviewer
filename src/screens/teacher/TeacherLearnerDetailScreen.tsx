import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { findSubject } from '../../data';
import { colors, subjectColors } from '../../theme/colors';
import { fetchUserDoc } from '../../services/auth';
import { subscribeLearnerProgress } from '../../services/attempts';
import { ProgressDoc, UserDoc } from '../../services/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherLearnerDetail'>;

const GRADE_KEY = 'grade1';
const TERM_KEY = 'term1';

export function TeacherLearnerDetailScreen({ route }: Props) {
  const { learnerUid } = route.params;
  const [learner, setLearner] = useState<UserDoc | null>(null);
  const [progress, setProgress] = useState<ProgressDoc[]>([]);

  useEffect(() => {
    fetchUserDoc(learnerUid).then(setLearner);
  }, [learnerUid]);

  useEffect(() => subscribeLearnerProgress(learnerUid, setProgress), [learnerUid]);

  const bySubject = useMemo(() => {
    const map = new Map<string, ProgressDoc[]>();
    for (const p of progress) {
      const list = map.get(p.subjectKey) ?? [];
      list.push(p);
      map.set(p.subjectKey, list);
    }
    return Array.from(map.entries());
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{learner?.displayName ?? 'Learner'}</Text>
        {learner?.username && <Text style={styles.subtitle}>@{learner.username}</Text>}
      </View>

      <FlatList
        data={bySubject}
        keyExtractor={([subjectKey]) => subjectKey}
        contentContainerStyle={styles.list}
        renderItem={({ item: [subjectKey, sets] }) => {
          const subject = findSubject(GRADE_KEY, TERM_KEY, subjectKey);
          const accentColor = subjectColors[subjectKey] ?? colors.primary;
          return (
            <View style={styles.subjectCard}>
              <Text style={[styles.subjectTitle, { color: accentColor }]}>
                {subject?.emoji} {subject?.title ?? subjectKey}
              </Text>
              {sets.map((set) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setKey}>{set.setKey}</Text>
                  <Text style={styles.setScore}>
                    Best {set.bestScore}/{set.bestTotal} • Last {set.lastScore}/{set.lastTotal} •{' '}
                    {set.attempts} attempt{set.attempts === 1 ? '' : 's'}
                  </Text>
                </View>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>This learner hasn't completed any practice sets yet.</Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
  subjectCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  setRow: {
    gap: 2,
  },
  setKey: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  setScore: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
