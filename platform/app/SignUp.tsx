import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Dropdown } from 'react-native-element-dropdown';

const convex = new ConvexReactClient("https://affable-goose-538.convex.cloud");

const data = [
    { label: 'Passenger', value: 'Passenger' },
    { label: 'Driver', value: 'Driver' },
];

export default function SignUp() {
  // const signUpWithSMS = useMutation(api.functions.users.UserManagement.signUpWithSMS.signUpSMS);
  const [nameSurname, setNameSurname] = useState('');
  const [number, setNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfrimPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!number || !password || !nameSurname || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }
    const saNumberRegex = /^0(6|7|8)[0-9]{8}$/;
    if (!saNumberRegex.test(number)) {
      Alert.alert('Invalid number', 'Please enter a valid number');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    try {
      // TODO: Replace with actual signup logic
      Alert.alert('Signup Successful', `Welcome, ${nameSurname}!`);
      
      // Navigate based on role
      if (selectedRole === 'Driver') {
        router.replace('/DriverHomeScreen');
      } else if (selectedRole === 'Passenger') {
        router.replace('/HomeScreen');
      }
    } catch (err) {
      const message =
        (err as any)?.data?.message || (err as any)?.message || "Something went wrong";

      if (message.includes("Number already exists")) {
        Alert.alert("Number In Use", "This number is already registered. Try logging in or use a different number.");
      } else {
        Alert.alert("Signup Error", message);
      }
    }
  };

  return (
    <ConvexProvider client={convex}>
    <ScrollView>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Top Section */}
        <View
          style={{
            paddingHorizontal: 20,
            backgroundColor: '#fff',
          }}
        >
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
          {/* Name and surname */}
          <Text style={{ color: 'white', fontWeight: '400', fontSize: 20, paddingLeft: 4, paddingBottom: 6 }}>
              Name and Surname
          </Text>

          <TextInput
            value={nameSurname}
            onChangeText={setNameSurname}
            placeholder="Name and Surname"
            placeholderTextColor="#999"
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 15,
              fontSize: 16,
            }}
          />

          {/* Username */}
          <Text style={{ color: 'white', fontWeight: '400', fontSize: 20, paddingLeft: 4, paddingBottom: 6 }}>
              Cellphone number
          </Text>

          <TextInput
            value={number}
            onChangeText={setNumber}
            placeholder="Cellphone number"
            placeholderTextColor="#999"
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 15,
              fontSize: 16,
            }}
          />

          {/* Dropdown */}
          {/* Dropdown for Role */}
          <Text style={{ color: 'white', fontWeight: '400', fontSize: 20, paddingLeft: 4, paddingBottom: 6 }}>
            Select Role
          </Text>

          <Dropdown
            data={data}
            labelField="label"
            valueField="value"
            placeholder="Select role"
            placeholderStyle={{ color: '#999' }}
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 15
            }}
            selectedTextStyle={{ fontSize: 16, color: '#000' }}
            value={selectedRole}
            onChange={item => setSelectedRole(item.value)}
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

          {/* Confirm Password */}
          <Text style={{ color: 'white', fontWeight: '400', fontSize: 20, paddingLeft: 4, paddingBottom: 6 }}>
              Confirm Password
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 44,
              marginBottom: 20,
            }}
          >
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfrimPassword}
              style={{
                  flex: 1,
                  // paddingVertical: 12,
                  fontSize: 16,
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfrimPassword)}>
              <Ionicons
                name={showConfrimPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* SignUp Button */}
          <Pressable
            onPress={handleSignup}
            style={{
              height: 50,
              backgroundColor: '#f90',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            <Text style={{ color: '#232f3e', fontWeight: '700', fontSize: 26 }}>
              Sign Up
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
    </ScrollView>
    </ConvexProvider>
  );
}