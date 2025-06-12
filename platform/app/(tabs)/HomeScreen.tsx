import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { router, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import loading from '../../assets/images/loading4.png';

export default function HomeScreen() {
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

  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Home",
    });
  }, [navigation]);

  // Get current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const { latitude, longitude } = location.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const placeName = `${place.name || ''} ${place.street || ''}, ${place.city || place.region || ''}`.trim();

      const currentLoc = {
        latitude,
        longitude,
        name: placeName || 'Unknown Location',
      };

      setCurrentLocation(currentLoc);
      setDestination(null);

      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    })();
  }, []);

  // Navigate to TaxiInformation after destination selection
  const handleDestinationSelect = (route: {
    coords: { latitude: number; longitude: number };
    title: string;
    subtitle?: string;
  }) => {
    const newDestination = {
      latitude: route.coords.latitude,
      longitude: route.coords.longitude,
      name: route.title,
    };

    setDestination(newDestination);

    mapRef.current?.animateToRegion(
      {
        latitude: newDestination.latitude,
        longitude: newDestination.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );

    // Navigate to TaxiInformation after a short delay to show the map animation
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

  // Create dynamic styles based on theme
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
    }
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Map Section */}
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
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          // Use dark map style when in dark mode
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
        </MapView>
      )}

      {/* Bottom Section */}
      <View style={dynamicStyles.bottomSheet}>
        {/* Location Box */}
        <View style={dynamicStyles.locationBox}>
          {/* Current Location and Destination indicators */}
          <View style={dynamicStyles.locationIndicator}>
            {/* Current Location Circle */}
            <View style={dynamicStyles.currentLocationCircle}>
              <View style={dynamicStyles.currentLocationDot} />
            </View>
            
            {/* Dotted Line Container */}
            <View style={dynamicStyles.dottedLineContainer}>
              {[...Array(8)].map((_, index) => (
                <View key={index} style={dynamicStyles.dottedLineDot} />
              ))}
            </View>
            
            {/* Destination Pin */}
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
          </View>
        </View>

        {/* Saved Routes */}
        <Text style={dynamicStyles.savedRoutesTitle}>Recently Used Taxi Ranks</Text>
        <ScrollView style={{ marginTop: 10 }}>
          {[
            {
              title: 'Bosman Taxi Rank',
              subtitle: 'Pretoria Central, 0002',
              coords: { latitude: -25.746111, longitude: 28.187222 },
            },
            {
              title: 'Menlyn Taxi Rank',
              subtitle: 'Menlyn Park Shopping Center, 0181',
              coords: { latitude: -25.7824, longitude: 28.2753 },
            },
            {
              title: 'Corner prospect & Hilda',
              subtitle: '',
              coords: { latitude: -25.754, longitude: 28.234 },
            },
          ].map((route, index) => (
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
                <Text style={dynamicStyles.routeTitle}>{route.title}</Text>
                <Text style={dynamicStyles.routeSubtitle}>{route.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// Dark map style for better dark mode experience
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