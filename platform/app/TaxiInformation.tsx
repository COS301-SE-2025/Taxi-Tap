import React, { useState, useLayoutEffect } from "react";
import { SafeAreaView, View, ScrollView, ImageBackground, Image, Text, TouchableOpacity, } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default () => {
	const [selectedVehicle, setSelectedVehicle] = useState(null);
	const params = useLocalSearchParams();
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	});
	
	// Parse location data from params
	const currentLocation = {
		latitude: parseFloat(params.currentLat as string) || -25.7479,
		longitude: parseFloat(params.currentLng as string) || 28.2293,
		name: params.currentName || 'Current Location'
	};
	
	const destination = {
		latitude: parseFloat(params.destinationLat as string) || -25.7824,
		longitude: parseFloat(params.destinationLng as string) || 28.2753,
		name: params.destinationName || 'Menlyn Taxi Rank'
	};

	const vehicles = [
		{
			id: 1,
			plate: "VV 87 89 GP",
			image: require('../assets/images/Siyaya-Taxi-Avatar.jpg'),
			time: "8 min away",
			seats: "2 seats left",
			price: "R12"
		},
		{
			id: 2,
			plate: "YY 87 89 GP", 
			image: require('../assets/images/Quantum.png'),
			time: "3 min away",
			seats: "1 seat left",
			price: "R12"
		},
		{
			id: 3,
			plate: "YTV 567 GP",
			image: require('../assets/images/Siyaya-Taxi-Avatar.jpg'),
			time: "8 min away",
			seats: "5 seats left",
			price: "R12"
		},
        {
			id: 5,
			plate: "XYZ 879 GP", 
			image: require('../assets/images/Quantum.png'),
			time: "4 min away",
			seats: "4 seat left",
			price: "R12"
		}
	];

	const handleVehicleSelect = (vehicleId) => {
		setSelectedVehicle(vehicleId);
	};

	const handleChangeDestination = () => {
		router.push('./HomeScreen');
	};

	const handleReserveSeat = () => {
		if (selectedVehicle) {
			const selected = vehicles.find(vehicle => vehicle.id === selectedVehicle);
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
					selectedVehicleId: selected.id.toString(),
					plate: selected.plate,
					time: selected.time,
					seats: selected.seats,
					price: selected.price,
					image: selected.id.toString(),
				}
			});
		} else {
			alert('Please select a vehicle first!');
		}
	};

	return (
		<SafeAreaView 
			style={{
				flex: 1,
				backgroundColor: "#f8f9fa",
			}}>
			<ScrollView  
				style={{
					flex: 1,
					backgroundColor: "#f8f9fa",
				}}>
				<View>
					{/* Map Section */}
					<View style={{ height: 300 }}>
						<MapView
							style={{ flex: 1 }}
							initialRegion={{
								latitude: (currentLocation.latitude + destination.latitude) / 2,
								longitude: (currentLocation.longitude + destination.longitude) / 2,
								latitudeDelta: Math.abs(currentLocation.latitude - destination.latitude) * 2 + 0.01,
								longitudeDelta: Math.abs(currentLocation.longitude - destination.longitude) * 2 + 0.01,
							}}
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
					</View>

					<View 
						style={{
							alignItems: "center",
							backgroundColor: "#FFFFFF",
							borderRadius: 30,
							paddingTop: 36,
							paddingBottom: 40,
							paddingHorizontal: 20,
						}}>
						<TouchableOpacity 
							onPress={handleChangeDestination}
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginBottom: 37,
								alignSelf: 'flex-start',
								paddingHorizontal: 12,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/qMlslhlkN1/cild5yyo_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 20,
									height: 20,
									marginRight: 3,
								}}
							/>
							<Text 
								style={{
									color: "#767171",
									fontSize: 16,
									fontWeight: "bold",
								}}>
								{"Change Destination"}
							</Text>
						</TouchableOpacity>
						
						{/* Horizontal ScrollView for vehicle list */}
						<ScrollView 
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							style={{
								marginBottom: 46,
								marginLeft: 5,
							}}
							contentContainerStyle={{
								paddingHorizontal: 5,
							}}>
							
							{vehicles.map((vehicle) => (
								<TouchableOpacity 
									key={vehicle.id}
									style={{
										alignItems: "center",
										backgroundColor: "#FFFFFF",
										borderColor: selectedVehicle === vehicle.id ? "#00A591" : "#E8E2E2",
										borderRadius: 20,
										borderWidth: selectedVehicle === vehicle.id ? 3 : 1,
										paddingTop: 12,
										paddingBottom: 26,
										width: 180,
										marginRight: 12,
									}} 
									onPress={() => handleVehicleSelect(vehicle.id)}>
									
									{/* Selection Circle */}
									<View 
										style={{
											width: 20,
											height: 20,
											backgroundColor: selectedVehicle === vehicle.id ? "#00A591" : "#FFFFFF",
											borderColor: "#E8E2E2",
											borderRadius: 50,
											borderWidth: 1,
											marginBottom: 18,
											justifyContent: "center",
											alignItems: "center",
										}}>
										{selectedVehicle === vehicle.id && (
											<Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>✓</Text>
										)}
									</View>
									
									{/* Vehicle Plate */}
									<Text 
										style={{
											color: "#000000",
											fontSize: 15,
											fontWeight: "bold",
											marginBottom: 11,
											textAlign: "center",
										}}>
										{vehicle.plate}
									</Text>
									
									{/* Vehicle Image */}
									<Image
										source={vehicle.image} 
										resizeMode={"contain"}
										style={{
											width: 100,
											height: 42,
											marginBottom: 22,
										}}
									/>
									
									{/* Time and Seats Info */}
									<Text 
										style={{
											color: "#000000",
											fontSize: 11,
											fontWeight: "bold",
											marginBottom: vehicle.price ? 6 : 0,
											textAlign: "center",
										}}>
										{`${vehicle.time} | ${vehicle.seats}`}
									</Text>
									
									{/* Price (if available) */}
									{vehicle.price && (
										<Text 
											style={{
												color: "#767171",
												fontSize: 12,
												fontWeight: "bold",
												textAlign: "center",
											}}>
											{vehicle.price}
										</Text>
									)}
								</TouchableOpacity>
							))}

						</ScrollView>

						<View style={{ width: '100%', alignItems: 'center' }}>
							<TouchableOpacity 
								style={{
									alignItems: "center",
									backgroundColor: selectedVehicle ? "#FF9900" : "#CCCCCC",
									borderRadius: 30,
									width: 330,
									height: 60,
									justifyContent: "center",
								}} 
								onPress={handleReserveSeat}>
								<Text 
									style={{
										color: selectedVehicle ? "#232F3E" : "#666666",
										fontSize: 20,
										fontWeight: "bold",
									}}>
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