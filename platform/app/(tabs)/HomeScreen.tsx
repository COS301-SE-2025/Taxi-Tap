// platform/app/(tabs)/HomeScreen.tsx
import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useMapContext, createRouteKey } from '../../contexts/MapContext';
import loading from '../../assets/images/loading4.png';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useLocationSystem } from '../../hooks/useLocationSystem';

const GOOGLE_MAPS_API_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

export default function HomeScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  useEffect(() => {
    console.log('🚀 HomeScreen got userId:', userId);
  }, [userId]);

  const [snapshotDrivers, setSnapshotDrivers] = useState<
  { _id: string; latitude: number; longitude: number }[]
>([]);

  const { userLocation, nearbyTaxis } = useLocationSystem(userId || '');
  useEffect(() => {
    if (userLocation) {
      console.log('✅ Live-location sent:', userLocation);
    }
  }, [userLocation]);

useEffect(() => {
  if (nearbyTaxis && nearbyTaxis.length) {
    console.log(`🚖 Nearby drivers (${nearbyTaxis.length}):`, nearbyTaxis);
  }
}, [nearbyTaxis]);

useEffect(() => {
  if (nearbyTaxis?.length && snapshotDrivers.length === 0) {
    setSnapshotDrivers(nearbyTaxis);
  }
}, [nearbyTaxis, snapshotDrivers.length]);

  const routes = useQuery(api.functions.routes.displayRoutes.displayRoutes);
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const {
    currentLocation,
    destination,
    routeCoordinates,
    isLoadingRoute,
    routeLoaded,
    setCurrentLocation,
    setDestination,
    setRouteCoordinates,
    setIsLoadingRoute,
    setRouteLoaded,
    getCachedRoute,
    setCachedRoute,
  } = useMapContext();

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Home' });
  }, [navigation]);

  const handleReserveSeat = () => {
    if (!destination || !currentLocation) {
      Alert.alert('Error', 'Please select a destination first');
      return;
    }

    router.push({
      pathname: './TaxiInformation',
      params: {
        destinationName: destination.name,
        destinationLat: destination.latitude.toString(),
        destinationLng: destination.longitude.toString(),
        currentName: currentLocation.name,
        currentLat: currentLocation.latitude.toString(),
        currentLng: currentLocation.longitude.toString(),
      },
    });
  };

  useEffect(() => {
    if (routeLoaded) {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      buttonOpacity.setValue(0);
    }
  }, [routeLoaded]);

  const getRoute = async (
    origin: { latitude: number; longitude: number },
    dest: { latitude: number; longitude: number }
  ) => {
    if (!GOOGLE_MAPS_API_KEY) {
      Alert.alert('Error', 'Google Maps API key is not configured');
      return;
    }

    const cacheKey = createRouteKey(
      { ...origin, name: '' },
      { ...dest, name: '' }
    );

    const cached = getCachedRoute(cacheKey);
    if (cached) {
      setRouteCoordinates(cached);
      setRouteLoaded(true);
      return;
    }

    setIsLoadingRoute(true);
    setRouteLoaded(false);

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${dest.latitude},${dest.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== 'OK') throw new Error(data.error_message || data.status);

      const points = decodePolyline(data.routes[0].overview_polyline.points);
      setCachedRoute(cacheKey, points);
      setRouteCoordinates(points);

      mapRef.current?.fitToCoordinates([origin, dest, ...points], {
        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
      setRouteLoaded(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Route Error', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const decodePolyline = (encoded: string) => {
    let idx = 0,
      lat = 0,
      lng = 0,
      pts: { latitude: number; longitude: number }[] = [];

    while (idx < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(idx++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(idx++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      pts.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return pts;
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const [place] = await Location.reverseGeocodeAsync(loc.coords);
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        name:
          `${place.name || ''} ${place.street || ''}, ${place.city || place.region || ''}`.trim() ||
          'Unknown Location',
      });

      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    })();
  }, []);

  const handleDestinationSelect = (route: {
    destination: string;
    destinationCoords: { latitude: number; longitude: number } | null;
  }) => {
    if (!route.destinationCoords || !currentLocation) return;
    const dest = {
      latitude: route.destinationCoords.latitude,
      longitude: route.destinationCoords.longitude,
      name: route.destination,
    };
    setDestination(dest);
    getRoute(currentLocation, dest);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    map: { height: '40%' },
  });

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    map: {
      height: '40%',
    },
    bottomSheet: {
      flex: 1,
      backgroundColor: theme.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 16,
      paddingTop: 24,
    },
    locationBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.surface : "#ECD9C3",
      borderColor: isDark ? theme.border : "#D4A57D",
      borderRadius: 20,
      borderWidth: 1,
      paddingVertical: 11,
      paddingHorizontal: 13,
      marginBottom: 36,
      width: '100%',
      alignSelf: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
    },
    locationIndicator: {
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 5,
    },
    currentLocationCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: '#FFB84D',
      marginBottom: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    currentLocationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
    },
    dottedLineContainer: {
      height: 35,
      width: 1,
      marginBottom: 8,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dottedLineDot: {
      width: 2,
      height: 3,
      backgroundColor: theme.primary,
      borderRadius: 1,
    },
    locationTextContainer: {
      flex: 1,
    },
    currentLocationText: {
      color: isDark ? theme.primary : "#A66400",
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 17,
    },
    locationSeparator: {
      height: 1,
      backgroundColor: isDark ? theme.border : "#D4A57D",
      marginBottom: 19,
      marginHorizontal: 2,
    },
    destinationText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 2,
    },
    savedRoutesTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 8,
      color: theme.text,
    },
    routeCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 12,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? theme.border : 'transparent',
    },
    routeTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      color: theme.text,
    },
    routeSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    routeLoadingText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 4,
    },
    reserveButton: {
      position: 'absolute',
      bottom: 80,
      left: 20,
      right: 20,
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 5,
    },
    reserveButtonText: {
      color: theme.buttonText || '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={s.container}>
      {!currentLocation ? (
        <View style={[s.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <Image source={loading} style={{ width: 120, height: 120 }} resizeMode="contain" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={s.map}
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
          
                {snapshotDrivers.map((driver) => (
        <Marker
          key={driver._id}
          coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
          pinColor="green"
          tracksViewChanges={false}
          title="Driver"
        />
      ))}
          {destination && (
            <Marker coordinate={destination} title={destination.name} pinColor="orange" />
          )}
          {routeLoaded && routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeColor={theme.primary} strokeWidth={4} />
          )}
        </MapView>
      )}

      {/* Dynamic Bottom Sheet */}
      <View style={dynamicStyles.bottomSheet}>
        <View style={dynamicStyles.locationBox}>
          <View style={dynamicStyles.locationIndicator}>
            <View style={dynamicStyles.currentLocationCircle}>
              <View style={dynamicStyles.currentLocationDot} />
            </View>
            <View style={dynamicStyles.dottedLineContainer}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={dynamicStyles.dottedLineDot} />
              ))}
            </View>
            <Icon
              name="location"
              size={18}
              color={isDark ? theme.text : "#121212"}
            />
          </View>
          <View style={dynamicStyles.locationTextContainer}>
            <Text style={dynamicStyles.currentLocationText}>
              {currentLocation ? currentLocation.name : 'Getting current location...'}
            </Text>
            <View style={dynamicStyles.locationSeparator} />
            <Text style={dynamicStyles.destinationText}>
              {destination ? destination.name : 'No destination selected'}
            </Text>
            {isLoadingRoute && (
              <Text style={dynamicStyles.routeLoadingText}>
                Loading route...
              </Text>
            )}
            {routeLoaded && !isLoadingRoute && (
              <Text style={[dynamicStyles.routeLoadingText, { color: theme.primary }]}>
                Route loaded ✓
              </Text>
            )}
          </View>
        </View>

        <Text style={dynamicStyles.savedRoutesTitle}>Recently Used Taxi Ranks</Text>
        <ScrollView style={{ marginTop: 10 }}>
          {routes?.map((route, idx) => (
            <TouchableOpacity
              key={idx}
              style={dynamicStyles.routeCard}
              onPress={() => handleDestinationSelect(route)}
            >
              <Icon
                name="location-sharp"
                size={20}
                color={theme.primary}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.routeTitle}>{route.destination}</Text>
                <Text style={dynamicStyles.routeSubtitle}>Pickup: {route.start}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reserve a Seat Button */}
      {routeLoaded && !isLoadingRoute && (
        <Animated.View style={{ opacity: buttonOpacity }}>
          <TouchableOpacity style={dynamicStyles.reserveButton} onPress={handleReserveSeat}>
            <Text style={dynamicStyles.reserveButtonText}>Reserve a Seat</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

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