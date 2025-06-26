import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { UserProvider } from '../../contexts/UserContext';
import { router } from 'expo-router';
import dark from '../../assets/images/icon-dark.png';
import light from '../../assets/images/icon.png';

// Notification Button Component
const NotificationButton: React.FC = () => {
  const { theme, isDark } = useTheme();

  const handleNotificationPress = () => {
    router.push('../NotificationsScreen');
  };

  return (
    <TouchableOpacity
      style={{
        padding: 8,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={handleNotificationPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="notifications-outline" 
        size={24} 
        color={theme.text} 
      />
    </TouchableOpacity>
  );
};

// Theme Toggle Button Component (inline)
const ThemeToggleButton: React.FC = () => {
  const { isDark, setThemeMode } = useTheme();

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      style={{
        padding: 8,
        marginRight: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={isDark ? 'light-mode' : 'dark-mode'}
        size={24}
        color={isDark ? '#FFFFFF' : '#232F3E'}
      />
    </TouchableOpacity>
  );
};

// Header Right Component with both buttons
const HeaderRightButtons: React.FC = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <NotificationButton />
      <ThemeToggleButton />
    </View>
  );
};

// Tab Navigation Component (separated for cleaner structure)
const TabNavigation: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        // Tab Bar Styling with Theme
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'AmazonEmber-Medium',
          fontSize: 12,
          marginBottom: 4,
        },
        
        // Header Styling with Theme
        headerTitle: () => (
          <Image
            source={isDark 
              ? dark
              : light
            }
            style={{ 
              width: 150,
              height: 150,
              resizeMode: 'contain',
            }}
          />
        ),
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: theme.headerBackground,
          shadowOpacity: isDark ? 0.3 : 0.1,
          elevation: 2,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
        // Add both notification and theme toggle buttons to all tab headers
        headerRight: () => <HeaderRightButtons />,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="PassengerRoute"
        options={{
          title: 'View Routes',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="feedback" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="PassengerProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="HelpPage"
        options={{
          title: 'Help',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="question-circle" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="DriverProfile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="SeatReserved"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="TaxiInfoPage"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="TaxiInformation"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PassengerReservation"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <TabNavigation />
      </UserProvider>
    </SafeAreaProvider>
  );
}