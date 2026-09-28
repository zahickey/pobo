import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { themes, typography, space, radius, minTouchTarget } from '@pobo/tokens';
import { supabase } from '../lib/supabase';

type Stage = 'email' | 'code';

// Sign-in with Apple / Google (roadmap Step 4's remaining piece). Apple and
// Google both need external developer accounts we don't have yet (see
// POBO_PRODUCT_BRIEF.md §3) — those buttons are real UI, honestly labeled,
// rather than wired to native SDKs that can't be verified without
// credentials only the account owner can create. Email OTP is fully live.
export default function SignIn() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function notConfigured(provider: 'Apple' | 'Google') {
    Alert.alert(
      `Sign in with ${provider}`,
      provider === 'Apple'
        ? 'Needs an Apple Developer account ($99/yr) to enable — not set up yet.'
        : 'Needs a Google Cloud OAuth client — not set up yet.',
    );
  }

  async function sendCode() {
    if (!email.includes('@')) {
      Alert.alert('Enter a valid email');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSubmitting(false);
    if (error) {
      Alert.alert("Couldn't send code", error.message);
      return;
    }
    setStage('code');
  }

  async function verifyCode() {
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    setSubmitting(false);
    if (error) {
      Alert.alert("That code didn't work", error.message);
      return;
    }
    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={[styles.wordmark, { color: t.primary }]}>PoBo</Text>
          <Text style={[styles.heading, { color: t.text }]}>Sign in</Text>

          <Pressable
            onPress={() => notConfigured('Apple')}
            style={[styles.providerButton, { backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : t.text }]}
          >
            <Text style={[styles.providerLabel, { color: colorScheme === 'dark' ? '#000000' : t.bg }]}>
              Sign in with Apple
            </Text>
          </Pressable>

          <Pressable
            onPress={() => notConfigured('Google')}
            style={[styles.providerButton, { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }]}
          >
            <Text style={[styles.providerLabel, { color: t.text }]}>Sign in with Google</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
            <Text style={[styles.dividerLabel, { color: t.textMuted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
          </View>

          {stage === 'email' ? (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={t.textMuted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.surface }]}
              />
              <Pressable
                disabled={submitting}
                onPress={sendCode}
                style={[styles.primaryButton, { backgroundColor: t.primary }]}
              >
                {submitting ? (
                  <ActivityIndicator color={t.onPrimary} />
                ) : (
                  <Text style={[styles.primaryLabel, { color: t.onPrimary }]}>Send code</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.meta, { color: t.textMuted }]}>Enter the code we sent to {email}.</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor={t.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.surface }]}
              />
              <Pressable
                disabled={submitting}
                onPress={verifyCode}
                style={[styles.primaryButton, { backgroundColor: t.primary }]}
              >
                {submitting ? (
                  <ActivityIndicator color={t.onPrimary} />
                ) : (
                  <Text style={[styles.primaryLabel, { color: t.onPrimary }]}>Verify</Text>
                )}
              </Pressable>
              <Pressable onPress={() => setStage('email')} style={styles.linkButton}>
                <Text style={[styles.linkLabel, { color: t.primary }]}>Use a different email</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  wordmark: {
    fontFamily: 'Gloock',
    fontSize: typography.size.title,
    textAlign: 'center',
  },
  heading: {
    fontFamily: 'Gloock',
    fontSize: typography.size.headline,
    textAlign: 'center',
    marginBottom: space.md,
  },
  providerButton: {
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.body,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginVertical: space.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.meta,
  },
  input: {
    minHeight: minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
  },
  primaryButton: {
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.body,
  },
  meta: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.meta,
    textAlign: 'center',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  linkLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.meta,
  },
});
