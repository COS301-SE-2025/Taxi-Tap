
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
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import loading from '../../assets/images/loading4.png';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useLocationSystem } from '../../hooks/useLocationSystem';

export default function HomeScreen() {
  // 1) Pull userId from the URL params
  const { userId } = useLocalSearchParams<{ userId: string }>();
  useEffect(() => {
  console.log('🚀 HomeScreen got userId:', userId);
}, []);

  // 2) Start sending location → Convex every 5s, and get back nearby taxis
  const { userLocation, nearbyTaxis } = useLocationSystem(userId || '');

  // 3) Log each time our location updates
  useEffect(() => {
    if (userLocation) {
      console.log('✅ Sent location to Convex:', userLocation);
    }
  }, [userLocation]);

  // 4) Log whenever nearby taxis list changes
  useEffect(() => {
    if (nearbyTaxis) {
      console.log('👀 Nearby taxis:', nearbyTaxis);
    }
  }, [nearbyTaxis]);

  // still grab your saved‐routes
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

  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Home' });
  }, [navigation]);

  // get & reverse-geocode initial position
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = loc.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const placeName = `${place.name||''} ${place.street||''}, ${place.city||place.region||''}`.trim() || 'Unknown Location';
      setCurrentLocation({ latitude, longitude, name: placeName });
      mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
    })();
  }, []);

  const handleDestinationSelect = (route: any) => {
    if (!route.destinationCoords) return;
    const newDest = {
      latitude: route.destinationCoords.latitude,
      longitude: route.destinationCoords.longitude,
      name: route.destination,
    };
    setDestination(newDest);
    mapRef.current?.animateToRegion({ ...newDest, latitudeDelta:0.01, longitudeDelta:0.01 }, 1000);
    setTimeout(() => {
      router.push({
        pathname: './TaxiInformation',
        params: {
          destinationName: newDest.name,
          destinationLat: newDest.latitude.toString(),
          destinationLng: newDest.longitude.toString(),
          currentName: currentLocation?.name||'',
          currentLat: currentLocation?.latitude.toString()||'',
          currentLng: currentLocation?.longitude.toString()||'',
        }
      });
    }, 1500);
  };

  const styles = StyleSheet.create({
    container: { flex:1, backgroundColor:theme.background },
    map: { height:'40%' },
    bottomSheet: {
      flex:1,
      backgroundColor:theme.background,
      borderTopLeftRadius:25,
      borderTopRightRadius:25,
      padding:16,
      paddingTop:24
    }
  });

  return (
    <View style={styles.container}>
      {!currentLocation ? (
        <View style={[styles.map, { justifyContent:'center', alignItems:'center' }]}>
          <Image source={loading} style={{ width:120, height:120 }} resizeMode="contain"/>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude:currentLocation.latitude,
            longitude:currentLocation.longitude,
            latitudeDelta:0.01,
            longitudeDelta:0.01
          }}
          customMapStyle={isDark?darkMapStyle:[]}
        >
          <Marker coordinate={currentLocation} title="You are here" pinColor="blue"/>
          {destination && (
            <Marker coordinate={destination} title={destination.name} pinColor="orange"/>
          )}
        </MapView>
      )}

      <View style={styles.bottomSheet}>
        <Text style={{ color:theme.text, fontWeight:'bold', marginBottom:8 }}>
          Recently Used Taxi Ranks
        </Text>
        <ScrollView>
          {routes?.map((route:any,i:number)=>(
            <TouchableOpacity key={i} onPress={()=>handleDestinationSelect(route)}>
              <View style={{
                padding:12,
                backgroundColor:theme.card,
                borderRadius:8,
                marginBottom:12
              }}>
                <Text style={{ color:theme.text, fontWeight:'bold' }}>
                  {route.destination}
                </Text>
                <Text style={{ color:theme.textSecondary }}>
                  Pickup: {route.start}
                </Text>
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