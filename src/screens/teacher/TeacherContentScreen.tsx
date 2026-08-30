import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { findTerm } from '../../data';
import { colors, subjectColors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherContent'>;

const GRADE_KEY = 'grade1';
const TERM_KEY = 'term1';

export function TeacherContentScreen({ navigation }: Props) {
  const term = findTerm(GRADE_KEY, TERM_KEY)!;

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Pick a subject to review, edit, approve, or add practice sets and questions.
      </Text>
      <FlatList
        data={term.subjects}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const accentColor = subjectColors[item.key] ?? colors.primary;
          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => navigation.navigate('TeacherSubjectSets', { subjectKey: item.key })}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.textWrap}>
                <Text style={[styles.title, { color: accentColor }]}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  emoji: {
    fontSize: 28,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
});
