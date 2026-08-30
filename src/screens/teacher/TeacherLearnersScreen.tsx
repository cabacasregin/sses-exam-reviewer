import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { subscribeAllLearners, subscribeAllProgress } from '../../services/attempts';
import { ProgressDoc, UserDoc } from '../../services/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherLearners'>;

interface LearnerSummary {
  uid: string;
  displayName: string;
  username?: string;
  setsCompleted: number;
  averagePercent: number | null;
}

export function TeacherLearnersScreen({ navigation }: Props) {
  const [learners, setLearners] = useState<(UserDoc & { uid: string })[]>([]);
  const [progress, setProgress] = useState<ProgressDoc[]>([]);

  useEffect(() => subscribeAllLearners(setLearners), []);
  useEffect(() => subscribeAllProgress(setProgress), []);

  const summaries: LearnerSummary[] = useMemo(() => {
    return learners.map((learner) => {
      const own = progress.filter((p) => p.learnerUid === learner.uid);
      const totalScore = own.reduce((sum, p) => sum + p.bestScore, 0);
      const totalPossible = own.reduce((sum, p) => sum + p.bestTotal, 0);
      return {
        uid: learner.uid,
        displayName: learner.displayName,
        username: learner.username,
        setsCompleted: own.length,
        averagePercent: totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : null,
      };
    });
  }, [learners, progress]);

  return (
    <View style={styles.container}>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('TeacherLearnerDetail', { learnerUid: item.uid })}
          >
            <View style={styles.textWrap}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.meta}>
                @{item.username} • {item.setsCompleted} set{item.setsCompleted === 1 ? '' : 's'} completed
              </Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>
                {item.averagePercent === null ? '—' : `${item.averagePercent}%`}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No learners have signed up yet.</Text>}
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
  list: {
    padding: 20,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreBadge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
