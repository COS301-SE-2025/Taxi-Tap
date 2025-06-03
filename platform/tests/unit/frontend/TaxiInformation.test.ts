import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VehicleSelection from '../../../app/(tabs)/TaxiInformation';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    currentLat: '-25.7479',
    currentLng: '28.2293',
    currentName: 'Current Location',
    destinationLat: '-25.7824',
    destinationLng: '28.2753',
    destinationName: 'Menlyn Taxi Rank',
  })),
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
  })),
  router: {
    push: jest.fn(),
  },
}));

test('allows selecting a vehicle and reserving a seat', () => {
  // Create component instance without JSX
  const component = React.createElement(VehicleSelection);
  const { getByText, queryByText } = render(component);
  
  // Find and select a vehicle
  const vehiclePlate = getByText('YY 87 89 GP');
  const vehicleCard = vehiclePlate.parent.parent;
  fireEvent.press(vehicleCard);
  
  // Verify selection
  const checkmark = queryByText('✓');
  expect(checkmark).toBeTruthy();
  
  // Reserve seat
  fireEvent.press(getByText('Reserve Seat'));
  
  // Verify navigation
  expect(require('expo-router').router.push).toHaveBeenCalledWith({
    pathname: './SeatReserved',
    params: expect.objectContaining({
      plate: 'YY 87 89 GP',
      time: '3 min away',
      seats: '1 seat left',
      price: 'R12'
    })
  });
});