import React, { useLayoutEffect } from "react";
import { SafeAreaView, View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function SeatReserved() {
	const params = useLocalSearchParams();
	const navigation = useNavigation();
	const { theme, isDark } = useTheme();
	
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false
		});
	}, []);

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

	const vehicleInfo = {
		plate: getParamAsString(params.plate, "Unknown"),
		time: getParamAsString(params.time, "Unknown"),
		seats: getParamAsString(params.seats, "0"),
		price: getParamAsString(params.price, "0"),
		selectedVehicleId: getParamAsString(params.selectedVehicleId, "")
	};

	const handleCancelReservation = () => {
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
		arrivalTimeOverlay: {
			position: "absolute",
			top: 50,
			left: 0,
			right: 0,
			alignItems: "center",
		},
		arrivalTimeBox: {
			backgroundColor: isDark ? theme.surface : "#121212",
			borderRadius: 30,
			paddingVertical: 16,
			paddingHorizontal: 20,
		},
		arrivalTimeText: {
			color: isDark ? theme.text : "#FFFFFF",
			fontSize: 13,
			fontWeight: "bold",
			textAlign: "center",
		},
		bottomSection: {
			alignItems: "center",
			backgroundColor: theme.surface,
			borderRadius: 30,
			paddingTop: 47,
			paddingBottom: 60,
		},
		driverDetailsHeader: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 33,
			width: '100%',
		},
		driverDetailsTitle: {
			color: theme.textSecondary,
			fontSize: 16,
			fontWeight: "bold",
			flex: 1,
		},
		contactButton: {
			width: 35,
			height: 35,
			backgroundColor: isDark ? theme.primary : "#121212",
			borderRadius: 17.5,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 5,
		},
		driverInfoSection: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 36,
			width: '100%',
			paddingHorizontal: 15,
		},
		driverAvatar: {
			width: 60,
			height: 60,
			backgroundColor: isDark ? theme.primary : "#121212",
			borderRadius: 30,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 11,
		},
		driverName: {
			color: theme.text,
			fontSize: 16,
			fontWeight: "bold",
			marginBottom: 1,
		},
		driverVehicle: {
			color: theme.textSecondary,
			fontSize: 12,
			fontWeight: "bold",
		},
		ratingText: {
			color: theme.text,
			fontSize: 12,
			fontWeight: "bold",
			marginRight: 3,
		},
		licensePlateSection: {
			flexDirection: "row",
			marginBottom: 26,
			width: '100%',
			paddingHorizontal: 35,
			justifyContent: 'space-between',
		},
		licensePlateLabel: {
			color: theme.textSecondary,
			fontSize: 13,
			fontWeight: "bold",
		},
		licensePlateValue: {
			color: theme.textSecondary,
			fontSize: 13,
			fontWeight: "bold",
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
		cancelButton: {
			alignItems: "center",
			backgroundColor: isDark ? theme.primary : "#121212",
			borderRadius: 30,
			paddingVertical: 24,
			width: 330,
		},
		cancelButtonText: {
			color: isDark ? "#121212" : "#FFFFFF",
			fontSize: 20,
			fontWeight: "bold",
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

						{/* Arrival Time Overlay */}
						<View style={dynamicStyles.arrivalTimeOverlay}>
							<View style={dynamicStyles.arrivalTimeBox}>
								<Text style={dynamicStyles.arrivalTimeText}>
									{vehicleInfo.time}
								</Text>
							</View>
						</View>
					</View>

					<View style={dynamicStyles.bottomSection}>
						<View style={dynamicStyles.driverDetailsHeader}>
							<View style={{ width: 20, height: 20, marginRight: 3 }}></View>
							<Text style={dynamicStyles.driverDetailsTitle}>
								{"Driver Details"}
							</Text>
							<View style={dynamicStyles.contactButton}>
								<Icon name="call" size={18} color={isDark ? "#121212" : "#FF9900"} />
							</View>
							<View style={[dynamicStyles.contactButton, { marginRight: 10 }]}>
								<Icon name="chatbubble" size={18} color={isDark ? "#121212" : "#FF9900"} />
							</View>
						</View>
						
						<View style={dynamicStyles.driverInfoSection}>
							<View style={dynamicStyles.driverAvatar}>
								<Icon name="person" size={30} color={isDark ? "#121212" : "#FF9900"} />
							</View>
							<View style={{ marginRight: 54 }}>
								<Text style={dynamicStyles.driverName}>
									{"Tshepo Mthembu"}
								</Text>
								<Text style={dynamicStyles.driverVehicle}>
									{"Hiace-Sesfikile"}
								</Text>
							</View>
							<Text style={dynamicStyles.ratingText}>
								{"5.0"}
							</Text>
							{[1, 2, 3, 4, 5].map((star, index) => (
								<Icon key={index} name="star" size={12} color={theme.primary} style={{ marginRight: 1 }} />
							))}
						</View>
						
						<View style={dynamicStyles.licensePlateSection}>
							<Text style={dynamicStyles.licensePlateLabel}>
								{"License plate number"}
							</Text>
							<Text style={dynamicStyles.licensePlateValue}>
								{vehicleInfo.plate}
							</Text>
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
								style={dynamicStyles.cancelButton} 
								onPress={handleCancelReservation}>
								<Text style={dynamicStyles.cancelButtonText}>
									{"Cancel reservation"}
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