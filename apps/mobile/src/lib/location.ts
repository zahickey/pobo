import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Fallback per the brief's launch city (San Francisco) when location is
// denied or unavailable — "let the user pick a neighborhood / pan the map"
// is not yet built; panning the map already works via react-native-maps'
// default gestures, so this just needs a sane starting center.
export const SF_CENTER = { latitude: 37.7749, longitude: -122.4194 };

export type UserLocation = { latitude: number; longitude: number };

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== 'granted') {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;

        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      } catch {
        // No GPS fix available (indoors, simulator with no location set, etc.)
        // — fall back to the default center rather than leaving the caller
        // stuck loading forever.
        if (!cancelled) setLocation(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { location, permissionDenied, loading };
}

// Haversine distance in miles — good enough for sorting a city-sized list;
// a real bounding-box map query is the fast-follow once this needs to scale.
export function distanceMiles(a: UserLocation, b: UserLocation): number {
  const R = 3958.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
