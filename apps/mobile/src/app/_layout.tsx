import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Gloock_400Regular } from '@expo-google-fonts/gloock';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import { themes } from '@pobo/tokens';
import { AuthProvider } from '../lib/auth';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const tokens = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  const [fontsLoaded] = useFonts({
    Gloock: Gloock_400Regular,
    InstrumentSans: InstrumentSans_400Regular,
    InstrumentSansMedium: InstrumentSans_500Medium,
    InstrumentSansSemiBold: InstrumentSans_600SemiBold,
    InstrumentSansBold: InstrumentSans_700Bold,
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTitle: '',
            headerShadowVisible: false,
            headerBackTitle: '',
            headerStyle: { backgroundColor: tokens.bg },
            headerTintColor: tokens.primary,
            contentStyle: { backgroundColor: tokens.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
