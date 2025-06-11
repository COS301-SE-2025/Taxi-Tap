import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import taxiImage from '../../assets/images/taxi.png';

export default function DriverProfile() {
  const [name, setName] = useState('Tshepo Mthembu');
  const [experience, setExperience] = useState('5 years');
  const [vehicleType, setVehicleType] = useState('Toyota');
  const [licensePlate, setLicensePlate] = useState('VV 78 98 GP');
  const [seats, setSeats] = useState('12');

  const handleSave = () => {
    // Add save logic here
    // console.log('Saved:', { name, number, email });
  };

  return (
    <ScrollView>
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'space-between' }}>
        {/* <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
            Profile
        </Text> */}
        <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', marginBottom: 10 }}>
            Driver Information
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
            <Ionicons name="person-circle" size={64} color="#000" style={{ marginBottom: 20 }} />

            <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
            <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Name:</Text>
            <TextInput
                value={name}
                onChangeText={setName}
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
            <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Experience:</Text>
            <TextInput
                value={experience}
                onChangeText={setExperience}
                style={{
                backgroundColor: '#fff',
                borderRadius: 6,
                paddingHorizontal: 10,
                height: 40,
                fontSize: 16,
                }}
            />
            </View>
        </View>

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

            <View style={{ width: '100%' }}>
                <Image
                    source={taxiImage}
                    resizeMode="contain"
                    style={{ width: '100%', height: 200 }}
                />
            </View>
        </View>

        <Pressable
            onPress={handleSave}
            style={{
            backgroundColor: '#ffa500',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Save</Text>
        </Pressable>
        </View>
    </ScrollView>
  );
}