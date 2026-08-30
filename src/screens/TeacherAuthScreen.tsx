import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { signInTeacher, signUpTeacher } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherAuth'>;

type Mode = 'login' | 'signup';

export function TeacherAuthScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !displayName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpTeacher(displayName, email, password, inviteCode);
      } else {
        await signInTeacher(email, password);
      }
      // AuthProvider's auth-state listener routes to the Teacher Dashboard automatically.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.mascot}>🍎</Text>
        <Text style={styles.title}>Teacher Portal</Text>
        <Text style={styles.subtitle}>
          {mode === 'signup'
            ? 'Create a teacher account to review content and track learner progress.'
            : 'Log in to manage practice sets and view learner progress.'}
        </Text>

        <View style={styles.tabs}>
          <Text
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => setMode('login')}
          >
            Log In
          </Text>
          <Text
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => setMode('signup')}
          >
            Sign Up
          </Text>
        </View>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Teacher invite code"
            placeholderTextColor={colors.textMuted}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton
          label={submitting ? 'Please wait...' : mode === 'signup' ? 'Create Teacher Account' : 'Log In'}
          onPress={handleSubmit}
        />
        <Text style={styles.backLink} onPress={() => navigation.goBack()}>
          Back
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    gap: 12,
    alignItems: 'stretch',
  },
  mascot: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    fontWeight: '700',
    color: colors.textMuted,
    overflow: 'hidden',
  },
  tabActive: {
    backgroundColor: colors.primary,
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  backLink: {
    textAlign: 'center',
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 8,
  },
});
