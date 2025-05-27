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
import { router, useNavigation  } from 'expo-router';

export default function HomeScreen() {
  const navigation = useNavigation();

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
  });

  // Get current location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
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
  const handleDestinationSelect = (route) => {
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

  return (
    <View style={styles.container}>
      {/* Map Section */}
      {!currentLocation ? (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <Image
            source={require('../../assets/images/loading4.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
           />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
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
      <View style={styles.bottomSheet}>
        {/* Location Box */}
        <View 
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ECD9C3",
            borderColor: "#D4A57D",
            borderRadius: 20,
            borderWidth: 1,
            paddingVertical: 11,
            paddingHorizontal: 13,
            marginBottom: 36,
            width: '100%',
            alignSelf: 'center',
            shadowColor: "#00000040",
            shadowOpacity: 0.3,
            shadowOffset: {
                width: 0,
                height: 4
            },
            shadowRadius: 4,
            elevation: 4,
          }}>
          {/* Current Location and Destination indicators */}
          <View style={{ marginRight: 10, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 5 }}>
            {/* Current Location Circle */}
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#FF9900',
              borderWidth: 2,
              borderColor: '#FFB84D',
              marginBottom: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#FF9900'
              }} />
            </View>
            
            {/* Dotted Line Container */}
            <View style={{
              height: 35,
              width: 1,
              marginBottom: 8,
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {[...Array(8)].map((_, index) => (
                <View key={index} style={{
                  width: 2,
                  height: 3,
                  backgroundColor: '#FF9900',
                  borderRadius: 1
                }} />
              ))}
            </View>
            
            {/* Destination Pin */}
            <Icon name="location" size={18} color="#121212" />
          </View>
          
          <View 
            style={{
              flex: 1,
            }}>
            <Text 
              style={{
                color: "#A66400",
                fontSize: 14,
                fontWeight: "bold",
                marginBottom: 17,
              }}>
              {currentLocation ? currentLocation.name : 'Getting current location...'}
            </Text>
            <View 
              style={{
                height: 1,
                backgroundColor: "#D4A57D",
                marginBottom: 19,
                marginHorizontal: 2,
              }}>
            </View>
            <Text 
              style={{
                color: "#232F3E",
                fontSize: 14,
                fontWeight: "bold",
                marginLeft: 2,
              }}>
              {destination ? destination.name : 'No destination selected'}
            </Text>
          </View>
        </View>

        {/* Saved Routes */}
        <Text style={styles.savedRoutesTitle}>Recently Used Taxi Ranks</Text>
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
              style={styles.routeCard}
              onPress={() => handleDestinationSelect(route)}
            >
              <Icon name="location-sharp" size={20} color="#ff9f43" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>{route.title}</Text>
                <Text style={styles.routeSubtitle}>{route.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  map: {
    height: '40%',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 16,
    paddingTop: 24,
  },
  locationBox: {
    backgroundColor: '#fcd9b8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  destinationText: {
    color: '#555',
    marginLeft: 8,
  },
  savedRoutesTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  routeTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  routeSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  tabBar: {
    height: 60,
    backgroundColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});