import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  progress: number; // 0 to 1
  color?: string;
}

export function ProgressBar({ progress, color = colors.primary }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
