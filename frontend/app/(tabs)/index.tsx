import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you going?</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/rides')}
      >
        <Text style={styles.buttonText}>Book Ride</Text>
      </TouchableOpacity>

      <Image
        source={require('../assets/images/icon.png')}
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
  footer: {
    position: 'absolute',
    bottom: 20,
    color: '#888',
    fontSize: 12,
  },
});