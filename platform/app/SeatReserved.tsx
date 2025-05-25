import React from "react";
import { SafeAreaView, View, ScrollView, ImageBackground, Image, Text, TouchableOpacity, } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default () => {
	const params = useLocalSearchParams();
	
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

	return (
		<SafeAreaView 
			style={{
				flex: 1,
				backgroundColor: "#FFFFFF",
			}}>
			<ScrollView  
				style={{
					flex: 1,
					backgroundColor: "#F5F5F5",
				}}>
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
						>
							<Marker
								coordinate={currentLocation}
								title="Your Location"
							>
								<View style={{
									width: 40,
									height: 40,
									backgroundColor: '#4A90E2',
									borderRadius: 20,
									justifyContent: 'center',
									alignItems: 'center',
									borderWidth: 3,
									borderColor: '#FFFFFF'
								}}>
									<Icon name="person" size={20} color="#FFFFFF" />
								</View>
							</Marker>
							<Marker
								coordinate={destination}
								title={destination.name}
							>
								<View style={{
									width: 40,
									height: 40,
									backgroundColor: '#FF9900',
									borderRadius: 20,
									justifyContent: 'center',
									alignItems: 'center',
									borderWidth: 3,
									borderColor: '#FFFFFF'
								}}>
									<Icon name="navigate" size={20} color="#FFFFFF" />
								</View>
							</Marker>
							<Polyline
								coordinates={[currentLocation, destination]}
								strokeColor="#00A591"
								strokeWidth={4}
							/>
						</MapView>

						{/* Arrival Time Overlay */}
						<View 
							style={{
								position: "absolute",
								top: 50,
								left: 0,
								right: 0,
								alignItems: "center",
							}}>
							<View 
								style={{
									backgroundColor: "#121212",
									borderRadius: 30,
									paddingVertical: 16,
									paddingHorizontal: 20,
								}}>
								<Text 
									style={{
										color: "#FFFFFF",
										fontSize: 13,
										fontWeight: "bold",
										textAlign: "center",
									}}>
									{"Arriving in 4 minutes"}
								</Text>
							</View>
						</View>
					</View>

					<View 
						style={{
							alignItems: "center",
							backgroundColor: "#F5F5F5",
							borderRadius: 30,
							paddingTop: 47,
							paddingBottom: 60,
							paddingHorizontal: 20,
						}}>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginBottom: 33,
								width: '100%',
								paddingHorizontal: 12,
							}}>
							<View 
								style={{
									width: 20,
									height: 20,
									marginRight: 3,
								}}>
							</View>
							<Text 
								style={{
									color: "#767171",
									fontSize: 16,
									fontWeight: "bold",
									flex: 1,
								}}>
								{"Driver Details"}
							</Text>
							<View 
								style={{
									width: 35,
									height: 35,
									backgroundColor: "#121212",
									borderRadius: 17.5,
									justifyContent: "center",
									alignItems: "center",
									marginRight: 5,
								}}>
								<Icon name="call" size={18} color="#FF9900" />
							</View>
							<View 
								style={{
									width: 35,
									height: 35,
									backgroundColor: "#121212",
									borderRadius: 17.5,
									justifyContent: "center",
									alignItems: "center",
								}}>
								<Icon name="chatbubble" size={18} color="#FF9900" />
							</View>
						</View>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginBottom: 36,
								width: '100%',
								paddingHorizontal: 32,
							}}>
							<View 
								style={{
									width: 60,
									height: 60,
									backgroundColor: "#121212",
									borderRadius: 30,
									justifyContent: "center",
									alignItems: "center",
									marginRight: 11,
								}}>
								<Icon name="person" size={30} color="#FF9900" />
							</View>
							<View 
								style={{
									marginRight: 54,
								}}>
								<Text 
									style={{
										color: "#000000",
										fontSize: 16,
										fontWeight: "bold",
										marginBottom: 1,
									}}>
									{"Tshepo Mthembu"}
								</Text>
								<Text 
									style={{
										color: "#767171",
										fontSize: 12,
										fontWeight: "bold",
									}}>
									{"Hiace-Sesfikile"}
								</Text>
							</View>
							<Text 
								style={{
									color: "#000000",
									fontSize: 12,
									fontWeight: "bold",
									marginRight: 3,
								}}>
								{"5.0"}
							</Text>
							{[1, 2, 3, 4, 5].map((star, index) => (
								<Icon key={index} name="star" size={12} color="#FF9900" style={{ marginRight: 1 }} />
							))}
						</View>
						<View 
							style={{
								flexDirection: "row",
								marginBottom: 26,
								width: '100%',
								paddingHorizontal: 35,
								justifyContent: 'space-between',
							}}>
							<Text 
								style={{
									color: "#767171",
									fontSize: 13,
									fontWeight: "bold",
								}}>
								{"License plate number"}
							</Text>
							<Text 
								style={{
									color: "#767171",
									fontSize: 13,
									fontWeight: "bold",
								}}>
								{"YY 87 89 GP"}
							</Text>
						</View>
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
									{currentLocation.name}
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
									{destination.name}
								</Text>
							</View>
						</View>
						<View style={{ width: '100%', alignItems: 'center' }}>
							<TouchableOpacity 
								style={{
									alignItems: "center",
									backgroundColor: "#121212",
									borderRadius: 30,
									paddingVertical: 24,
									width: 330,
								}} 
								onPress={handleCancelReservation}>
								<Text 
									style={{
										color: "#FFFFFF",
										fontSize: 20,
										fontWeight: "bold",
									}}>
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