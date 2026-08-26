import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  letter: string;
  onPress: () => void;
  state: 'idle' | 'correct' | 'incorrect' | 'reveal-correct' | 'disabled';
}

export function OptionButton({ label, letter, onPress, state }: Props) {
  const isInteractive = state === 'idle';

  return (
    <Pressable
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        state === 'correct' && styles.correct,
        state === 'incorrect' && styles.incorrect,
        state === 'reveal-correct' && styles.revealCorrect,
        pressed && isInteractive && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.letter,
          (state === 'correct' || state === 'reveal-correct') && styles.letterOnColor,
          state === 'incorrect' && styles.letterOnColor,
        ]}
      >
        {letter}
      </Text>
      <Text
        style={[
          styles.label,
          (state === 'correct' || state === 'reveal-correct' || state === 'incorrect') &&
            styles.labelOnColor,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  correct: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  incorrect: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  revealCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    backgroundColor: colors.background,
    fontWeight: '700',
    color: colors.text,
    overflow: 'hidden',
  },
  letterOnColor: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    color: colors.text,
    flexShrink: 1,
    fontWeight: '600',
  },
  labelOnColor: {
    color: '#FFFFFF',
  },
});
