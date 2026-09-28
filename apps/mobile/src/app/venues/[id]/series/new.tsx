import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { themes, typography, space, radius, minTouchTarget } from '@pobo/tokens';
import { supabase } from '../../../../lib/supabase';
import { useCategories } from '../../../../hooks/useCategories';

const DAYS: { value: string; label: string }[] = [
  { value: 'MO', label: 'Mon' },
  { value: 'TU', label: 'Tue' },
  { value: 'WE', label: 'Wed' },
  { value: 'TH', label: 'Thu' },
  { value: 'FR', label: 'Fri' },
  { value: 'SA', label: 'Sat' },
  { value: 'SU', label: 'Sun' },
];

export default function NewSeries() {
  const { id: venueId } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const { categories } = useCategories();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceText, setPriceText] = useState('');
  const [ageLimit, setAgeLimit] = useState('');
  const [days, setDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(''); // HH:MM 24h
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  function toggleDay(value: string) {
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function submit() {
    if (!categoryId || !title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{2}:\d{2}$/.test(startTime)) {
      Alert.alert('Missing info', 'Category, title, first date (YYYY-MM-DD) and start time (HH:MM) are required.');
      return;
    }
    const duration = Number(durationMinutes);
    if (Number.isNaN(duration) || duration <= 0) {
      Alert.alert('Missing info', 'Duration must be a number of minutes.');
      return;
    }

    setSaving(true);
    const rrule = days.length > 0 ? `FREQ=WEEKLY;BYDAY=${days.join(',')}` : null;

    const { error } = await supabase.from('event_series').insert({
      venue_id: venueId,
      category_id: categoryId,
      title: title.trim(),
      description: description.trim() || null,
      price_text: priceText.trim() || null,
      age_limit: ageLimit ? Number(ageLimit) : null,
      dtstart_local: `${startDate} ${startTime}:00`,
      duration_minutes: duration,
      timezone,
      rrule,
      status: 'active',
    });

    if (error) {
      setSaving(false);
      Alert.alert("Couldn't add event series", error.message);
      return;
    }

    // Best-effort — see apps/web/src/app/admin/actions.ts for the same
    // pattern and why it's non-fatal if unreachable in local dev.
    try {
      await supabase.functions.invoke('generate-occurrences', { method: 'POST' });
    } catch {
      // occurrences will still appear next time the function runs
    }

    setSaving(false);
    router.replace(`/venues/${venueId}`);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: t.text }]}>Add an event series</Text>

          <Text style={[styles.label, { color: t.textMuted }]}>Category *</Text>
          <View style={styles.chipRow}>
            {categories.map((c) => {
              const selected = c.id === categoryId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[styles.chip, { backgroundColor: selected ? t.primary : t.surface, borderColor: t.border }]}
                >
                  <Text style={{ color: selected ? t.onPrimary : t.text, fontFamily: 'InstrumentSans', fontSize: 14 }}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="Title *" value={title} onChangeText={setTitle} t={t} placeholder="Trivia Night" />
          <Field label="Description" value={description} onChangeText={setDescription} t={t} multiline />
          <View style={styles.row}>
            <Field label="Price" value={priceText} onChangeText={setPriceText} t={t} placeholder="Free / $5 cover" flex />
            <Field label="Age limit" value={ageLimit} onChangeText={setAgeLimit} t={t} keyboardType="number-pad" placeholder="21" flex />
          </View>

          <Text style={[styles.label, { color: t.textMuted }]}>Repeats on</Text>
          <View style={styles.chipRow}>
            {DAYS.map((d) => {
              const selected = days.includes(d.value);
              return (
                <Pressable
                  key={d.value}
                  onPress={() => toggleDay(d.value)}
                  style={[styles.chip, { backgroundColor: selected ? t.primary : t.surface, borderColor: t.border }]}
                >
                  <Text style={{ color: selected ? t.onPrimary : t.text, fontFamily: 'InstrumentSans', fontSize: 14 }}>{d.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.hint, { color: t.textMuted }]}>Leave all unselected for a one-off event.</Text>

          <View style={styles.row}>
            <Field label="First date * (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} t={t} placeholder="2026-10-07" flex />
            <Field label="Start time * (24h HH:MM)" value={startTime} onChangeText={setStartTime} t={t} placeholder="20:00" flex />
          </View>
          <Field label="Duration (minutes) *" value={durationMinutes} onChangeText={setDurationMinutes} t={t} keyboardType="number-pad" />
          <Field label="Timezone" value={timezone} onChangeText={setTimezone} t={t} />

          <Pressable disabled={saving} onPress={submit} style={[styles.submitButton, { backgroundColor: t.primary }]}>
            {saving ? <ActivityIndicator color={t.onPrimary} /> : <Text style={{ color: t.onPrimary, fontFamily: 'InstrumentSansSemiBold' }}>Add event series</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  t,
  placeholder,
  multiline,
  flex,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  t: { text: string; textMuted: string; border: string; surface: string };
  placeholder?: string;
  multiline?: boolean;
  flex?: boolean;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={[styles.field, flex && { flex: 1 }]}>
      <Text style={[styles.label, { color: t.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[
          styles.input,
          { color: t.text, borderColor: t.border, backgroundColor: t.surface },
          multiline && { minHeight: 80, textAlignVertical: 'top' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space.lg, gap: space.md },
  heading: { fontFamily: 'Gloock', fontSize: typography.size.headline, marginBottom: space.sm },
  row: { flexDirection: 'row', gap: space.md },
  field: { gap: 4 },
  label: { fontFamily: 'InstrumentSansSemiBold', fontSize: typography.size.meta },
  hint: { fontFamily: 'InstrumentSans', fontSize: 12, marginTop: -space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: { minHeight: 36, paddingHorizontal: space.md, justifyContent: 'center', borderRadius: 999, borderWidth: 1 },
  input: {
    minHeight: minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
  },
  submitButton: {
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.md,
  },
});
