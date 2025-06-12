import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#232f3e',
        paddingTop: 40,
        paddingHorizontal: 20,
      }}
    >
      {/* Logo */}
      <View style={{ width: '100%', marginBottom: 0, marginTop: 50 }}>
        <Image
          source={require('../assets/images/3.png')}
          resizeMode="contain"
          style={{ width: '100%', height: 400 }}
        />
      </View>

      {/* Buttons */}
      <View style={{ width: '100%', maxWidth: 265, gap: 24 }}>
        <Pressable
          onPress={() => router.push('../SignUp')}
          style={{
            height: 50,
            backgroundColor: '#f90',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#232f3e', fontWeight: '700', fontSize: 20 }}>
            Sign Up
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('../Login')}
          style={{
            height: 50,
            backgroundColor: '#f90',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#232f3e', fontWeight: '700', fontSize: 20 }}>
            Login
          </Text>
        </Pressable>
      </View>
    </View>
  );
}