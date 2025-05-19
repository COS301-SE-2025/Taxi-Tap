import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarActiveTintColor: '#FF9900', // Amazon orange
        tabBarInactiveTintColor: '#6B7280', // Gray for inactive tabs
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          backgroundColor: '#FFFFFF', // White background
        },
        tabBarLabelStyle: {
          fontFamily: 'AmazonEmber-Medium',
          fontSize: 12,
          marginBottom: 4,
        },
        
        // Header styling (for screens within tabs)
        headerTitleStyle: {
          fontFamily: 'AmazonEmber-Medium',
          fontSize: 18,
          color: '#131A22', // Amazon dark text
        },
        headerStyle: {
          backgroundColor: '#FFFFFF', // White header
          shadowOpacity: 0.1, // Subtle shadow
          elevation: 2,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'Rides',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="directions-car" size={24} color={color} />
          ),
          // Override header title style if needed
          headerTitleStyle: {
            fontFamily: 'AmazonEmber-Bold', // Special case for Rides header
            fontSize: 20,
          }
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}