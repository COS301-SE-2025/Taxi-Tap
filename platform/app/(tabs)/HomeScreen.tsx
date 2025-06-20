import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { router, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import loading from '../../assets/images/loading4.png';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const routes = useQuery(api.functions.routes.displayRoutes.displayRoutes);
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  useEffect(() => {
   console.log('🚀 HomeScreen got userId:', userId);
  }, [userId]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  // For streaming raw GPS debug coords
  const [streamedCoords, setStreamedCoords] = useState<LatLng | null>(null);

  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Home" });
  }, [navigation]);

  // On mount: get initial location + reverse geocode
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = loc.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const placeName = `${place.name || ''} ${place.street || ''}, ${place.city || place.region || ''}`.trim();

      const currentLoc = {
        latitude,
        longitude,
        name: placeName || 'Unknown Location',
      };
      setCurrentLocation(currentLoc);

      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    })();
  }, []);

  // Start streaming GPS coordinates for debugging
  useEffect(() => {
    let subscriber: Location.LocationSubscription;
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        ({ coords }) => {
          setStreamedCoords({ latitude: coords.latitude, longitude: coords.longitude });
        }
      );
    })();

    return () => {
      subscriber?.remove();
    };
  }, []);

  const handleDestinationSelect = (route: {
    destination: string;
    start: string;
    startCoords: { latitude: number; longitude: number } | null;
    destinationCoords: { latitude: number; longitude: number } | null;
  }) => {
    if (!route.destinationCoords) {
      console.warn("No destination coordinates found");
      return;
    }
    const newDestination = {
      latitude: route.destinationCoords.latitude,
      longitude: route.destinationCoords.longitude,
      name: route.destination,
    };
    setDestination(newDestination);
    mapRef.current?.animateToRegion(
      { latitude: newDestination.latitude, longitude: newDestination.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      1000
    );
    setTimeout(() => {
      router.push({
        pathname: './TaxiInformation',
        params: {
          destinationName: newDestination.name,
          destinationLat: newDestination.latitude.toString(),
          destinationLng: newDestination.longitude.toString(),
          currentName: currentLocation?.name || '',
          currentLat: currentLocation?.latitude.toString() || '',
          currentLng: currentLocation?.longitude.toString() || '',
        }
      });
    }, 1500);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    map: { height: '40%' },
    bottomSheet: {
      flex: 1,
      backgroundColor: theme.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 16,
      paddingTop: 24,
    },
    debugBox: {
      padding: 8,
      backgroundColor: isDark ? '#333' : '#eee',
      margin: 8,
      borderRadius: 6,
    },
    debugText: { color: isDark ? '#fff' : '#000', fontSize: 12 },
    // ... (rest of your existing styles)
  });

  return (
    <View style={styles.container}>
      {!currentLocation ? (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <Image source={loading} style={{ width: 120, height: 120 }} resizeMode="contain" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={isDark ? darkMapStyle : []}
        >
          <Marker coordinate={currentLocation} title="You are here" pinColor="blue" />
          {destination && (
            <Marker coordinate={destination} title={destination.name} pinColor="orange" />
          )}
        </MapView>
      )}

      {/* Debug: streamed coordinates */}
      {streamedCoords && (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Streaming GPS → Lat: {streamedCoords.latitude.toFixed(6)}, Lng: {streamedCoords.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Bottom section (saved routes, location box, etc.) */}
      <View style={styles.bottomSheet}>
        {/* ... your existing bottom sheet UI ... */}
        <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 8 }}>
          Recently Used Taxi Ranks
        </Text>
        <ScrollView>
          {routes?.map((route, idx) => (
            <TouchableOpacity key={idx} onPress={() => handleDestinationSelect(route)}>
              <View style={{ padding: 12, backgroundColor: theme.card, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{route.destination}</Text>
                <Text style={{ color: theme.textSecondary }}>Pickup: {route.start}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// Dark map style for better dark mode experience (Google Maps compatible)
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];