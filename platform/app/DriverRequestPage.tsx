import React, { useLayoutEffect } from "react";
import { SafeAreaView, View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default () => {
    const params = useLocalSearchParams();
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    });

    function getParamAsString(param: string | string[] | undefined, fallback: string = ''): string {
		if (Array.isArray(param)) {
			return param[0] || fallback;
		}
		return param || fallback;
	}

	// Parse location data from params
	const currentLocation = {
		latitude: parseFloat(getParamAsString(params.currentLat, "-25.7479")),
		longitude: parseFloat(getParamAsString(params.currentLng, "28.2293")),
		name: getParamAsString(params.currentName, "Current Location")
	};

	const destination = {
		latitude: parseFloat(getParamAsString(params.destinationLat, "-25.7824")),
		longitude: parseFloat(getParamAsString(params.destinationLng, "28.2753")),
		name: getParamAsString(params.destinationName, "Menlyn Taxi Rank")
	};

    const handleAccept = () => {
        //Handle Accept
    };

    const handleDecline = () => {
        //Handle Decline
    };

    // Create dynamic styles based on theme
    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollView: {
            flex: 1,
            backgroundColor: theme.background,
        },
        bottomSection: {
            alignItems: "center",
            backgroundColor: theme.surface,
            borderRadius: 30,
            paddingTop: 47,
            paddingBottom: 60,
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
            width: '90%',
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
            paddingTop: 5,
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
        declineButton: {
            alignItems: "center",
            backgroundColor: isDark ? theme.primary : "#FF0000",
            borderRadius: 30,
            paddingVertical: 24,
            width: 330,
        },
        acceptButton: {
            alignItems: "center",
            backgroundColor: isDark ? theme.primary : "#00FF00",
            borderRadius: 30,
            paddingVertical: 24,
            width: 330,
            marginBottom: 20,
        },
        declineButtonText: {
            color: isDark ? "#121212" : "#FFFFFF",
            fontSize: 20,
            fontWeight: "bold",
        },
        acceptButtonText: {
            color: isDark ? "#121212" : "#FFFFFF",
            fontSize: 20,
            fontWeight: "bold",
        },
        textBox: {
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderColor: '#121212',
            borderRadius: 30,
            backgroundColor: '#121212',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        textBoxText: {
            color: '#FFB84D',
            textAlign: 'center',
        },
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <ScrollView style={dynamicStyles.scrollView}>
                <View>
                    {/* Map Section with Route */}
                    <View style={{ height: 300, position: 'relative' }}>
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: (currentLocation.latitude + destination.latitude) / 2,
                                longitude: (currentLocation.longitude + destination.longitude) / 2,
                                latitudeDelta: Math.abs(currentLocation.latitude - destination.latitude) * 2 + 0.01,
                                longitudeDelta: Math.abs(currentLocation.longitude - destination.longitude) * 2 + 0.01,
                            }}
                            // Use dark map style when in dark mode
                            customMapStyle={isDark ? darkMapStyle : []}
                        >
                            <Marker
                                coordinate={currentLocation}
                                title="You are here"
                                pinColor="blue"
                            >
                            </Marker>
                            <Marker
                                coordinate={destination}
                                title={destination.name}
                                pinColor="orange"
                            >
                            </Marker>
                            <Polyline
                                coordinates={[currentLocation, destination]}
                                strokeColor="#00A591"
                                strokeWidth={4}
                            />
                        </MapView>

                        {/* Passenger Location Overlay */}
                        {/* <View style={dynamicStyles.arrivalTimeOverlay}>
                            <View style={dynamicStyles.arrivalTimeBox}>
                                <Text style={dynamicStyles.arrivalTimeText}>
                                    {vehicleInfo.time}
                                </Text>
                            </View>
                        </View> */}
                    </View>

                    <View style={dynamicStyles.bottomSection}>
                        <View style={{ width: '25%', alignItems: 'center' }}>
                            <View style={dynamicStyles.textBox}>
                                <Text style={dynamicStyles.textBoxText}>
                                R12.50
                                </Text>
                            </View>
                        </View>
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
                                <Icon name="location" size={18} color={isDark ? theme.text : "#121212"} />
                            </View>
                            
                            <View style={dynamicStyles.locationTextContainer}>
                                <Text style={dynamicStyles.currentLocationText}>
                                    {currentLocation.name}
                                </Text>
                                <View style={dynamicStyles.locationSeparator}></View>
                                <Text style={dynamicStyles.destinationText}>
                                    {destination.name}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <TouchableOpacity 
                                style={dynamicStyles.acceptButton} 
                                onPress={handleAccept}>
                                <Text style={dynamicStyles.acceptButtonText}>
                                    {"Accept"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <TouchableOpacity 
                                style={dynamicStyles.declineButton} 
                                onPress={handleDecline}>
                                <Text style={dynamicStyles.declineButtonText}>
                                    {"Decline"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

// Dark map style for better dark mode experience (same as HomeScreen)
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