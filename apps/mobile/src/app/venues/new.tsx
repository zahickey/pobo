import { useState } from 'react';
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
import { router } from 'expo-router';
import { themes, typography, space, radius, minTouchTarget, type SemanticTokens } from '@pobo/tokens';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewVenue() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const { session } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!session) return;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!name.trim() || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      Alert.alert('Missing info', 'Name, latitude and longitude are required.');
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from('venues')
      .insert({
        name: name.trim(),
        slug: slugify(name),
        address: address.trim() || null,
        neighborhood: neighborhood.trim() || null,
        timezone,
        description: description.trim() || null,
        website: website.trim() || null,
        instagram: instagram.trim() || null,
        location: `SRID=4326;POINT(${lngNum} ${latNum})`,
        created_by: session.user.id,
      })
      .select('id')
      .single();
    setSaving(false);

    if (error || !data) {
      Alert.alert("Couldn't add venue", error?.message ?? 'Unknown error');
      return;
    }
    router.replace(`/venues/${data.id}`);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: t.text }]}>Add a venue</Text>

          <Field label="Name *" value={name} onChangeText={setName} t={t} />
          <Field label="Address" value={address} onChangeText={setAddress} t={t} placeholder="628 Divisadero St, San Francisco, CA" />
          <Field label="Neighborhood" value={neighborhood} onChangeText={setNeighborhood} t={t} placeholder="NoPa" />
          <View style={styles.row}>
            <Field label="Latitude *" value={lat} onChangeText={setLat} t={t} keyboardType="numbers-and-punctuation" flex placeholder="37.7756" />
            <Field label="Longitude *" value={lng} onChangeText={setLng} t={t} keyboardType="numbers-and-punctuation" flex placeholder="-122.4376" />
          </View>
          <Text style={[styles.hint, { color: t.textMuted }]}>
            No geocoding hooked up yet — right-click the spot on Google Maps and copy the coordinates.
          </Text>
          <Field label="Timezone" value={timezone} onChangeText={setTimezone} t={t} />
          <Field label="Website" value={website} onChangeText={setWebsite} t={t} keyboardType="url" autoCapitalize="none" />
          <Field label="Instagram" value={instagram} onChangeText={setInstagram} t={t} autoCapitalize="none" />
          <Field label="Description" value={description} onChangeText={setDescription} t={t} multiline />

          <Pressable disabled={saving} onPress={submit} style={[styles.submitButton, { backgroundColor: t.primary }]}>
            {saving ? <ActivityIndicator color={t.onPrimary} /> : <Text style={{ color: t.onPrimary, fontFamily: 'InstrumentSansSemiBold' }}>Add venue</Text>}
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
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  t: SemanticTokens;
  placeholder?: string;
  multiline?: boolean;
  flex?: boolean;
  keyboardType?: 'default' | 'numbers-and-punctuation' | 'url';
  autoCapitalize?: 'none' | 'sentences';
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
        autoCapitalize={autoCapitalize}
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
