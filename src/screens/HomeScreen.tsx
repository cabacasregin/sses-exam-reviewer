import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { findTerm } from '../data';
import { SubjectCard } from '../components/SubjectCard';
import { colors, subjectColors } from '../theme/colors';
import { getLearnerName } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const GRADE_KEY = 'grade1';
const TERM_KEY = 'term1';

export function HomeScreen({ navigation }: Props) {
  const term = findTerm(GRADE_KEY, TERM_KEY)!;
  const [learnerName, setLearnerName] = useState<string | null>(null);

  useEffect(() => {
    getLearnerName().then(setLearnerName);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Special Science Elementary School</Text>
        <Text style={styles.title}>
          {learnerName ? `Hi, ${learnerName}! 👋` : 'Grade 1 Exam Reviewer'}
        </Text>
        <Text style={styles.subtitle}>{term.title}</Text>
      </View>
      <FlatList
        data={term.subjects}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            accentColor={subjectColors[item.key] ?? colors.primary}
            onPress={() =>
              navigation.navigate('SubjectSets', {
                gradeKey: GRADE_KEY,
                termKey: TERM_KEY,
                subjectKey: item.key,
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
