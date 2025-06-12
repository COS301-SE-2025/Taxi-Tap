import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

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

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaProvider>
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
                ? require('../../assets/images/icon-dark.png')
                : require('../../assets/images/icon.png')
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
          // Add the theme toggle button to all tab headers
          headerRight: () => <ThemeToggleButton />,
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
      </Tabs>
    </SafeAreaProvider>
  );
}