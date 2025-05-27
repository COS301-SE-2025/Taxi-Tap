import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import * as Location from 'expo-location';

// Type definitions for better TypeScript support
interface MockLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
}

interface MockGeocodedLocation {
  name?: string | null;
  street?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

// Import the actual component without type checking issues
const HomeScreen = require('../../../app/(tabs)/HomeScreen').default;

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

// Mock ThemeContext
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      primary: '#FFB84D',
      card: '#F5F5F5',
      surface: '#FFFFFF',
      border: '#E0E0E0',
      shadow: '#000000',
    },
    isDark: false,
  }),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  const React = require('react');
  
  const MockImage = (props: any) => React.createElement('Image', props);
  
  return {
    ...actualRN,
    Image: MockImage,
    ScrollView: (props: any) => React.createElement('ScrollView', props, props.children),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props, props.children),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props);
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  
  const MockMapView = (props: any) => {
    const ref = React.useRef();
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
    }));
    return React.createElement('MapView', { ...props, ref });
  };
  
  const MockMarker = (props: any) => {
    return React.createElement('Marker', props);
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

// Get references to mocked components
const MockMapView = require('react-native-maps').default;
const MockMarker = require('react-native-maps').Marker;
const MockImage = require('react-native').Image;

// Create properly typed mocks for expo-location
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockReverseGeocodeAsync = jest.fn();

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: mockRequestForegroundPermissionsAsync,
  getCurrentPositionAsync: mockGetCurrentPositionAsync,
  reverseGeocodeAsync: mockReverseGeocodeAsync,
  Accuracy: {
    Highest: 6,
  },
}));

// Mock the loading image
jest.mock('../../assets/images/loading4.png', () => 'loading4.png');

describe('HomeScreen Geolocation Tests', () => {
  const mockLocation: MockLocation = {
    coords: {
      latitude: -25.7461,
      longitude: 28.1881,
      accuracy: 10,
      altitude: 1000,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  };

  const mockGeocodedLocation: MockGeocodedLocation = {
    name: 'Test Location',
    street: 'Test Street',
    city: 'Pretoria',
    region: 'Gauteng',
    country: 'South Africa',
    postalCode: '0001',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.warn to avoid noise in test output
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Location Permission Request', () => {
    test('should request location permission on component mount', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      }, { timeout: 5000 });
    });

    test('should handle permission denial gracefully', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      }, { timeout: 5000 });

      // Give some time for the component to process the permission denial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should not attempt to get current position when permission denied
      expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Permission to access location was denied');
    });
  });

  describe('Location Fetching', () => {
    beforeEach(() => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
    });

    test('should fetch current position with highest accuracy when permission granted', async () => {
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({
          accuracy: Location.Accuracy.Highest,
        });
      }, { timeout: 5000 });
    });

    test('should handle location fetching errors gracefully', async () => {
      const locationError = new Error('Location unavailable');
      mockGetCurrentPositionAsync.mockRejectedValue(locationError);

      const { getByText } = render(React.createElement(HomeScreen));

      // Should still show loading state initially
      expect(getByText('Getting current location...')).toBeTruthy();

      await waitFor(() => {
        expect(mockGetCurrentPositionAsync).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Component should still render without crashing
      // The loading state should persist since location failed
      expect(getByText('Getting current location...')).toBeTruthy();
    });
  });

  describe('Reverse Geocoding', () => {
    beforeEach(() => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
    });

    test('should reverse geocode the current location coordinates', async () => {
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(mockReverseGeocodeAsync).toHaveBeenCalledWith({
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
        });
      }, { timeout: 5000 });
    });

    test('should format and display complete location name', async () => {
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);
      
      const { getByText } = render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(getByText('Test Location Test Street, Pretoria')).toBeTruthy();
      }, { timeout: 5000 });
    });

    test('should handle partial address components in geocoded result', async () => {
      const incompleteGeocodedLocation: MockGeocodedLocation = {
        name: null,
        street: null,
        city: 'Pretoria',
        region: null,
      };
      
      mockReverseGeocodeAsync.mockResolvedValue([incompleteGeocodedLocation]);
      
      const { getByText } = render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(getByText(', Pretoria')).toBeTruthy();
      }, { timeout: 5000 });
    });

    test('should show "Unknown Location" when geocoding returns empty result', async () => {
      mockReverseGeocodeAsync.mockResolvedValue([{}]);
      
      const { getByText } = render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(getByText('Unknown Location')).toBeTruthy();
      }, { timeout: 5000 });
    });

    test('should handle geocoding errors gracefully', async () => {
      mockReverseGeocodeAsync.mockRejectedValue(new Error('Geocoding failed'));

      const { getByText } = render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(mockReverseGeocodeAsync).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Component should still render without crashing
      // Should still show loading state if geocoding fails
      expect(getByText('Getting current location...')).toBeTruthy();
    });

    test('should handle null/undefined values in geocoded location', async () => {
      const nullGeocodedLocation: MockGeocodedLocation = {
        name: null,
        street: undefined,
        city: null,
        region: undefined,
      };

      mockReverseGeocodeAsync.mockResolvedValue([nullGeocodedLocation]);

      const { getByText } = render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(getByText('Unknown Location')).toBeTruthy();
      }, { timeout: 5000 });
    });
  });

  describe('Map Integration with Location', () => {
    beforeEach(() => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);
    });

    test('should render map when location is successfully obtained', async () => {
      const component = render(React.createElement(HomeScreen));

      await waitFor(() => {
        const mapComponent = component.UNSAFE_getByType(MockMapView);
        expect(mapComponent).toBeTruthy();
      }, { timeout: 5000 });
    });

    test('should place current location marker on map', async () => {
      const component = render(React.createElement(HomeScreen));

      await waitFor(() => {
        const markers = component.UNSAFE_getAllByType(MockMarker);
        expect(markers.length).toBeGreaterThanOrEqual(1);
        
        // Find the current location marker
        const currentLocationMarker = markers.find(marker => 
          marker.props.title === 'You are here'
        );
        
        expect(currentLocationMarker).toBeTruthy();
        expect(currentLocationMarker?.props.coordinate).toEqual({
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
        });
        expect(currentLocationMarker?.props.pinColor).toBe('blue');
      }, { timeout: 5000 });
    });

    test('should show loading image when location is not available', async () => {
      // Mock permission denied to prevent location fetching
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      const component = render(React.createElement(HomeScreen));

      // Should show loading image instead of map
      const imageComponent = component.UNSAFE_getByType(MockImage);
      expect(imageComponent).toBeTruthy();
      expect(imageComponent.props.source).toEqual(require('../../assets/images/loading4.png'));
    });
  });

  describe('Location State Management', () => {
    test('should display loading text initially', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      const { getByText } = render(React.createElement(HomeScreen));

      // Should show loading text initially before location is fetched
      expect(getByText('Getting current location...')).toBeTruthy();
    });

    test('should update location state when geolocation succeeds', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      const { getByText } = render(React.createElement(HomeScreen));

      // Wait for location to be processed and displayed
      await waitFor(() => {
        expect(getByText('Test Location Test Street, Pretoria')).toBeTruthy();
      }, { timeout: 5000 });
    });

    test('should only fetch location once on component mount', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      const { rerender } = render(React.createElement(HomeScreen));
      
      await waitFor(() => {
        expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      }, { timeout: 5000 });

      // Clear the mock call count
      mockRequestForegroundPermissionsAsync.mockClear();
      mockGetCurrentPositionAsync.mockClear();
      mockReverseGeocodeAsync.mockClear();

      // Rerender shouldn't trigger another location request
      rerender(React.createElement(HomeScreen));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should not be called again after rerender
      expect(mockRequestForegroundPermissionsAsync).not.toHaveBeenCalled();
      expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
      expect(mockReverseGeocodeAsync).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases for Geolocation', () => {
    test('should handle very long location names without breaking', async () => {
      const longGeocodedLocation: MockGeocodedLocation = {
        name: 'Very Very Very Long Location Name That Might Cause Display Issues',
        street: 'Extremely Long Street Name That Goes On And On',
        city: 'Very Long City Name',
        region: 'Long Region Name',
      };

      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);
      mockReverseGeocodeAsync.mockResolvedValue([longGeocodedLocation]);

      const { getByText } = render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(getByText(expect.stringContaining('Very Very Very Long Location Name'))).toBeTruthy();
      }, { timeout: 5000 });
    });

    test('should handle location with extreme coordinates', async () => {
      const extremeLocation: MockLocation = {
        coords: {
          latitude: -89.9999,
          longitude: 179.9999,
          accuracy: 1,
          altitude: 8848,
          altitudeAccuracy: 1,
          heading: 359,
          speed: 100,
        },
        timestamp: Date.now(),
      };

      mockRequestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockGetCurrentPositionAsync.mockResolvedValue(extremeLocation);
      mockReverseGeocodeAsync.mockResolvedValue([mockGeocodedLocation]);

      render(React.createElement(HomeScreen));

      await waitFor(() => {
        expect(mockReverseGeocodeAsync).toHaveBeenCalledWith({
          latitude: extremeLocation.coords.latitude,
          longitude: extremeLocation.coords.longitude,
        });
      }, { timeout: 5000 });
    });
  });
});