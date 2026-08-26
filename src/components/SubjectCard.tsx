import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Subject } from '../data/types';
import { SubjectProgress } from '../utils/storage';

interface Props {
  subject: Subject;
  accentColor: string;
  progress: SubjectProgress | null | undefined;
  onPress: () => void;
}

export function SubjectCard({ subject, accentColor, progress, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor + '22' }]}>
        <Text style={styles.icon}>{subject.emoji}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{subject.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {subject.description}
        </Text>
        <Text style={styles.meta}>{subject.questions.length} questions</Text>
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
    borderRadius: 18,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
