import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { signInLearner, signUpLearner } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'LearnerAuth'>;

type Mode = 'login' | 'signup';

export function LearnerAuthScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>('signup');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (mode === 'signup' && !displayName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!pin.trim()) {
      setError('Please enter your 6-digit PIN.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpLearner(displayName, username, pin);
      } else {
        await signInLearner(username, pin);
      }
      // AuthProvider's auth-state listener routes to Home automatically.
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
        <Text style={styles.mascot}>🦉</Text>
        <Text style={styles.title}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back!'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signup'
            ? "Pick a username and 6-digit PIN so Review Buddy remembers your progress."
            : 'Log in with your username and PIN.'}
        </Text>

        <View style={styles.tabs}>
          <Text
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => setMode('signup')}
          >
            Create Account
          </Text>
          <Text
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => setMode('login')}
          >
            Log In
          </Text>
        </View>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Your name (e.g. Miguel)"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="6-digit PIN"
          placeholderTextColor={colors.textMuted}
          value={pin}
          onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton
          label={submitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
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
