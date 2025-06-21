import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
import { router, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import loading from '../../assets/images/loading4.png';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Get platform-specific API key
const GOOGLE_MAPS_API_KEY = Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
  : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

export default function HomeScreen() {
  const routes = useQuery(api.functions.routes.displayRoutes.displayRoutes);

  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<{
    latitude: number;
    longitude: number;
  }[]>([]);

  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeLoaded, setRouteLoaded] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Home",
    });
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
      }
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

  const getRoute = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured');
      Alert.alert('Error', 'Google Maps API key is not configured');
      return;
    }

    setIsLoadingRoute(true);
    setRouteLoaded(false);
    
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`;
      
      console.log('Fetching route from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Directions API response:', data);
      
      if (data.status !== 'OK') {
        throw new Error(`Directions API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        if (!route.overview_polyline || !route.overview_polyline.points) {
          throw new Error('No polyline data in route');
        }
        
        const decodedCoords = decodePolyline(route.overview_polyline.points);
        console.log('Decoded coordinates count:', decodedCoords.length);
        
        setRouteCoordinates(decodedCoords);
        const coordinates = [origin, destination, ...decodedCoords];
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
        
        setRouteLoaded(true);
      } else {
        throw new Error('No routes found');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Route Error', `Failed to get route: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (mapRef.current) {
        const coordinates = [origin, destination];
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const decodePolyline = (encoded: string) => {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        Alert.alert('Permission Denied', 'Location permission is required to show your current location');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        const { latitude, longitude } = location.coords;
        console.log('Current location:', { latitude, longitude });
        
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const placeName = `${place.name || ''} ${place.street || ''}, ${place.city || place.region || ''}`.trim();

        const currentLoc = {
          latitude,
          longitude,
          name: placeName || 'Unknown Location',
        };

        setCurrentLocation(currentLoc);
        setDestination(null);
        setRouteCoordinates([]);
        setRouteLoaded(false);

        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Location Error', 'Failed to get your current location');
      }
    })();
  }, []);

  const handleDestinationSelect = (route: {
    destination: string;
    start: string;
    startCoords: { latitude: number; longitude: number } | null;
    destinationCoords: { latitude: number; longitude: number } | null;
  }) => {
    if (!route.destinationCoords) {
      console.warn("No destination coordinates found");
      Alert.alert('Error', 'Destination coordinates not available');
      return;
    }

    if (!currentLocation) {
      console.warn("No current location available");
      Alert.alert('Error', 'Current location not available');
      return;
    }

    const newDestination = {
      latitude: route.destinationCoords.latitude,
      longitude: route.destinationCoords.longitude,
      name: route.destination,
    };

    setDestination(newDestination);
    getRoute(currentLocation, newDestination);
  };

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
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowRadius: 4,
      elevation: 4,
    },
    locationIndicator: {
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 5
    },
    currentLocationCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: isDark ? '#FFB84D' : '#FFB84D',
      marginBottom: 8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    currentLocationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary
    },
    dottedLineContainer: {
      height: 35,
      width: 1,
      marginBottom: 8,
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    dottedLineDot: {
      width: 2,
      height: 3,
      backgroundColor: theme.primary,
      borderRadius: 1
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
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
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
    }
  });

  return (
    <View style={dynamicStyles.container}>
      {!currentLocation ? (
        <View style={[dynamicStyles.map, dynamicStyles.loadingContainer]}>
          <Image
            source={loading}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={dynamicStyles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={isDark ? darkMapStyle : []}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
              title={destination.name}
              pinColor="orange"
            />
          )}
          {routeLoaded && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.primary}
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      <View style={dynamicStyles.bottomSheet}>
        <View style={dynamicStyles.locationBox}>
          <View style={dynamicStyles.locationIndicator}>
            <View style={dynamicStyles.currentLocationCircle}>
              <View style={dynamicStyles.currentLocationDot} />
            </View>
            
            <View style={dynamicStyles.dottedLineContainer}>
              {[...Array(8)].map((_, index) => (
                <View key={index} style={dynamicStyles.dottedLineDot} />
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
          {routes?.map((route, index) => (
            <TouchableOpacity
              key={index}
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

      {routeLoaded && !isLoadingRoute && (
        <Animated.View style={{ opacity: buttonOpacity }}>
          <TouchableOpacity 
            style={dynamicStyles.reserveButton}
            onPress={handleReserveSeat}
          >
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