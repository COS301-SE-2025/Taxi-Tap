import React, { useState, useRef, useEffect } from 'react';
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

export default function HomeScreen() {
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

  return (
    <View style={styles.container}>
      {/* Map Section */}
      {!currentLocation ? (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <Image
            source={require('../assets/images/loading4.png')}
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
        <View style={styles.locationBox}>
          <View style={styles.locationRow}>
            <Icon name="locate" size={20} color="#ff9f43" />
            <Text style={styles.currentText}>
              {currentLocation ? currentLocation.name : 'Getting current location...'}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="pin" size={18} color="#999" />
            <Text style={styles.destinationText}>
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
              onPress={() => {
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
              }}
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

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <Icon name="home" size={24} color="orange" />
        <Icon name="navigate" size={24} color="#999" />
        <Icon name="person" size={24} color="#999" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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