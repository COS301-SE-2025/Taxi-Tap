import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default function DriverProfile() {
    const [name, setName] = useState('Tshepo Mthembu');
    const [experience, setExperience] = useState('5 years');
    const router = useRouter();
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: 'Driver Profile',
            headerStyle: {
                backgroundColor: theme.surface,
            },
            headerTintColor: theme.text,
        });
    }, [navigation, theme]);

    const handleVehicle = () => {
        router.push('/DriverRequestPage');
    };

    const handleDocs = () => {
        router.push('../Documents');
    };

    const handleEarnings = () => {
        router.push('../EarningsPage');
    };

    const handleRoutes = () => {
        router.push('../Routes');
    };

    const handleSignout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => router.push('../LandingPage'),
                },
            ]
        );
    };

    const handleSwitchToPassenger = () => {
        Alert.alert(
            'Switch Profile',
            'Are you sure you want to switch to the passenger profile?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => router.push('../HomeScreen'),
                },
            ]
        );
    };

    const handleSave = () => {
        Alert.alert('Success', 'Profile saved successfully');
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            padding: 20,
        },
        sectionTitle: {
            color: theme.text,
            fontSize: 18,
            fontWeight: '500',
            marginBottom: 10,
        },
        profileCard: {
            backgroundColor: isDark ? theme.surface : '#ecd4b5',
            borderRadius: 16,
            padding: 20,
            shadowColor: theme.shadow,
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 4,
            elevation: 5,
            alignItems: 'center',
        },
        inputContainer: {
            alignSelf: 'stretch',
            marginBottom: 12,
        },
        inputLabel: {
            marginBottom: 4,
            fontWeight: 'bold',
            color: theme.text,
        },
        input: {
            backgroundColor: theme.background,
            borderRadius: 6,
            paddingHorizontal: 10,
            height: 40,
            fontSize: 16,
            color: theme.text,
            borderWidth: 1,
            borderColor: theme.border,
        },
        button: {
            backgroundColor: isDark ? theme.surface : '#ecd4b5',
            paddingVertical: 14,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 20,
            shadowColor: theme.shadow,
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
        },
        buttonText: {
            color: theme.text,
            fontWeight: 'bold',
            fontSize: 18,
        },
    });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                <Text style={styles.sectionTitle}>Driver Information</Text>
                <View style={styles.profileCard}>
                    <Ionicons name="person-circle" size={64} color={theme.text} style={{ marginBottom: 20 }} />

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Name:</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Experience:</Text>
                        <TextInput
                            value={experience}
                            onChangeText={setExperience}
                            style={styles.input}
                        />
                    </View>
                </View>

                <Pressable onPress={handleVehicle} style={styles.button}>
                    <Text style={styles.buttonText}>Vehicle</Text>
                </Pressable>

                <Pressable onPress={handleDocs} style={styles.button}>
                    <Text style={styles.buttonText}>Documents</Text>
                </Pressable>

                <Pressable onPress={handleEarnings} style={styles.button}>
                    <Text style={styles.buttonText}>Weekly Earnings</Text>
                </Pressable>

                <Pressable onPress={handleRoutes} style={styles.button}>
                    <Text style={styles.buttonText}>Routes</Text>
                </Pressable>

                <Pressable onPress={handleSignout} style={styles.button}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </Pressable>

                <Pressable onPress={handleSwitchToPassenger} style={styles.button}>
                    <Text style={styles.buttonText}>Switch to Passenger Profile</Text>
                </Pressable>

                <Pressable onPress={handleSave} style={styles.button}>
                    <Text style={styles.buttonText}>Save Profile</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}