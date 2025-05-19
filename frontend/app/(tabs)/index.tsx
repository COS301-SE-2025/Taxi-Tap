import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual API endpoint after setting up the API Gateway
  const API_ENDPOINT = "https://7zfjrkensg.execute-api.us-east-1.amazonaws.com/dev/test";

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const res = await fetch(API_ENDPOINT);
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      console.error('Error testing connection:', err);
      // Handle the unknown type properly
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you going?</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}
      
      {error && (
        <View style={styles.resultContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      
      {response && (
        <View style={styles.resultContainer}>
          <Text style={styles.successText}>Success!</Text>
          <Text style={styles.responseText}>
            Response: {JSON.stringify(response)}
          </Text>
        </View>
      )}

      <Image
        source={require('../../assets/images/icon.png')}
        style={styles.taxiImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  taxiImage: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 30,
  },
  loader: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
    width: '80%',
    backgroundColor: '#f9f9f9',
  },
  successText: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  responseText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    color: '#888',
    fontSize: 12,
  },
});