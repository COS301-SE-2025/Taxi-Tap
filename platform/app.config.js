export default {
  expo: {
    name: "frontend",
    slug: "frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    // Add extra field for easier access to environment variables
    extra: {
      googleMapsIosApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY,
      googleMapsAndroidApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.frontend",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.frontend",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY
      }
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};