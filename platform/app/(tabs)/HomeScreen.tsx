import React, { useRef, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapStyleElement } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { router, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import loading from '../../assets/images/loading4.png';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useLocationSystem } from '../../hooks/useLocationSystem';

export default function HomeScreen() {
  const TEST_USER_ID = "jx7ed8jjcf4jen2t6f4rxdd5as7j4tr2";
  const { userLocation, nearbyTaxis } = useLocationSystem(TEST_USER_ID);
  const routes = useQuery(api.functions.routes.displayRoutes.displayRoutes);

  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Home" });
  }, [navigation]);

  const handleDestinationSelect = (route: {
    destination: string;
    start: string;
    startCoords: { latitude: number; longitude: number } | null;
    destinationCoords: { latitude: number; longitude: number } | null;
  }) => {
    if (!route.destinationCoords) return;

    const newDestination = {
      latitude: route.destinationCoords.latitude,
      longitude: route.destinationCoords.longitude,
      name: route.destination,
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

    setTimeout(() => {
      router.push({
        pathname: './TaxiInformation',
        params: {
          destinationName: newDestination.name,
          destinationLat: newDestination.latitude.toString(),
          destinationLng: newDestination.longitude.toString(),
          currentName: "Your Location",
          currentLat: userLocation?.latitude.toString() || '',
          currentLng: userLocation?.longitude.toString() || '',
        }
      });
    }, 1500);
  };

  const dynamicStyles = StyleSheet.create({
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
      paddingTop: 5
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
    locationTextContainer: { flex: 1 },
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
      {!userLocation ? (
        <View style={[dynamicStyles.map, dynamicStyles.loadingContainer]}>
          <Image source={loading} style={{ width: 120, height: 120 }} resizeMode="contain" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={dynamicStyles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={isDark ? darkMapStyle : []}
        >
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="blue"
          />
          {destination && (
            <Marker
              coordinate={destination}
              title={destination.name}
              pinColor="orange"
            />
          )}
          {nearbyTaxis?.map((taxi) => (
            <Marker
              key={taxi._id.toString()}
              coordinate={{ latitude: taxi.latitude, longitude: taxi.longitude }}
              title="Nearby Taxi"
              pinColor="green"
            />
          ))}
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
            <Icon name="location" size={18} color={isDark ? theme.text : "#121212"} />
          </View>
          <View style={dynamicStyles.locationTextContainer}>
            <Text style={dynamicStyles.currentLocationText}>
              {userLocation ? 'Your Location' : 'Getting current location...'}
            </Text>
            <View style={dynamicStyles.locationSeparator} />
            <Text style={dynamicStyles.destinationText}>
              {destination ? destination.name : 'No destination selected'}
            </Text>
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
    </View>
  );
}

// ✅ Fixed typing for dark map style
const darkMapStyle: MapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }]
  },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];
