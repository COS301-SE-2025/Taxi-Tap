import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DriverProfile() {
    const [name, setName] = useState('Tshepo Mthembu');
    const [experience, setExperience] = useState('5 years');
    const router = useRouter();

    const handleVehicle = () => {
        router.push('../DriverRequestPage');
    };

    const handleDocs = () => {
        //router.push('../Docs'); ->change to real name
    };

    const handleEarnings = () => {
        //router.push('../Earnings'); ->change to real name
    };

    const handleRoutes = () => {
        //router.push('../Routes'); ->change to real name
    };

    const handleSignout = () => {
        router.push('../LandingPage');
    };

    const handleSwitchToPassenger = () => {
        Alert.alert(
        'Switch Profile',
        'Are you sure you want to switch to the passenger profile?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
            text: 'Yes',
            onPress: () => {
                router.push('../HomeScreen'); // Adjust path if needed
            },
            },
        ]
        );
    };

    const handleSave = () => {
        // Add save logic here
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
        <Pressable
            onPress={handleVehicle}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Vehicle</Text>
        </Pressable>
        <Pressable
            onPress={handleDocs}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Documents</Text>
        </Pressable>
        <Pressable
            onPress={handleEarnings}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Weekly Earnings</Text>
        </Pressable>
        <Pressable
            onPress={handleRoutes}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Routes</Text>
        </Pressable>
        <Pressable
            onPress={handleSignout}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Sign Out</Text>
        </Pressable>
        <Pressable
            onPress={handleSwitchToPassenger}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Switch to Passenger Profile</Text>
        </Pressable>
        <Pressable
            onPress={handleSave}
            style={{
            backgroundColor: '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            }}
        >
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Save Profile</Text>
        </Pressable>
        </View>
    </ScrollView>
  );
}