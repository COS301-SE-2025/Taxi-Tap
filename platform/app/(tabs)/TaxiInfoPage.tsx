import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DriverProfile() {
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

            <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginBottom: 12 }}>
            <Text style={{ marginBottom: 4, fontWeight: 'bold', marginRight: 52 }}>Name:</Text>
            <Text>Tshepo Mthembu</Text>
            </View>

            <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginBottom: 12 }}>
            <Text style={{ marginBottom: 4, fontWeight: 'bold', marginRight: 20 }}>Experience:</Text>
            <Text style={{ marginBottom: 4 }}>5 years</Text>
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

            <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginBottom: 12 }}>
            <Text style={{ marginBottom: 4, fontWeight: 'bold', marginRight: 14 }}>Vehicle type:</Text>
            <Text style={{ marginBottom: 4 }}>Toyota</Text>
            </View>

            <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginBottom: 12 }}>
            <Text style={{ marginBottom: 4, fontWeight: 'bold', marginRight: 10 }}>License plate:</Text>
            <Text style={{ marginBottom: 4 }}>VV 78 98 GP</Text>
            </View>

            <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
            <Text style={{ marginBottom: 4, fontWeight: 'bold', marginRight: 24 }}>Total seats:</Text>
            <Text style={{ marginBottom: 4 }}>12</Text>
            </View>

            <View style={{ width: '100%' }}>
                <Image
                    source={require('../../assets/images/taxi.png')}
                    resizeMode="contain"
                    style={{ width: '100%', height: 200 }}
                />
            </View>
        </View>
        </View>
    </ScrollView>
  );
}