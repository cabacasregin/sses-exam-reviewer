import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface SetSummary {
  title: string;
  questionCount: number;
}

interface ProgressSummary {
  bestScore: number;
  bestTotal: number;
}

interface Props {
  set: SetSummary;
  accentColor: string;
  progress: ProgressSummary | null | undefined;
  onPress: () => void;
}

export function SetCard({ set, accentColor, progress, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.textWrap}>
        <Text style={styles.title}>{set.title}</Text>
        <Text style={styles.meta}>{set.questionCount} questions</Text>
      </View>
      {progress ? (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>
            {progress.bestScore}/{progress.bestTotal}
          </Text>
        </View>
      ) : (
        <View style={[styles.badge, styles.badgeNew]}>
          <Text style={styles.badgeNewText}>New</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 52,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  badgeNew: {
    backgroundColor: colors.border,
  },
  badgeNewText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
});
