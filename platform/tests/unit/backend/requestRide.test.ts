import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { requestRideHandler } from '../../../convex/functions/rides/RequestRide';

jest.mock('convex/values', () => ({ v: { string: jest.fn(() => 'string'), id: jest.fn(() => 'id'), object: jest.fn(() => ({})), number: jest.fn(() => 0), optional: jest.fn((x) => x) } }));
jest.mock('../../../convex/_generated/server', () => ({ mutation: jest.fn() }));

describe('requestRide', () => {
  let ctx: any;
  const mockPassengerId = 'test_passenger_123';
  const mockStartLocation = {
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    address: 'San Francisco, CA',
  };
  const mockEndLocation = {
    coordinates: {
      latitude: 37.7833,
      longitude: -122.4167,
    },
    address: 'San Francisco Financial District',
  };

  beforeEach(() => {
    ctx = {
      db: {
        insert: jest.fn(),
      },
    };
  });

  it('should successfully request a ride', async () => {
    const mockInsertedId = 'new_ride_123';
    ctx.db.insert.mockResolvedValue(mockInsertedId as unknown as never);

    const result = await requestRideHandler(ctx, {
      passengerId: mockPassengerId,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      estimatedFare: 25.50,
      estimatedDistance: 5.2,
    });

    expect(result._id).toBe(mockInsertedId);
    expect(result.rideId).toMatch(/^ride_\d+_[a-zA-Z0-9]+$/);
    expect(result.message).toBe(
      `Ride requested successfully from ${mockStartLocation.address} to ${mockEndLocation.address}`
    );

    expect(ctx.db.insert).toHaveBeenCalledWith('rides', {
      rideId: expect.any(String),
      passengerId: mockPassengerId,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      status: 'requested',
      requestedAt: expect.any(Number),
      estimatedFare: 25.50,
      estimatedDistance: 5.2,
    });
  });

  it('should handle ride request without optional parameters', async () => {
    const mockInsertedId = 'new_ride_123';
    ctx.db.insert.mockResolvedValue(mockInsertedId as unknown as never);

    const result = await requestRideHandler(ctx, {
      passengerId: mockPassengerId,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
    });

    expect(result._id).toBe(mockInsertedId);
    expect(ctx.db.insert).toHaveBeenCalledWith('rides', {
      rideId: expect.any(String),
      passengerId: mockPassengerId,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      status: 'requested',
      requestedAt: expect.any(Number),
      estimatedFare: undefined,
      estimatedDistance: undefined,
    });
  });

  it('should generate unique ride IDs', async () => {
    const mockInsertedId = 'new_ride_123';
    ctx.db.insert.mockResolvedValue(mockInsertedId as unknown as never);

    const result1 = await requestRideHandler(ctx, {
      passengerId: mockPassengerId,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
    });

    const result2 = await requestRideHandler(ctx, {
      passengerId: mockPassengerId,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
    });

    expect(result1.rideId).not.toBe(result2.rideId);
  });
}); 