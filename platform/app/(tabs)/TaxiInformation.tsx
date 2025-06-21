import React, { useState, useLayoutEffect } from "react";
import { SafeAreaView, View, ScrollView, StyleSheet, Image, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuery } from "convex/react";
import { api } from '../../convex/_generated/api';

export default function TaxiInformation() {
	const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
	const params = useLocalSearchParams();
	const navigation = useNavigation();
	const { theme, isDark } = useTheme();

	const availableTaxis = useQuery(api.functions.taxis.displayTaxis.getAvailableTaxis);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	});
	
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

	function getParamAsString(param: string | string[] | undefined, fallback: string = ''): string {
		if (Array.isArray(param)) {
			return param[0] || fallback;
		}
		return param || fallback;
	}

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

	if (availableTaxis === undefined) {
		return (
			<SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
				<ActivityIndicator size="large" color={theme.primary} />
				<Text style={{ color: theme.text, marginTop: 10 }}>Loading available taxis...</Text>
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
							<Polyline
								coordinates={[currentLocation, destination]}
								strokeColor={theme.primary}
								strokeWidth={4}
							/>
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