import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { acceptRideHandler } from '../../../convex/functions/rides/acceptRide';

jest.mock('convex/values', () => ({ v: { string: jest.fn(() => 'string'), id: jest.fn(() => 'id') } }));
jest.mock('../../../convex/_generated/server', () => ({ mutation: jest.fn() }));

describe('acceptRide', () => {
  let ctx: any;
  const mockRideId = 'test_ride_123';
  const mockDriverId = 'test_driver_123';

  beforeEach(() => {
    ctx = {
      db: {
        query: jest.fn(),
        patch: jest.fn(),
      },
    };
  });

  it('should successfully accept a ride', async () => {
    const mockRide = {
      _id: 'ride_123',
      rideId: mockRideId,
      status: 'requested',
    };

    ctx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(mockRide as unknown as never),
      }),
    });

    ctx.db.patch.mockResolvedValue({
      _id: mockRide._id,
    });

    const result = await acceptRideHandler(ctx, {
      rideId: mockRideId,
      driverId: mockDriverId,
    });

    expect(result).toEqual({
      _id: mockRide._id,
      message: 'Ride accepted successfully',
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(mockRide._id, {
      status: 'accepted',
      driverId: mockDriverId,
      acceptedAt: expect.any(Number),
    });
  });

  it('should throw error when ride is not found', async () => {
    ctx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(null as unknown as never),
      }),
    });

    await expect(
      acceptRideHandler(ctx, {
        rideId: mockRideId,
        driverId: mockDriverId,
      })
    ).rejects.toThrow('Ride not found');
  });

  it('should throw error when ride is not in requested status', async () => {
    const mockRide = {
      _id: 'ride_123',
      rideId: mockRideId,
      status: 'accepted',
    };

    ctx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(mockRide as unknown as never),
      }),
    });

    await expect(
      acceptRideHandler(ctx, {
        rideId: mockRideId,
        driverId: mockDriverId,
      })
    ).rejects.toThrow('Ride is not available for acceptance');
  });
}); 