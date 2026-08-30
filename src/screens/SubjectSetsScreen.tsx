import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { findSubject } from '../data';
import { SetCard } from '../components/SetCard';
import { colors, subjectColors } from '../theme/colors';
import { subscribeApprovedSets } from '../services/content';
import { subscribeLearnerProgress } from '../services/attempts';
import { SetDoc, ProgressDoc } from '../services/types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SubjectSets'>;

export function SubjectSetsScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey } = route.params;
  const subject = findSubject(gradeKey, termKey, subjectKey);
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const { session } = useAuth();

  const [sets, setSets] = useState<SetDoc[]>([]);
  const [progressBySetId, setProgressBySetId] = useState<Record<string, ProgressDoc>>({});

  useEffect(() => {
    return subscribeApprovedSets(gradeKey, termKey, subjectKey, setSets);
  }, [gradeKey, termKey, subjectKey]);

  useEffect(() => {
    if (!session) return;
    return subscribeLearnerProgress(session.user.uid, (progress) => {
      const map: Record<string, ProgressDoc> = {};
      for (const p of progress) map[p.setId] = p;
      setProgressBySetId(map);
    });
  }, [session]);

  if (!subject) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>This subject could not be found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.subjectLabel, { color: accentColor }]}>
          {subject.emoji} {subject.title}
        </Text>
        <Text style={styles.description}>{subject.description}</Text>
      </View>
      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SetCard
            set={item}
            accentColor={accentColor}
            progress={progressBySetId[item.id]}
            onPress={() =>
              navigation.navigate('Quiz', {
                gradeKey,
                termKey,
                subjectKey,
                setKey: item.key,
              })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No practice sets are available yet.</Text>
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
    marginTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  subjectLabel: {
    fontSize: 22,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
