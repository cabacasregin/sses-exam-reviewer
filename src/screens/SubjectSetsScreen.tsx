import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { findSubject } from '../data';
import { SetCard } from '../components/SetCard';
import { colors, subjectColors } from '../theme/colors';
import { getSetProgressForSubject, SetProgress } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'SubjectSets'>;

export function SubjectSetsScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey } = route.params;
  const subject = findSubject(gradeKey, termKey, subjectKey);
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const [progressMap, setProgressMap] = useState<Record<string, SetProgress | null>>({});

  useFocusEffect(
    useCallback(() => {
      if (!subject) return;
      let active = true;
      getSetProgressForSubject(
        gradeKey,
        termKey,
        subjectKey,
        subject.questionSets.map((s) => s.key)
      ).then((map) => {
        if (active) setProgressMap(map);
      });
      return () => {
        active = false;
      };
    }, [subject, gradeKey, termKey, subjectKey])
  );

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
        data={subject.questionSets}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SetCard
            set={item}
            accentColor={accentColor}
            progress={progressMap[item.key]}
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
