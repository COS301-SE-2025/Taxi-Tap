import React, { useState, useLayoutEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useRouteContext } from '../contexts/RouteContext';
import { RouteProvider } from '../contexts/RouteContext';

interface DriverOfflineProps {
  onGoOnline: () => void;
  todaysEarnings: number;
  availableSeats?: number;
  onRouteSet?: (route: string) => void;
}

interface MenuItemType {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface QuickActionType {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

interface SafetyOptionType {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

export default function DriverOffline({
  onGoOnline,
  todaysEarnings,
  availableSeats = 4,
  onRouteSet,
}: DriverOfflineProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { setCurrentRoute, currentRoute } = useRouteContext();

  const [showMenu, setShowMenu] = useState(false);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  const handleSetRoute = () => {
    navigation.navigate('SetRoute' as never);
  };

  const menuItems: MenuItemType[] = [
    {
      icon: 'person-outline',
      title: 'My Profile',
      subtitle: 'Driver details & documents',
      onPress: () => navigation.navigate('DriverProfile' as never),
    },
    {
      icon: 'car-outline',
      title: 'My Taxi & Route',
      subtitle: 'Vehicle info & route settings',
      onPress: () => navigation.navigate('DriverRequestPage' as never),
    },
    {
      icon: 'time-outline',
      title: 'Trip History',
      subtitle: 'Past rides & routes',
      onPress: () => navigation.navigate('EarningsPage' as never),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: () => navigation.navigate('Settings' as never),
    },
  ];

  const isRouteSet = currentRoute !== 'Not Set';

  const quickActions: QuickActionType[] = [
    {
      icon: 'location-outline',
      title: 'Current Route',
      value: isRouteSet ? 'Set' : 'Not Set',
      subtitle: isRouteSet ? currentRoute : 'Tap to set route',
      color: isRouteSet ? '#00A591' : '#FF9900',
      onPress: handleSetRoute,
    },
    {
      icon: 'car-outline',
      title: 'Available Seats',
      value: availableSeats.toString(),
      subtitle: `of 14 seats free`,
      color: '#FF9900',
      onPress: () => {},
    },
  ];

  const safetyOptions: SafetyOptionType[] = [
    {
      icon: 'call',
      title: 'Emergency Call',
      subtitle: 'Call 112 immediately',
      color: '#FF4444',
      onPress: () => {
        Alert.alert('Emergency Alert', 'This will contact emergency services (112)', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Get Help',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Emergency Alert Sent', 'Emergency services contacted.');
              setShowSafetyMenu(false);
            },
          },
        ]);
      },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: theme.surface,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: isDark ? theme.primary : '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
              onPress={() => setShowMenu(true)}
            >
              <Icon name="menu" size={24} color={isDark ? '#121212' : '#FF9900'} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>My Dashboard</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? theme.surface : '#ECD9C3',
              borderColor: isDark ? theme.border : '#D4A57D',
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#FF4444',
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? theme.text : '#C62828' }}>
              OFFLINE
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Earnings card */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.surface,
              borderRadius: 30,
              padding: 24,
              marginBottom: 20,
              alignItems: 'center',
              borderLeftWidth: 4,
              borderLeftColor: theme.primary,
              elevation: 4,
            }}
            onPress={() => navigation.navigate('EarningsPage' as never)}
          >
            <Text style={{ color: theme.primary, fontSize: 32, fontWeight: 'bold', marginBottom: 4 }}>
              R{(todaysEarnings ?? 0).toFixed(2)}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Today's Earnings
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
              Tap to view detailed breakdown
            </Text>
          </TouchableOpacity>

          {/* Offline section */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 30,
              padding: 24,
              marginBottom: 20,
              alignItems: 'center',
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isDark ? theme.primary : '#ECD9C3',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Icon name="car-outline" size={40} color={isDark ? '#121212' : '#FF9900'} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
              Ready to Pick Up Passengers?
            </Text>
            <Text style={{ fontSize: 16, color: theme.textSecondary, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
              Go online to start accepting seat reservation requests
            </Text>
            <TouchableOpacity
              style={{
                width: '100%',
                height: 56,
                borderRadius: 30,
                backgroundColor: isDark ? '#10B981' : '#00A591',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                elevation: 4,
              }}
              onPress={() => router.replace('/DriverOnline')}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#121212' : '#FFFFFF', marginLeft: 8 }}>
                GO ONLINE
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>
              Quick Overview
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: theme.surface,
                    borderRadius: 20,
                    padding: 16,
                    marginHorizontal: 4,
                    elevation: 4,
                    minHeight: 100,
                  }}
                  onPress={action.onPress}
                >
                  <Icon name={action.icon} size={24} color={action.color} style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary, marginBottom: 4 }}>
                    {action.title}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: action.color }}>{action.value}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.textSecondary }} numberOfLines={2}>
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Menu Modal */}
        {showMenu && (
          <Modal
            visible={showMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
              activeOpacity={1}
              onPress={() => setShowMenu(false)}
            >
              <View
                style={{
                  marginTop: 120,
                  marginLeft: 20,
                  backgroundColor: theme.surface,
                  borderRadius: 20,
                  paddingVertical: 8,
                  minWidth: 280,
                  maxWidth: '90%',
                  shadowColor: theme.shadow,
                  shadowOpacity: isDark ? 0.3 : 0.15,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 4,
                  elevation: 12,
                }}
              >
                <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>Menu</Text>
                </View>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      minHeight: 60,
                    }}
                    onPress={() => {
                      item.onPress();
                      setShowMenu(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.primary + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}>
                      <Icon name={item.icon} size={20} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 2 }}>{item.title}</Text>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.textSecondary }}>{item.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Safety Modal */}
        {showSafetyMenu && (
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2000,
            }}
            activeOpacity={1}
            onPress={() => setShowSafetyMenu(false)}
          >
            <View
              style={{
                position: 'absolute',
                bottom: 100,
                right: 20,
                backgroundColor: theme.surface,
                borderRadius: 20,
                padding: 8,
                minWidth: 200,
                shadowColor: theme.shadow,
                shadowOpacity: isDark ? 0.3 : 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 4,
                elevation: 8,
              }}
            >
              {safetyOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    minHeight: 50,
                    borderBottomWidth: index === safetyOptions.length - 1 ? 0 : 1,
                    borderBottomColor: theme.border,
                  }}
                  onPress={option.onPress}
                  activeOpacity={0.8}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    backgroundColor: option.color + '20',
                  }}>
                    <Icon name={option.icon} size={16} color={option.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text, marginBottom: 2 }}>{option.title}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>{option.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        )}
        {/* Safety Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 30,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#FF4444',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            zIndex: 1000,
          }}
          onPress={() => setShowSafetyMenu(true)}
        >
          <Icon name="shield-checkmark" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}