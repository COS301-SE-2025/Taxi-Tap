import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DriverHomeScreen from '../../../app/(tabs)/DriverHomeScreen';

// Mock the child components
jest.mock('../../../app/(tabs)/DriverOffline', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return function MockDriverOffline({ onGoOnline, todaysEarnings }: any) {
    return (
      <TouchableOpacity 
        testID="driver-offline-component"
        onPress={onGoOnline}
      >
        <Text testID="offline-earnings">Earnings: R{todaysEarnings.toFixed(2)}</Text>
        <Text testID="go-online-button">GO ONLINE</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock('../../../app/(tabs)/DriverOnline', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return function MockDriverOnline({ onGoOffline, todaysEarnings }: any) {
    return (
      <TouchableOpacity 
        testID="driver-online-component"
        onPress={onGoOffline}
      >
        <Text testID="online-earnings">Earnings: R{todaysEarnings.toFixed(2)}</Text>
        <Text testID="go-offline-button">GO OFFLINE</Text>
      </TouchableOpacity>
    );
  };
});

describe('DriverHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render DriverOffline component by default', () => {
    const { getByTestId, queryByTestId } = render(<DriverHomeScreen />);
    expect(getByTestId('driver-offline-component')).toBeTruthy();
    expect(queryByTestId('driver-online-component')).toBeNull();
  });

  it('should initialize with todaysEarnings as 0.00', () => {
    const { getByTestId } = render(<DriverHomeScreen />);
    expect(getByTestId('offline-earnings')).toHaveTextContent('Earnings: R0.00');
  });

  it('should switch between online and offline states', () => {
    const { getByTestId, queryByTestId } = render(<DriverHomeScreen />);
    
    // Initially offline
    expect(getByTestId('driver-offline-component')).toBeTruthy();
    
    // Go online
    fireEvent.press(getByTestId('go-online-button'));
    expect(getByTestId('driver-online-component')).toBeTruthy();
    expect(queryByTestId('driver-offline-component')).toBeNull();
    
    // Go offline
    fireEvent.press(getByTestId('go-offline-button'));
    expect(getByTestId('driver-offline-component')).toBeTruthy();
    expect(queryByTestId('driver-online-component')).toBeNull();
  });

  it('should maintain todaysEarnings value across state changes', () => {
    const { getByTestId } = render(<DriverHomeScreen />);
    
    // Check initial earnings
    expect(getByTestId('offline-earnings')).toHaveTextContent('Earnings: R0.00');
    
    // Go online
    fireEvent.press(getByTestId('go-online-button'));
    expect(getByTestId('online-earnings')).toHaveTextContent('Earnings: R0.00');
    
    // Go offline
    fireEvent.press(getByTestId('go-offline-button'));
    expect(getByTestId('offline-earnings')).toHaveTextContent('Earnings: R0.00');
  });
});