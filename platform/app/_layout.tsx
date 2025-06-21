import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import React from 'react';
import regular from '../assets/fonts/Amazon_Ember_Display.otf';
import bold from '../assets/fonts/Amazon_Ember_Display_Bold_Italic.ttf';
import medium from '../assets/fonts/Amazon_Ember_Display_Medium.ttf';
import light from '../assets/fonts/Amazon_Ember_Display_Light.ttf';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import { MapProvider } from '../contexts/MapContext'; // Import your MapProvider

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'LandingPage',
};

SplashScreen.preventAutoHideAsync();

// Initialize Convex client with your deployment URL
const convex = new ConvexReactClient('https://affable-goose-538.convex.cloud');

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'AmazonEmber-Regular': regular,
    'AmazonEmber-Bold': bold,
    'AmazonEmber-Medium': medium,
    'AmazonEmber-Light': light,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <UserProvider>
          <MapProvider>
            <RootLayoutNav />
          </MapProvider>
        </UserProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}

function RootLayoutNav() {
  const { theme, isDark } = useTheme();
 
  // Create navigation theme based on our custom theme
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
    fonts: DefaultTheme.fonts,
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.headerBackground,
            },
            headerTitleStyle: {
              fontFamily: 'AmazonEmber-Medium',
              fontSize: 18,
              color: theme.text,
            },
            headerTitleAlign: 'center',
            headerTintColor: theme.text,
          }}
        >
          <Stack.Screen
            name="LandingPage"
            options={{
              headerShown: false
            }}
          />
         
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </NavigationThemeProvider>
  );
}