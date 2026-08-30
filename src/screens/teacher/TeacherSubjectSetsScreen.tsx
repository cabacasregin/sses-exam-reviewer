import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { findSubject } from '../../data';
import { colors, subjectColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { createSet, deleteSet, setSetStatus, subscribeAllSets } from '../../services/content';
import { SetDoc } from '../../services/types';
import { PrimaryButton } from '../../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherSubjectSets'>;

const GRADE_KEY = 'grade1';
const TERM_KEY = 'term1';

export function TeacherSubjectSetsScreen({ route, navigation }: Props) {
  const { subjectKey } = route.params;
  const subject = findSubject(GRADE_KEY, TERM_KEY, subjectKey);
  const accentColor = subjectColors[subjectKey] ?? colors.primary;
  const { session } = useAuth();

  const [sets, setSets] = useState<SetDoc[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => subscribeAllSets(GRADE_KEY, TERM_KEY, subjectKey, setSets), [subjectKey]);

  async function handleAddSet() {
    if (!newTitle.trim() || !session) return;
    const key = `set-${Date.now()}`;
    await createSet(GRADE_KEY, TERM_KEY, subjectKey, key, newTitle.trim(), sets.length + 1, session.user.uid);
    setNewTitle('');
  }

  function handleDelete(set: SetDoc) {
    Alert.alert('Delete practice set?', `"${set.title}" and all its questions will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSet(set.id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.newSetRow}>
        <TextInput
          style={styles.input}
          placeholder="New practice set title"
          placeholderTextColor={colors.textMuted}
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <PrimaryButton label="Add" onPress={handleAddSet} style={styles.addButton} />
      </View>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('TeacherQuestions', {
                gradeKey: GRADE_KEY,
                termKey: TERM_KEY,
                subjectKey,
                setKey: item.key,
                setId: item.id,
              })
            }
          >
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.questionCount} questions</Text>
            </View>
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
                setSetStatus(item.id, item.status === 'approved' ? 'pending' : 'approved', session!.user.uid)
              }
            >
              {item.status === 'approved' ? 'Unpublish' : 'Approve'}
            </Text>
            <Text style={styles.action} onPress={() => handleDelete(item)}>
              Delete
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No practice sets yet for {subject?.title}.</Text>}
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
  newSetRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 20,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  textWrap: {
    flex: 1,
    minWidth: 140,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
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
    paddingHorizontal: 4,
  },
});
