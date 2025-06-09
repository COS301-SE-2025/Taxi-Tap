import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { Id } from '../../convex/_generated/dataModel';

export default function DriverProfile() {
    const [driverRating, setDriverRating] = useState('5 years');
    const [name, setName] = useState('');
    const router = useRouter();
    const { user, logout, updateUserRole, updateUserName, updateAccountType } = useUser();

    // Initialize name from user context
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user?.name]);

    // Query user data from Convex using the user ID from context
    // Make sure your getUserById function uses the correct table name (taxiTap_users)
    const convexUser = useQuery(
        api.functions.users.UserManagement.getUserById.getUserById, 
        user?.id ? { userId: user.id as Id<"taxiTap_users"> } : "skip"
    );

    // Fix the mutation paths to match your actual API structure
    const switchDriverToBoth = useMutation(api.functions.users.UserManagement.switchDrivertoBoth.switchDriverToBoth);
    const switchActiveRole = useMutation(api.functions.users.UserManagement.switchActiveRole.switchActiveRole);;

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

    const handleSignout = async () => {
        await logout();
        router.push('../LandingPage');
    };

    const handleNameChange = (newName: string) => {
        setName(newName);
    };

    const handleSwitchToPassenger = async () => {
        try {
            if (!user?.id) {
                Alert.alert('Error', 'User data not found');
                return;
            }

            // Since we have convexUser data, use it instead of user from context
            // First time switching - user is currently driver only
            if ((convexUser?.accountType || user.accountType) === 'driver') {
                Alert.alert(
                    'First Time Switching',
                    'This is your first time switching to passenger mode. Your account will be upgraded to support both driver and passenger roles.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Continue',
                            onPress: async () => {
                                try {
                                    // Upgrade driver to both first
                                    await switchDriverToBoth({ 
                                        userId: user.id as Id<"taxiTap_users"> 
                                    });
                                    
                                    // Then switch active role to passenger
                                    await switchActiveRole({ 
                                        userId: user.id as Id<"taxiTap_users">, 
                                        newRole: 'passenger' as const
                                    });
                                    
                                    // Update context
                                    await updateAccountType('both');
                                    await updateUserRole('passenger');
                                    
                                    Alert.alert('Success', 'Successfully switched to passenger mode!');
                                    router.push('../HomeScreen');
                                } catch (error: any) {
                                    Alert.alert('Error', error.message || 'Failed to switch to passenger mode');
                                }
                            },
                        },
                    ]
                );
            } 
            // User already has both account types - just switch active role
            else if ((convexUser?.accountType || user.accountType) === 'both') {
                Alert.alert(
                    'Switch Profile',
                    'Are you sure you want to switch to the passenger profile?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                try {
                                    // Switch active role to passenger
                                    await switchActiveRole({ 
                                        userId: user.id as Id<"taxiTap_users">, 
                                        newRole: 'passenger' as const
                                    });
                                    
                                    // Update context
                                    await updateUserRole('passenger');
                                    
                                    Alert.alert('Success', 'Switched to passenger mode!');
                                    router.push('../HomeScreen');
                                } catch (error: any) {
                                    Alert.alert('Error', error.message || 'Failed to switch to passenger mode');
                                }
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Error', 'Invalid account type for switching to passenger mode');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    const handleSave = async () => {
        try {
            if (!user?.id) {
                Alert.alert('Error', 'User not found');
                return;
            }

            // Update name in context
            if (name !== user.name) {
                await updateUserName(name);
            }

            // Here you would also save to your backend if needed
            // Example: await updateUserProfile({ userId: user.id as Id<"taxiTap_users">, name, experience });

            Alert.alert('Success', 'Profile saved successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save profile');
        }
    };

    // Show loading or error state if user is not available
    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading user data...</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'space-between' }}>
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
                            onChangeText={handleNameChange}
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
                        <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Driver Rating:</Text>
                        <TextInput
                            value={driverRating}
                            onChangeText={setDriverRating}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 6,
                                paddingHorizontal: 10,
                                height: 40,
                                fontSize: 16,
                            }}
                        />
                    </View>

                    {/* Display user info for debugging */}
                    <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
                        <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>User ID:</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{user.id}</Text>
                    </View>

                    <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
                        <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Account Type:</Text>
                        <Text style={{ fontSize: 14, color: '#333' }}>
                            {convexUser?.accountType || user.accountType || 'N/A'}
                        </Text>
                    </View>

                    <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
                        <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Current Role:</Text>
                        <Text style={{ fontSize: 14, color: '#333' }}>
                            {convexUser?.currentActiveRole || user.role || 'N/A'}
                        </Text>
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