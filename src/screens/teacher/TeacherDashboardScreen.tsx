import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { signOutUser } from '../../services/auth';
import { subscribePendingCounts } from '../../services/content';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherDashboard'>;

export function TeacherDashboardScreen({ navigation }: Props) {
  const { session } = useAuth();
  const [pending, setPending] = useState({ pendingSets: 0, pendingQuestions: 0 });

  useEffect(() => subscribePendingCounts(setPending), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Teacher Portal</Text>
        <Text style={styles.title}>Hi, {session?.displayName}! 🍎</Text>
        <Text style={styles.subtitle}>Special Science Elementary School</Text>
      </View>

      {(pending.pendingSets > 0 || pending.pendingQuestions > 0) && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>
            {pending.pendingQuestions} question{pending.pendingQuestions === 1 ? '' : 's'} and{' '}
            {pending.pendingSets} set{pending.pendingSets === 1 ? '' : 's'} awaiting your review
          </Text>
        </View>
      )}

      <View style={styles.cards}>
        <PrimaryButton label="📚 Review Content" onPress={() => navigation.navigate('TeacherContent')} />
        <PrimaryButton
          label="🧑‍🎓 Learner Progress"
          variant="outline"
          onPress={() => navigation.navigate('TeacherLearners')}
        />
        <PrimaryButton
          label="📊 Item Analysis"
          variant="outline"
          onPress={() => navigation.navigate('TeacherItemAnalysis')}
        />
      </View>

      <Text style={styles.logout} onPress={signOutUser}>
        Log out
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    gap: 20,
  },
  header: {
    gap: 4,
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
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  pendingBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: 14,
    padding: 14,
  },
  pendingText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  cards: {
    gap: 12,
  },
  logout: {
    textAlign: 'center',
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 'auto',
    paddingVertical: 12,
  },
});
