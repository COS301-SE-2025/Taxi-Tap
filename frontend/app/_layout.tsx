import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { api } from '../convex/_generated/api'; // Adjust path if needed

import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
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
      <RootLayoutNav />
    </ConvexProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#FF9900',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#131A22',
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : customTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: customTheme.colors.background }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: customTheme.colors.card,
            },
            headerTitleStyle: {
              fontFamily: 'AmazonEmber-Medium',
              fontSize: 18,
              color: customTheme.colors.text,
            },
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              headerTitle: 'Ride Details',
              headerBackTitleStyle: {
                fontFamily: 'AmazonEmber-Light',
              },
            }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
