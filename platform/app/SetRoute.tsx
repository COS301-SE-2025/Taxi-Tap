// SetRoute component
import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useRouteContext } from '../contexts/RouteContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useUser } from '../contexts/UserContext';
import { Id } from '../convex/_generated/dataModel';

interface SetRouteProps {
  onRouteSet?: (route: string) => void;
}

// Helper to parse route name into start and destination
function parseRouteName(routeName: string) {
  const parts = routeName?.split("-").map(part => part.trim()) ?? ["Unknown", "Unknown"];
  return {
    start: parts[0] ?? "Unknown",
    destination: parts[1] ?? "Unknown"
  };
}

export default function SetRoute({ onRouteSet }: SetRouteProps) {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { setCurrentRoute } = useRouteContext();
  const { user } = useUser();
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [taxiAssociation, setTaxiAssociation] = useState<string>('');

  // Get driver's assigned route
  const assignedRoute = useQuery(
    api.functions.routes.queries.getDriverAssignedRoute,
    user?.id ? { userId: user.id as Id<'taxiTap_users'> } : "skip"
  );

  // Mutation to assign random route
  const assignRandomRoute = useMutation(api.functions.routes.queries.assignRandomRouteToDriver);

  // Get all taxi associations for selection
  const allTaxiAssociations = useQuery(api.functions.routes.queries.getAllTaxiAssociations);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  const handleAssignRoute = async () => {
    if (!taxiAssociation) {
      Alert.alert(
        "Select Taxi Association",
        "Please select your taxi association first.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!user?.id) {
      Alert.alert("User not found", "You must be logged in as a driver.");
      return;
    }

    setIsAssigning(true);

    try {
      const result = await assignRandomRoute({
        userId: user.id as Id<'taxiTap_users'>,
        taxiAssociation: taxiAssociation
      });

      if (result.success) {
        const { start, destination } = parseRouteName(result.assignedRoute.name);
        const routeString = `${start} → ${destination}`;
        
        setCurrentRoute(routeString);
        if (onRouteSet) {
          onRouteSet(routeString);
        }

        Alert.alert(
          "Route Assigned Successfully!",
          `You have been assigned to:\n\n${routeString}\n\nAssociation: ${taxiAssociation}\n\nThis is now your permanent route.`,
          [{
            text: "OK",
            onPress: () => navigation.goBack(),
          }]
        );
      }
    } catch (error) {
      console.error("Error assigning route:", error);
      Alert.alert(
        "Assignment Failed", 
        error instanceof Error ? error.message : "Failed to assign route. Please try again."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleActivateExistingRoute = () => {
    if (!assignedRoute) return;

    const { start, destination } = parseRouteName(assignedRoute.name);
    const routeString = `${start} → ${destination}`;
    
    setCurrentRoute(routeString);
    if (onRouteSet) {
      onRouteSet(routeString);
    }

    Alert.alert(
      "Route Activated",
      `Your route has been activated:\n\n${routeString}`,
      [{
        text: "OK",
        onPress: () => navigation.goBack(),
      }]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.surface,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? theme.primary : "#f5f5f5",
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    sectionSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 32,
      textAlign: 'center',
      lineHeight: 22,
    },
    routeCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
    },
    routeCardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    routeText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    associationText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    selectionCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
    },
    selectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    associationButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? theme.background : "#f8f8f8",
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    associationButtonSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '10',
    },
    associationButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    associationButtonPlaceholder: {
      color: theme.textSecondary,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 4,
    },
    primaryButtonDisabled: {
      backgroundColor: theme.textSecondary + '40',
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? "#121212" : "#FFFFFF",
    },
    primaryButtonTextDisabled: {
      color: theme.textSecondary,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.primary,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginLeft: 12,
    },
  });

  // If driver already has an assigned route
  if (assignedRoute) {
    const { start, destination } = parseRouteName(assignedRoute.name);
    
    return (
      <SafeAreaView style={dynamicStyles.safeArea}>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor={theme.surface} 
        />
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.headerLeft}>
              <TouchableOpacity 
                style={dynamicStyles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color={isDark ? "#121212" : "#FF9900"} />
              </TouchableOpacity>
              <Text style={dynamicStyles.headerTitle}>Your Route</Text>
            </View>
          </View>

          <View style={dynamicStyles.content}>
            <Text style={dynamicStyles.sectionTitle}>Your Assigned Route</Text>
            <Text style={dynamicStyles.sectionSubtitle}>
              This is your permanent route assignment. Activate it to start receiving passengers.
            </Text>

            <View style={dynamicStyles.routeCard}>
              <Text style={dynamicStyles.routeCardTitle}>Current Route</Text>
              <Text style={dynamicStyles.routeText}>{start} → {destination}</Text>
              <Text style={dynamicStyles.associationText}>{assignedRoute.taxiAssociation}</Text>
            </View>

            <TouchableOpacity
              style={dynamicStyles.primaryButton}
              onPress={handleActivateExistingRoute}
            >
              <Text style={dynamicStyles.primaryButtonText}>Activate Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // If driver doesn't have an assigned route yet
  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.surface} 
      />
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerLeft}>
            <TouchableOpacity 
              style={dynamicStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={isDark ? "#121212" : "#FF9900"} />
            </TouchableOpacity>
            <Text style={dynamicStyles.headerTitle}>Get Your Route</Text>
          </View>
        </View>

        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.sectionTitle}>Route Assignment</Text>
          <Text style={dynamicStyles.sectionSubtitle}>
            Select your taxi association and we'll assign you a route automatically. This will be your permanent route.
          </Text>

          <View style={dynamicStyles.selectionCard}>
            <Text style={dynamicStyles.selectionTitle}>Select Your Taxi Association</Text>
            
            {allTaxiAssociations?.map((association, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  dynamicStyles.associationButton,
                  taxiAssociation === association && dynamicStyles.associationButtonSelected
                ]}
                onPress={() => setTaxiAssociation(association)}
              >
                <Text style={dynamicStyles.associationButtonText}>{association}</Text>
                {taxiAssociation === association && (
                  <Icon name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              dynamicStyles.primaryButton,
              (!taxiAssociation || isAssigning) && dynamicStyles.primaryButtonDisabled
            ]}
            onPress={handleAssignRoute}
            disabled={!taxiAssociation || isAssigning}
          >
            {isAssigning ? (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.text} />
                <Text style={dynamicStyles.loadingText}>Assigning Route...</Text>
              </View>
            ) : (
              <Text style={[
                dynamicStyles.primaryButtonText,
                (!taxiAssociation || isAssigning) && dynamicStyles.primaryButtonTextDisabled
              ]}>
                Get My Route
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}