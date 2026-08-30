import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { getLearnerName, saveLearnerName } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    getLearnerName().then((savedName) => {
      if (savedName) setName(savedName);
    });
  }, []);

  async function handleConfirm() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await saveLearnerName(trimmedName);
    setModalVisible(false);
    navigation.replace('Home');
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.mascot}>🦉</Text>
        <Text style={styles.title}>Review Buddy</Text>
        <Text style={styles.subtitle}>Your friendly Grade 1 Exam Reviewer</Text>
        <Text style={styles.eyebrow}>Special Science Elementary School</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Start" onPress={() => setModalVisible(true)} />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>What's your name?</Text>
            <Text style={styles.modalSubtitle}>Review Buddy would like to know who's learning today.</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              onSubmitEditing={handleConfirm}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <PrimaryButton label="Let's Go!" onPress={handleConfirm} style={styles.confirmButton} />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
