import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, subjectColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { deleteQuestion, setQuestionStatus, subscribeAllQuestions } from '../../services/content';
import { QuestionDoc } from '../../services/types';
import { PrimaryButton } from '../../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherQuestions'>;

export function TeacherQuestionsScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey, setKey, setId } = route.params;
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const { session } = useAuth();
  const [questions, setQuestions] = useState<QuestionDoc[]>([]);

  useEffect(
    () => subscribeAllQuestions(gradeKey, termKey, subjectKey, setKey, setQuestions),
    [gradeKey, termKey, subjectKey, setKey]
  );

  function handleDelete(question: QuestionDoc) {
    Alert.alert('Delete question?', question.question, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteQuestion(question.id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <PrimaryButton
        label="+ Add Question"
        onPress={() =>
          navigation.navigate('TeacherQuestionEditor', { gradeKey, termKey, subjectKey, setKey, setId })
        }
        style={styles.addButton}
      />

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={styles.textWrap}
              onPress={() =>
                navigation.navigate('TeacherQuestionEditor', {
                  gradeKey,
                  termKey,
                  subjectKey,
                  setKey,
                  setId,
                  questionId: item.id,
                })
              }
            >
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>
                Correct: {item.options[item.correctIndex]}
              </Text>
            </Pressable>
            <View style={styles.actions}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'approved' ? colors.successBg : colors.dangerBg },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: item.status === 'approved' ? colors.success : colors.danger },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <Text
                style={[styles.action, { color: accentColor }]}
                onPress={() =>
                  setQuestionStatus(
                    item.id,
                    item.status === 'approved' ? 'pending' : 'approved',
                    session!.user.uid
                  )
                }
              >
                {item.status === 'approved' ? 'Unpublish' : 'Approve'}
              </Text>
              <Text style={styles.action} onPress={() => handleDelete(item)}>
                Delete
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No questions in this set yet.</Text>}
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
  addButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  textWrap: {
    gap: 4,
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  answer: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
