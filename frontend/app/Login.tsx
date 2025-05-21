import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    Alert.alert('Login Successful', `Welcome, ${email}`);
    router.push('/HomeScreen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Top Section */}
      <View
        style={{
          paddingHorizontal: 20,
          backgroundColor: '#fff',
        }}
      >
        {/* <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#232f3e" />
        </TouchableOpacity> */}

        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../assets/images/icon.png')}
            style={{ width: '100%', height: 200 }}
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#1d2939',
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          padding: 20,
          paddingTop: 40,
        }}
      >
        {/* Username */}
        <Text style={{ color: 'white', fontWeight: '400', fontSize: 20, paddingLeft: 4, paddingBottom: 6 }}>
            Email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#999"
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        {/* Password */}
        <Text style={{ color: 'white', fontWeight: '400', fontSize: 20, paddingLeft: 4, paddingBottom: 6 }}>
            Password
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 44,
            marginBottom: 15,
          }}
        >
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={{
                flex: 1,
                // paddingVertical: 12,
                fontSize: 16,
            }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
          <Text style={{ color: '#ccc', fontSize: 16 }}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          style={{
            height: 50,
            backgroundColor: '#f90',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
          }}
        >
          <Text style={{ color: '#232f3e', fontWeight: '700', fontSize: 26 }}>
            Login
          </Text>
        </Pressable>

        {/* Or Divider */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Or</Text>
        </View>

        {/* Google Sign-In Button */}
        <Pressable
          style={{
            backgroundColor: '#f90',
            width: 45,
            height: 45,
            borderRadius: 10,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={require('../assets/images/google5.png')}
            style={{ width: 24, height: 24 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
