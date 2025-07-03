import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DriverTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            DriverHomeScreen: 'car',
            EarningsPage: 'cash',
            DriverRequestPage: 'map',
            DriverProfile: 'person',
            HelpPage: 'help-circle',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tabs.Screen name="DriverHomeScreen" options={{ title: 'Home' }} />
      <Tabs.Screen name="EarningsPage" options={{ title: 'Earnings' }} />
      <Tabs.Screen name="DriverRequestPage" options={{ title: 'My Route' }} />
      <Tabs.Screen name="DriverProfile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="HelpPage" options={{ title: 'Help' }} />
      <Tabs.Screen name="DriverOffline" options={{ href: null }} />
      <Tabs.Screen name="DriverOnline" options={{ href: null }} />
      <Tabs.Screen name="DriverPassengerInfo" options={{ href: null }} />
      <Tabs.Screen name="NotificationsScreen" options={{ href: null }} />
      <Tabs.Screen name="SetRoute" options={{ href: null }} />
      <Tabs.Screen name="VehicleDriver" options={{ href: null }} />
    </Tabs>
  );
}