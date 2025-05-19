import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

const SignUp: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordConfirm, setPasswordConfrim] = useState<string>('');

    const handlesignup = () => {
        if (!email || !password || !name || !surname || !passwordConfirm) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        Alert.alert('Sign Up Successful', `Welcome, ${email}`);
    };

    return (
        <View className="flex-1 justify-center bg-white px-6">
            <Text className="text-3xl font-bold text-center mb-8">Sign Up</Text>
            
            <Text className="text-3xl font-bold text-center mb-8">Name</Text>

            <TextInput 
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />

            <Text className="text-3xl font-bold text-center mb-8">Surname</Text>

            <TextInput 
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                placeholder="Surname"
                value={surname}
                onChangeText={setSurname}
            />

            <Text className="text-3xl font-bold text-center mb-8">Email</Text>

            <TextInput 
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <Text className="text-3xl font-bold text-center mb-8">Password</Text>

            <TextInput 
                className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Text className="text-3xl font-bold text-center mb-8">Confirm Password</Text>

            <TextInput 
                className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                placeholder="Confirm Password"
                secureTextEntry
                value={passwordConfirm}
                onChangeText={setPasswordConfrim}
            />

            <Button title="Sign Up" onPress={handlesignup} />
        </View>
    );
};

export default SignUp;