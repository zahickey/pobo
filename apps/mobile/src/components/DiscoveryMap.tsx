import { StyleSheet, View, useColorScheme } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { themes, radius } from '@pobo/tokens';
import type { OccurrenceListItem } from '../hooks/useOccurrences';
import { isLiveNow } from '../lib/time';
import { SF_CENTER, type UserLocation } from '../lib/location';

interface Props {
  occurrences: OccurrenceListItem[];
  userLocation: UserLocation | null;
  onSelect: (occurrenceId: string) => void;
}

// One pin per occurrence (not per venue) — a venue with several listed events
// will show overlapping pins for now; clustering is a follow-up once this
// needs to handle a denser map. Pin color follows the brand guide: blue by
// default, pink when live (no pulse animation yet — see brief's "Map pins").
export function DiscoveryMap({ occurrences, userLocation, onSelect }: Props) {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const center = userLocation ?? SF_CENTER;

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
      >
        {occurrences
          .filter((o) => o.venue.lat && o.venue.lng)
          .map((o) => {
            const live = isLiveNow(o.starts_at, o.ends_at);
            return (
              <Marker
                key={o.id}
                coordinate={{ latitude: o.venue.lat!, longitude: o.venue.lng! }}
                onPress={() => onSelect(o.id)}
              >
                <View
                  style={[
                    styles.pin,
                    { backgroundColor: live ? t.live : t.primary, borderColor: t.bg },
                  ]}
                />
              </Marker>
            );
          })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});
