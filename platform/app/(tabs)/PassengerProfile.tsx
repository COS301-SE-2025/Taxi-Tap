import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { Id } from '../../convex/_generated/dataModel';

export default function PassengerProfile() {
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
    const convexUser = useQuery(
        api.functions.users.UserManagement.getUserById.getUserById, 
        user?.id ? { userId: user.id as Id<"taxiTap_users"> } : "skip"
    );

    // Mutations for switching roles
    const switchPassengerToBoth = useMutation(api.functions.users.UserManagement.switchPassengertoBoth.switchPassengerToBoth);
    const switchActiveRole = useMutation(api.functions.users.UserManagement.switchActiveRole.switchActiveRole);

    const handleSignout = async () => {
        await logout();
        router.push('../LandingPage');
    };

    const handleNameChange = (newName: string) => {
        setName(newName);
    };

    const handleSwitchToDriver = async () => {
        try {
            if (!user?.id) {
                Alert.alert('Error', 'User data not found');
                return;
            }

            // First time switching - user is currently passenger only
            if ((convexUser?.accountType || user.accountType) === 'passenger') {
                Alert.alert(
                    'First Time Switching',
                    'This is your first time switching to driver mode. Your account will be upgraded to support both passenger and driver roles.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Continue',
                            onPress: async () => {
                                try {
                                    // Upgrade passenger to both first
                                    await switchPassengerToBoth({ 
                                        userId: user.id as Id<"taxiTap_users"> 
                                    });
                                    
                                    // Then switch active role to driver
                                    await switchActiveRole({ 
                                        userId: user.id as Id<"taxiTap_users">, 
                                        newRole: 'driver' as const
                                    });
                                    
                                    // Update context
                                    await updateAccountType('both');
                                    await updateUserRole('driver');
                                    
                                    Alert.alert('Success', 'Successfully switched to driver mode!');
                                    router.push('../HomeScreen');
                                } catch (error: any) {
                                    Alert.alert('Error', error.message || 'Failed to switch to driver mode');
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
                    'Are you sure you want to switch to the driver profile?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                try {
                                    // Switch active role to driver
                                    await switchActiveRole({ 
                                        userId: user.id as Id<"taxiTap_users">, 
                                        newRole: 'driver' as const
                                    });
                                    
                                    // Update context
                                    await updateUserRole('driver');
                                    
                                    Alert.alert('Success', 'Switched to driver mode!');
                                    router.push('../HomeScreen');
                                } catch (error: any) {
                                    Alert.alert('Error', error.message || 'Failed to switch to driver mode');
                                }
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Error', 'Invalid account type for switching to driver mode');
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
            Alert.alert('Success', 'Profile saved successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save profile');
        }
    };

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
                    Passenger Information
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
                    onPress={handleSwitchToDriver}
                    style={{
                        backgroundColor: '#ecd4b5',
                        paddingVertical: 14,
                        borderRadius: 30,
                        alignItems: 'center',
                        marginTop: 20,
                    }}
                >
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>Switch to Driver Profile</Text>
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
