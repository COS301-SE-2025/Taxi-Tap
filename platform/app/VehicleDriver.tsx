import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function VehicleDriver() {
    const [vehicleType, setVehicleType] = useState('Toyota');
    const [licensePlate, setLicensePlate] = useState('VV 78 98 GP');
    const [seats, setSeats] = useState('12');
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your media library to upload a photo.');
      }
    })();
  }, []);

    const handleUploadPhoto = async () => {
         try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                quality: 1,
            });

             if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                console.log('Selected image URI:', uri);
                setImageUri(uri);
            }
        } catch (error) {
            console.error('Image upload error:', error);
        }
    };

    return (
        <ScrollView>
            <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'space-between' }}>
                <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', marginBottom: 10, marginTop: 10 }}>
                    Taxi Information
                </Text>
                <View
                    style={{
                    backgroundColor: '#ecd4b5',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                    alignItems: 'center',
                    }}
                >

                    <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
                    <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Vehicle type:</Text>
                    <TextInput
                        value={vehicleType}
                        onChangeText={setVehicleType}
                        style={{
                        backgroundColor: '#fff',
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        height: 40,
                        fontSize: 16,
                        }}
                    />
                    </View>

                    <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
                    <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>License plate:</Text>
                    <TextInput
                        value={licensePlate}
                        onChangeText={setLicensePlate}
                        style={{
                        backgroundColor: '#fff',
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        height: 40,
                        fontSize: 16,
                        }}
                    />
                    </View>

                    <View style={{ alignSelf: 'stretch' }}>
                    <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Total seats:</Text>
                    <TextInput
                        value={seats}
                        onChangeText={setSeats}
                        style={{
                        backgroundColor: '#fff',
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        height: 40,
                        fontSize: 16,
                        }}
                    />
                    </View>

                    <View style={{ width: '100%', marginTop: 20 }}>
                        <Image
                            source={
                            imageUri
                                ? { uri: imageUri }
                                : require('../assets/images/taxi.png')
                            }
                            resizeMode="contain"
                            style={{ width: '100%', height: 200, borderRadius: 10 }}
                        />
                    </View>
                </View>
                <Pressable
                    onPress={handleUploadPhoto}
                    style={{
                    backgroundColor: '#ecd4b5',
                    paddingVertical: 14,
                    borderRadius: 30,
                    alignItems: 'center',
                    marginTop: 20,
                    }}
                >
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Upload Vehicle Photo</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}