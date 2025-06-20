import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface DriverOnlineProps {
  onGoOffline: () => void;
  todaysEarnings: number;
  currentRoute?: string;
  availableSeats?: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

interface MenuItem {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface SafetyOption {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

export default function DriverOnline({ 
  onGoOffline, 
  todaysEarnings,
  currentRoute = "Not Set",
  availableSeats = 4,
}: DriverOnlineProps) {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: 'none' },
    });
  });

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
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

        const currentLoc: LocationData = {
          latitude,
          longitude,
          name: placeName || 'Unknown Location',
        };

        setCurrentLocation(currentLoc);

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
      }
    };

    getCurrentLocation();
  }, []);

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleSafetyPress = () => {
    setShowSafetyMenu(!showSafetyMenu);
  };

  const handleEmergency = () => {
    Alert.alert(
      "Emergency Alert",
      "This will contact emergency services (112)",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Get Help", 
          style: "destructive", 
          onPress: () => {
            Alert.alert("Emergency Alert Sent", "Emergency services contacted.");
            setShowSafetyMenu(false);
          }
        }
      ]
    );
  };

  const menuItems: MenuItem[] = [
    { 
      icon: "person-outline", 
      title: "My Profile", 
      subtitle: "Driver details & documents",
      onPress: () => console.log('Profile pressed') 
    },
    { 
      icon: "car-outline", 
      title: "My Taxi & Route", 
      subtitle: "Vehicle info & route settings",
      onPress: () => console.log('Vehicle Info pressed') 
    },
    { 
      icon: "time-outline", 
      title: "Trip History", 
      subtitle: "Past rides & routes",
      onPress: () => console.log('Trip History pressed') 
    },
    { 
      icon: "settings-outline", 
      title: "Settings", 
      subtitle: "App preferences",
      onPress: () => console.log('Settings pressed') 
    },
  ];

  const safetyOptions: SafetyOption[] = [
    {
      icon: "call",
      title: "Emergency Call",
      subtitle: "Call 112 immediately",
      color: "#FF4444",
      onPress: handleEmergency
    },
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
    },
    map: {
      width: width,
      height: height,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      color: theme.text,
      fontSize: 16,
      marginTop: 16,
    },
    menuButton: {
      position: 'absolute',
      top: 60,
      left: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
      zIndex: 1000,
    },
    earningsContainer: {
      position: 'absolute',
      top: 60,
      left: 80,
      right: 20,
      alignItems: 'center',
      zIndex: 999,
    },
    earningsCard: {
      backgroundColor: theme.surface,
      borderRadius: 30,
      padding: 20,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
      minWidth: 200,
    },
    earningsAmount: {
      color: theme.primary,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
    },
    earningsTitle: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: "bold",
    },
    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingBottom: 40,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: -4 },
      shadowRadius: 4,
      elevation: 8,
    },
    quickStatus: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    quickStatusItem: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    quickStatusValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 4,
    },
    quickStatusLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    offlineButton: {
      width: '100%',
      height: 56,
      borderRadius: 30,
      backgroundColor: '#FF4444',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
      flexDirection: 'row',
    },
    offlineButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    safetyButton: {
      position: 'absolute',
      bottom: 200,
      left: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#FF4444',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 8,
      zIndex: 1000,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    menuModal: {
      marginTop: 120,
      marginLeft: 20,
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingVertical: 8,
      minWidth: 280,
      maxWidth: '90%',
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 12,
    },
    menuModalHeader: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuModalHeaderText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    menuModalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 60,
    },
    menuModalItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    menuModalItemContent: {
      flex: 1,
    },
    menuModalItemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    menuModalItemSubtitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.textSecondary,
    },
    safetyModal: {
      position: 'absolute',
      bottom: 270,
      left: 20,
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 8,
      minWidth: 200,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 8,
    },
    safetyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 50,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    safetyItemLast: {
      borderBottomWidth: 0,
    },
    safetyItemIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    safetyItemContent: {
      flex: 1,
    },
    safetyItemTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    safetyItemSubtitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.textSecondary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.mapContainer}>
          {!currentLocation ? (
            <View style={dynamicStyles.loadingContainer}>
              <Text style={dynamicStyles.loadingText}>Loading location...</Text>
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={dynamicStyles.map}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                showsScale={false}
                showsBuildings={true}
                showsTraffic={false}
                showsIndoors={false}
                showsPointsOfInterest={true}
              >
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="Your Location"
                  pinColor="#4CAF50"
                />
              </MapView>

              <TouchableOpacity 
                style={dynamicStyles.menuButton}
                onPress={handleMenuPress}
                accessibilityLabel="Open menu"
              >
                <Icon name="menu" size={24} color={theme.primary} />
              </TouchableOpacity>

              <View style={dynamicStyles.earningsContainer}>
                <TouchableOpacity 
                  style={dynamicStyles.earningsCard}
                  onPress={() => console.log('Earnings pressed!')}
                  activeOpacity={0.8}
                >
                  <Text style={dynamicStyles.earningsAmount}>
                   R{(todaysEarnings ?? 0).toFixed(2)}
                  </Text>
                  <Text style={dynamicStyles.earningsTitle}>Today's Earnings</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.bottomContainer}>
                <View style={dynamicStyles.quickStatus}>
                  <View style={dynamicStyles.quickStatusItem}>
                    <Text style={dynamicStyles.quickStatusValue}>{currentRoute}</Text>
                    <Text style={dynamicStyles.quickStatusLabel}>Current Route</Text>
                  </View>
                  <View style={dynamicStyles.quickStatusItem}>
                    <Text style={dynamicStyles.quickStatusValue}>{availableSeats}</Text>
                    <Text style={dynamicStyles.quickStatusLabel}>Available Seats</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={dynamicStyles.offlineButton}
                  onPress={onGoOffline}
                  activeOpacity={0.8}
                  accessibilityLabel="Go offline"
                >
                  <Text style={dynamicStyles.offlineButtonText}>GO OFFLINE</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={dynamicStyles.safetyButton}
                onPress={handleSafetyPress}
                activeOpacity={0.8}
                accessibilityLabel="Safety and emergency options"
              >
                <Icon name="shield-checkmark" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
              >
                <TouchableOpacity 
                  style={dynamicStyles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowMenu(false)}
                >
                  <View style={dynamicStyles.menuModal}>
                    <View style={dynamicStyles.menuModalHeader}>
                      <Text style={dynamicStyles.menuModalHeaderText}>Menu</Text>
                    </View>
                    {menuItems.map((item, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={dynamicStyles.menuModalItem}
                        onPress={() => {
                          item.onPress();
                          setShowMenu(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={dynamicStyles.menuModalItemIcon}>
                          <Icon name={item.icon} size={20} color={theme.primary} />
                        </View>
                        <View style={dynamicStyles.menuModalItemContent}>
                          <Text style={dynamicStyles.menuModalItemTitle}>{item.title}</Text>
                          <Text style={dynamicStyles.menuModalItemSubtitle}>{item.subtitle}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>

              {showSafetyMenu && (
                <TouchableOpacity 
                  style={dynamicStyles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowSafetyMenu(false)}
                >
                  <View style={dynamicStyles.safetyModal}>
                    {safetyOptions.map((option, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[
                          dynamicStyles.safetyItem,
                          index === safetyOptions.length - 1 && dynamicStyles.safetyItemLast
                        ]}
                        onPress={option.onPress}
                        activeOpacity={0.8}
                      >
                        <View style={[dynamicStyles.safetyItemIcon, { backgroundColor: `${option.color}20` }]}>
                          <Icon name={option.icon} size={16} color={option.color} />
                        </View>
                        <View style={dynamicStyles.safetyItemContent}>
                          <Text style={dynamicStyles.safetyItemTitle}>{option.title}</Text>
                          <Text style={dynamicStyles.safetyItemSubtitle}>{option.subtitle}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}