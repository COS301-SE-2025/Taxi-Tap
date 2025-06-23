import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from "react";
import { SafeAreaView, View, ScrollView, StyleSheet, Image, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useMapContext, createRouteKey } from '../../contexts/MapContext';
import { useQuery } from "convex/react";
import { api } from '../../convex/_generated/api';

// Get platform-specific API key
const GOOGLE_MAPS_API_KEY = Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
  : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

export default function TaxiInformation() {
	const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
	const [routeError, setRouteError] = useState<string | null>(null);
	
	const params = useLocalSearchParams();
	const navigation = useNavigation();
	const { theme, isDark } = useTheme();
	const mapRef = useRef<MapView | null>(null);
	
	// Use MapContext instead of local state
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
		setCachedRoute
	} = useMapContext();

	const availableTaxis = useQuery(api.functions.taxis.displayTaxis.getAvailableTaxis);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	});
	
	// Parse location data from params and set in context
	useEffect(() => {
		const parsedCurrentLocation = {
			latitude: parseFloat(getParamAsString(params.currentLat, "-25.7479")),
			longitude: parseFloat(getParamAsString(params.currentLng, "28.2293")),
			name: getParamAsString(params.currentName, "Current Location")
		};

		const parsedDestination = {
			latitude: parseFloat(getParamAsString(params.destinationLat, "-25.7824")),
			longitude: parseFloat(getParamAsString(params.destinationLng, "28.2753")),
			name: getParamAsString(params.destinationName, "Menlyn Taxi Rank")
		};

		setCurrentLocation(parsedCurrentLocation);
		setDestination(parsedDestination);
	}, [params.currentLat, params.currentLng, params.currentName, params.destinationLat, params.destinationLng, params.destinationName, setCurrentLocation, setDestination]);

	// Function to decode Google's polyline format
	const decodePolyline = useCallback((encoded: string) => {
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
	}, []);

	// Function to get route from Google Directions API - memoized with useCallback
	const getRoute = useCallback(async (origin: { latitude: number; longitude: number; name: string }, dest: { latitude: number; longitude: number; name: string }) => {
		// Validate coordinates
		if (!origin || !dest) {
			console.warn('Invalid coordinates provided to getRoute');
			return;
		}
		
		if (origin.latitude === 0 && origin.longitude === 0) {
			console.warn('Origin coordinates are (0,0) - waiting for valid location');
			return;
		}
		
		if (dest.latitude === 0 && dest.longitude === 0) {
			console.warn('Destination coordinates are (0,0) - invalid destination');
			return;
		}

		if (!GOOGLE_MAPS_API_KEY) {
			console.error('Google Maps API key is not configured');
			setRouteError('Google Maps API key is not configured');
			return;
		}

		// Check cache first
		const routeKey = createRouteKey(origin, dest);
		const cachedRoute = getCachedRoute(routeKey);
		
		if (cachedRoute && cachedRoute.length > 0) {
			console.log('Using cached route');
			setRouteCoordinates(cachedRoute);
			setRouteLoaded(true);
			
			// Fit the map to show the entire route
			setTimeout(() => {
				if (mapRef.current) {
					const coordinates = [origin, dest, ...cachedRoute];
					mapRef.current.fitToCoordinates(coordinates, {
						edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
						animated: true,
					});
				}
			}, 100);
			return;
		}

		setIsLoadingRoute(true);
		setRouteError(null);
		setRouteLoaded(false);
		
		try {
			const originStr = `${origin.latitude},${origin.longitude}`;
			const destinationStr = `${dest.latitude},${dest.longitude}`;
			
			const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`;
			
			console.log('Fetching route from:', url);
			console.log('Platform:', Platform.OS);
			
			const response = await fetch(url);
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('HTTP Error Response:', response.status, errorText);
				throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
			}
			
			const data = await response.json();
			
			console.log('Directions API response status:', data.status);
			
			if (data.status !== 'OK') {
				console.error('Directions API Error:', data);
				throw new Error(`Directions API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
			}
			
			if (data.routes && data.routes.length > 0) {
				const route = data.routes[0];
				
				if (!route.overview_polyline || !route.overview_polyline.points) {
					throw new Error('No polyline data in route');
				}
				
				const decodedCoords = decodePolyline(route.overview_polyline.points);
				console.log('Decoded coordinates count:', decodedCoords.length);
				
				// Update context and cache
				setRouteCoordinates(decodedCoords);
				setCachedRoute(routeKey, decodedCoords);
				setRouteLoaded(true);
				
				// Fit the map to show the entire route after a small delay
				setTimeout(() => {
					if (mapRef.current) {
						const coordinates = [origin, dest, ...decodedCoords];
						mapRef.current.fitToCoordinates(coordinates, {
							edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
							animated: true,
						});
					}
				}, 100);
			} else {
				throw new Error('No routes found');
			}
		} catch (error) {
			console.error('Error fetching route:', error);
			setRouteError(error instanceof Error ? error.message : 'Unknown error');
			
			// Just fit the map to show both points without any polyline
			setTimeout(() => {
				if (mapRef.current) {
					const coordinates = [origin, dest];
					mapRef.current.fitToCoordinates(coordinates, {
						edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
						animated: true,
					});
				}
			}, 100);
		} finally {
			setIsLoadingRoute(false);
		}
	}, [GOOGLE_MAPS_API_KEY, getCachedRoute, setRouteCoordinates, setRouteLoaded, setIsLoadingRoute, setCachedRoute, decodePolyline]);

	// Fetch route when locations are available
	useEffect(() => {
		if (currentLocation && destination) {
			// Add a small delay to ensure the map is fully loaded
			const timer = setTimeout(() => {
				getRoute(currentLocation, destination);
			}, 500);
			
			return () => clearTimeout(timer);
		}
	}, [currentLocation, destination, getRoute]);

	const handleVehicleSelect = (plate: string) => {
		setSelectedVehicle(plate);
	};

	const handleChangeDestination = () => {
		router.push('./HomeScreen');
	};

	const handleReserveSeat = () => {
		if (!selectedVehicle) {
			alert('Please select a vehicle first!');
			return;
		}

		const selected = availableTaxis?.find(vehicle => vehicle.licensePlate === selectedVehicle);

		if (!selected) {
			alert('Selected vehicle not found!');
			return;
		}

		if (!currentLocation || !destination) {
			alert('Location data not available!');
			return;
		}

		router.push({
			pathname: './SeatReserved',
			params: {
				destinationName: destination.name,
				destinationLat: destination.latitude.toString(),
				destinationLng: destination.longitude.toString(),
				currentName: currentLocation.name,
				currentLat: currentLocation.latitude.toString(),
				currentLng: currentLocation.longitude.toString(),

				// Vehicle details
				plate: selected.licensePlate,
				image: selected.image,
				userId: selected.userId,
			}
		});
	};

	// function getParamAsString(param: string | string[] | undefined, fallback: string = ''): string {
	// 	if (Array.isArray(param)) {
	// 		return param[0] || fallback;
	// 	}
	// 	return param || fallback;
	// }

	// Create dynamic styles based on theme
	const dynamicStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		scrollContainer: {
			flex: 1,
			backgroundColor: theme.background,
		},
		map: {
			height: 300,
		},
		bottomSheet: {
			alignItems: "center",
			backgroundColor: theme.background,
			borderRadius: 30,
			paddingTop: 36,
			paddingBottom: 40,
			paddingHorizontal: 20,
		},
		changeDestinationButton: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 37,
			alignSelf: 'flex-start',
			paddingHorizontal: 12,
		},
		changeDestinationText: {
			color: theme.textSecondary,
			fontSize: 16,
			fontWeight: "bold",
		},
		routeLoadingText: {
			color: theme.textSecondary,
			fontSize: 12,
			fontStyle: 'italic',
			marginBottom: 20,
			alignSelf: 'flex-start',
			paddingHorizontal: 12,
		},
		routeErrorText: {
			color: '#FF6B6B',
			fontSize: 12,
			fontStyle: 'italic',
			marginBottom: 20,
			alignSelf: 'flex-start',
			paddingHorizontal: 12,
		},
		vehicleScrollContainer: {
			marginBottom: 46,
			marginLeft: 5,
		},
		vehicleCard: {
			alignItems: "center",
			backgroundColor: theme.card,
			borderColor: theme.primary,
			borderRadius: 20,
			borderWidth: 1,
			paddingTop: 12,
			paddingBottom: 26,
			width: 180,
			marginRight: 12,
			shadowColor: theme.shadow,
			shadowOpacity: isDark ? 0.3 : 0.05,
			shadowRadius: 4,
			elevation: 2,
		},
		vehicleCardSelected: {
			borderWidth: 3,
			borderColor: theme.primary,
		},
		vehicleCardUnselected: {
			borderWidth: 1,
			borderColor: isDark ? theme.border : "#E8E2E2",
		},
		selectionCircle: {
			width: 20,
			height: 20,
			backgroundColor: theme.primary,
			borderColor: isDark ? theme.border : "#E8E2E2",
			borderRadius: 50,
			borderWidth: 1,
			marginBottom: 18,
			justifyContent: "center",
			alignItems: "center",
		},
		selectionCircleUnselected: {
			backgroundColor: theme.card,
		},
		selectionCheck: {
			color: isDark ? theme.background : "#FFFFFF",
			fontSize: 12,
			fontWeight: "bold"
		},
		vehiclePlate: {
			color: theme.text,
			fontSize: 15,
			fontWeight: "bold",
			marginBottom: 11,
			textAlign: "center",
		},
		vehicleImage: {
			width: 100,
			height: 42,
			marginBottom: 22,
		},
		vehicleInfo: {
			color: theme.text,
			fontSize: 11,
			fontWeight: "bold",
			marginBottom: 6,
			textAlign: "center",
		},
		vehiclePrice: {
			color: theme.textSecondary,
			fontSize: 12,
			fontWeight: "bold",
			textAlign: "center",
		},
		reserveButton: {
			alignItems: "center",
			backgroundColor: theme.primary,
			borderRadius: 30,
			width: 330,
			height: 60,
			justifyContent: "center",
		},
		reserveButtonDisabled: {
			backgroundColor: isDark ? "#444444" : "#CCCCCC",
		},
		reserveButtonText: {
			color: isDark ? theme.background : "#232F3E",
			fontSize: 20,
			fontWeight: "bold",
		},
		reserveButtonTextDisabled: {
			color: "#666666",
		},
	});

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
	
	function getParamAsString(param: string | string[] | undefined, fallback: string = ''): string {
		if (Array.isArray(param)) {
			return param[0] || fallback;
		}
		return param || fallback;
	}


	if (availableTaxis === undefined) {
		return (
			<SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
				<ActivityIndicator size="large" color={theme.primary} />
				<Text style={{ color: theme.text, marginTop: 10 }}>Loading available taxis...</Text>
			</SafeAreaView>
		);
	}

	// Don't render if locations aren't loaded yet
	if (!currentLocation || !destination) {
		return (
			<SafeAreaView style={dynamicStyles.container}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ color: theme.text }}>Loading...</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Don't render if locations aren't loaded yet
	if (!currentLocation || !destination) {
		return (
			<SafeAreaView style={dynamicStyles.container}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ color: theme.text }}>Loading...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={dynamicStyles.container}>
			<ScrollView style={dynamicStyles.scrollContainer}>
				<View>
					{/* Map Section */}
					<View style={dynamicStyles.map}>
						<MapView
							ref={mapRef}
							style={{ flex: 1 }}
							provider={PROVIDER_GOOGLE} // Force Google Maps on all platforms
							initialRegion={{
								latitude: (currentLocation.latitude + destination.latitude) / 2,
								longitude: (currentLocation.longitude + destination.longitude) / 2,
								latitudeDelta: Math.abs(currentLocation.latitude - destination.latitude) * 2 + 0.01,
								longitudeDelta: Math.abs(currentLocation.longitude - destination.longitude) * 2 + 0.01,
							}}
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
							{/* Only render the route polyline if we have valid route coordinates */}
							{routeCoordinates.length > 0 && (
								<Polyline
									coordinates={routeCoordinates}
									strokeColor={theme.primary}
									strokeWidth={4}
								/>
							)}
						</MapView>
					</View>

					<View style={dynamicStyles.bottomSheet}>
						<TouchableOpacity 
							onPress={handleChangeDestination}
							style={dynamicStyles.changeDestinationButton}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/qMlslhlkN1/cild5yyo_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 20,
									height: 20,
									marginRight: 3,
								}}
							/>
							<Text style={dynamicStyles.changeDestinationText}>
								{"Change Destination"}
							</Text>
						</TouchableOpacity>

						{/* Show loading text when fetching route */}
						{isLoadingRoute && (
							<Text style={dynamicStyles.routeLoadingText}>
								Loading route...
							</Text>
						)}

						{/* Show error text if route loading failed */}
						{routeError && !isLoadingRoute && (
							<Text style={dynamicStyles.routeErrorText}>
								Route loading failed. Showing map view only.
							</Text>
						)}
						
						{/* Horizontal ScrollView for vehicle list */}
						<ScrollView 
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							style={dynamicStyles.vehicleScrollContainer}
							contentContainerStyle={{
								paddingHorizontal: 5,
							}}>
							
							{availableTaxis.map((vehicle) => (
								<TouchableOpacity 
									key={vehicle.licensePlate}
									style={[
										dynamicStyles.vehicleCard,
										selectedVehicle === vehicle.licensePlate 
											? dynamicStyles.vehicleCardSelected 
											: dynamicStyles.vehicleCardUnselected
									]} 
									onPress={() => handleVehicleSelect(vehicle.licensePlate)}>
									
									{/* Selection Circle */}
									<View style={[
										dynamicStyles.selectionCircle,
										selectedVehicle !== vehicle.licensePlate && dynamicStyles.selectionCircleUnselected
									]}>
										{selectedVehicle === vehicle.licensePlate && (
											<Text style={dynamicStyles.selectionCheck}>✓</Text>
										)}
									</View>
									
									{/* Vehicle Plate */}
									<Text style={dynamicStyles.vehiclePlate}>
										{vehicle.licensePlate}
									</Text>
									
									{/* Vehicle Image */}
									{vehicle.image ? (
										<Image
											source={{ uri: vehicle.image }}
											resizeMode="contain"
											style={dynamicStyles.vehicleImage}
										/>
										) : (
										<Text style={{ color: 'red' }}>No Image</Text>
									)}
									
									{/* Time and Seats Info */}
									{/* <Text style={dynamicStyles.vehicleInfo}>
										{`${vehicle.time} | ${vehicle.seats}`}
									</Text> */}
									
									{/* Price (if available) */}
									{/* {vehicle.price && (
										<Text style={dynamicStyles.vehiclePrice}>
											{vehicle.price}
										</Text>
									)} */}
								</TouchableOpacity>
							))}

						</ScrollView>

						<View style={{ width: '100%', alignItems: 'center' }}>
							<TouchableOpacity 
								style={[
									dynamicStyles.reserveButton,
									!selectedVehicle && dynamicStyles.reserveButtonDisabled
								]} 
								onPress={handleReserveSeat}>
								<Text style={[
									dynamicStyles.reserveButtonText,
									!selectedVehicle && dynamicStyles.reserveButtonTextDisabled
								]}>
									{"Reserve Seat"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}