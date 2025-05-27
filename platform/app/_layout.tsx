// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { api } from '../convex/_generated/api'; // Adjust path if needed

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'LandingPage',
};

SplashScreen.preventAutoHideAsync();

// Initialize Convex client with your deployment URL
const convex = new ConvexReactClient('https://affable-goose-538.convex.cloud'); // Replace this URL with your actual deployment

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'AmazonEmber-Regular': require('../assets/fonts/Amazon_Ember_Display.otf'),
    'AmazonEmber-Bold': require('../assets/fonts/Amazon_Ember_Display_Bold_Italic.ttf'),
    'AmazonEmber-Medium': require('../assets/fonts/Amazon_Ember_Display_Medium.ttf'),
    'AmazonEmber-Light': require('../assets/fonts/Amazon_Ember_Display_Light.ttf'),
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
        <RootLayoutNav />
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
    fonts: DefaultTheme.fonts, // Add the missing fonts property
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