import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, subjectColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { createQuestion, deleteQuestion, fetchQuestionsForSet, getQuestion, updateQuestion } from '../../services/content';
import { PrimaryButton } from '../../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherQuestionEditor'>;

const LETTERS = ['A', 'B', 'C', 'D'];

export function TeacherQuestionEditorScreen({ route, navigation }: Props) {
  const { gradeKey, termKey, subjectKey, setKey, setId, questionId } = route.params;
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const { session } = useAuth();

  const [loading, setLoading] = useState(!!questionId);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!questionId) return;
    getQuestion(questionId).then((doc) => {
      if (doc) {
        setQuestion(doc.question);
        setOptions(doc.options);
        setCorrectIndex(doc.correctIndex);
        setExplanation(doc.explanation);
      }
      setLoading(false);
    });
  }, [questionId]);

  async function handleSave() {
    setError(null);
    if (!question.trim()) {
      setError('Please enter the question text.');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setError('Please fill in all 4 options.');
      return;
    }
    if (!session) return;

    setSaving(true);
    try {
      if (questionId) {
        await updateQuestion(
          questionId,
          { question: question.trim(), options: options.map((o) => o.trim()), correctIndex, explanation: explanation.trim(), status: 'pending' },
          session.user.uid
        );
      } else {
        const existing = await fetchQuestionsForSet(setId);
        await createQuestion(
          {
            id: `${setId}-${Date.now()}`,
            gradeKey,
            termKey,
            subjectKey,
            setKey,
            order: existing.length + 1,
            question: question.trim(),
            options: options.map((o) => o.trim()),
            correctIndex,
            explanation: explanation.trim(),
            status: 'pending',
          },
          session.user.uid
        );
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!questionId) return;
    Alert.alert('Delete this question?', question, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteQuestion(questionId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Question</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={question}
          onChangeText={setQuestion}
          multiline
          placeholder="What is..."
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Options (tap the letter to mark the correct answer)</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <Pressable
              style={[
                styles.letterButton,
                { borderColor: accentColor },
                correctIndex === index && { backgroundColor: accentColor },
              ]}
              onPress={() => setCorrectIndex(index)}
            >
              <Text style={[styles.letterText, correctIndex === index && styles.letterTextActive]}>
                {LETTERS[index]}
              </Text>
            </Pressable>
            <TextInput
              style={[styles.input, styles.optionInput]}
              value={option}
              onChangeText={(text) => setOptions((opts) => opts.map((o, i) => (i === index ? text : o)))}
              placeholder={`Option ${LETTERS[index]}`}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}

        <Text style={styles.label}>Explanation</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={explanation}
          onChangeText={setExplanation}
          multiline
          placeholder="Why is this the correct answer?"
          placeholderTextColor={colors.textMuted}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.hint}>
          Saving sends this question back to pending review, so it will not show to learners until you
          approve it from the questions list.
        </Text>

        <PrimaryButton label={saving ? 'Saving...' : 'Save'} onPress={handleSave} />
        {questionId && (
          <Text style={styles.deleteLink} onPress={handleDelete}>
            Delete this question
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  loadingText: {
    color: colors.textMuted,
  },
  content: {
    padding: 20,
    gap: 10,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  letterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontWeight: '800',
    color: colors.text,
  },
  letterTextActive: {
    color: '#FFFFFF',
  },
  optionInput: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  deleteLink: {
    textAlign: 'center',
    color: colors.danger,
    fontWeight: '700',
    marginTop: 8,
  },
});
