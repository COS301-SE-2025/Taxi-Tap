import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PassengerProfile() {
  const [name, setName] = useState('Tshepo Mthembu');
  const [number, setNumber] = useState('073 658 9142');
  const [email, setEmail] = useState('tshepo@gmail.com');

  const handleSave = () => {
    // Add save logic here
    console.log('Saved:', { name, number, email });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'space-between' }}>
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
          <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Number:</Text>
          <TextInput
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
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
          <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Email:</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
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
  );
}