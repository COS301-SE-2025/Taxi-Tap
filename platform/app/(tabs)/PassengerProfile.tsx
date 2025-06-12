import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function PassengerProfile() {
  const [name, setName] = useState('Tshepo Mthembu');
  const [number, setNumber] = useState('073 658 9142');
  const [email, setEmail] = useState('tshepo@gmail.com');
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const handleSave = () => {
    // Add save logic here
  };

  const handleSwitchToDriver = () => {
    Alert.alert(
      'Switch Profile',
      'Are you sure you want to switch to the driver profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            router.push('../DriverHomeScreen');
          },
        },
      ]
    );
  };

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollViewContent: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'space-between',
    },
    profileCard: {
      backgroundColor: isDark ? theme.surface : '#ecd4b5',
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.2,
      shadowRadius: 4,
      elevation: 5,
      alignItems: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? theme.border : 'transparent',
    },
    profileIcon: {
      marginBottom: 20,
      backgroundColor: isDark ? theme.primary + '20' : 'transparent',
      borderRadius: 50,
      padding: isDark ? 8 : 0,
    },
    inputGroup: {
      alignSelf: 'stretch',
      marginBottom: 12,
    },
    inputLabel: {
      marginBottom: 4,
      fontWeight: 'bold',
      color: theme.text,
      fontSize: 16,
    },
    textInput: {
      backgroundColor: theme.card,
      borderRadius: 6,
      paddingHorizontal: 10,
      height: 40,
      fontSize: 16,
      color: theme.text,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? theme.border : 'transparent',
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
      marginTop: 20,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButtonText: {
      color: isDark ? '#121212' : '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 18,
    },
    additionalInfo: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? theme.border : 'transparent',
    },
    additionalInfoTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={dynamicStyles.scrollViewContent}
      >
        <View>
          <View style={dynamicStyles.profileCard}>
            <View style={dynamicStyles.profileIcon}>
              <Ionicons 
                name="person-circle" 
                size={64} 
                color={isDark ? theme.primary : '#000'} 
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Name:</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={dynamicStyles.textInput}
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Number:</Text>
              <TextInput
                value={number}
                onChangeText={setNumber}
                keyboardType="phone-pad"
                style={dynamicStyles.textInput}
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Email:</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={dynamicStyles.textInput}
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          {/* Additional Account Information */}
          <View style={dynamicStyles.additionalInfo}>
            <Text style={dynamicStyles.additionalInfoTitle}>Account Information</Text>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Member Since</Text>
              <Text style={dynamicStyles.infoValue}>January 2024</Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Total Trips</Text>
              <Text style={dynamicStyles.infoValue}>47</Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Average Rating</Text>
              <Text style={dynamicStyles.infoValue}>4.8 ⭐</Text>
            </View>
            
            <View style={[dynamicStyles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={dynamicStyles.infoLabel}>Preferred Route</Text>
              <Text style={dynamicStyles.infoValue}>Menlyn Taxi Rank</Text>
            </View>
          </View>
        </View>
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
          style={dynamicStyles.saveButton}
        >
          <Text style={dynamicStyles.saveButtonText}>Save Profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}