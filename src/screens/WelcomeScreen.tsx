import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.mascot}>🦉</Text>
        <Text style={styles.title}>Review Buddy</Text>
        <Text style={styles.subtitle}>Your friendly Grade 1 Exam Reviewer</Text>
        <Text style={styles.eyebrow}>Special Science Elementary School</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Start" onPress={() => navigation.navigate('LearnerAuth')} />
        <Text style={styles.teacherLink} onPress={() => navigation.navigate('TeacherAuth')}>
          I'm a Teacher
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  mascot: {
    fontSize: 88,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  eyebrow: {
    marginTop: 24,
    fontSize: 12,
    fontWeight: '700',
    color: '#C7D2FE',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 16,
    alignItems: 'center',
  },
  teacherLink: {
    color: '#E0E7FF',
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
