import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
// import { styled } from 'nativewind';

// const StyledTextInput = styled(TextInput);

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        Alert.alert('Login Successful', `Welcome, ${email}`);
    };

    return (
        <View className="flex-1 justify-center bg-white px-6">
            <Text className="text-3xl font-bold text-center mb-8">Login</Text>
            
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

            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

export default Login;