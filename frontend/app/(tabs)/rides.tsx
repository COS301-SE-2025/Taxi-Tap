import { StyleSheet, Button, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api'; // ✅ Adjust the path if needed

export default function TabTwoScreen() {
  const addUser = useMutation(api.addUser.addUser);

  const handleAddUser = async () => {
    try {
      const id = await addUser({
        name: 'Atidaishe',
        email: 'ati@example.com',
        age: 22,
      });
      Alert.alert('Success', `User added with ID: ${id}`);
    } catch (error) {
      console.error('Failed to add user:', error);
      Alert.alert('Error', 'Something went wrong while adding user.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button title="Add User" onPress={handleAddUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
