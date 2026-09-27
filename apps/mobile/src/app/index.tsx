import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { themes, typography, space, radius } from '@pobo/tokens';

// Scaffold screen — proves fonts, tokens and Expo Router are wired up.
// Replace with the map / discovery view (see roadmap Step 4).
export default function Index() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <Text style={[styles.wordmark, { color: t.primary }]}>PoBo</Text>
      <Text style={[styles.tagline, { color: t.textMuted }]}>Your city's poster board.</Text>

      <View style={[styles.chip, { backgroundColor: t.live }]}>
        <Text style={[styles.chipLabel, { color: t.onLive }]}>LIVE NOW</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  wordmark: {
    fontFamily: 'Gloock',
    fontSize: typography.size.headline,
  },
  tagline: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
  },
  chip: {
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
  },
  chipLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.label,
    letterSpacing: 0.5,
  },
});
