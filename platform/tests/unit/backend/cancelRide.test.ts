import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { cancelRideHandler } from '../../../convex/functions/rides/cancelRide';

jest.mock('convex/values', () => ({ v: { string: jest.fn(() => 'string'), id: jest.fn(() => 'id') } }));
jest.mock('../../../convex/_generated/server', () => ({ mutation: jest.fn() }));

describe('cancelRide', () => {
  let ctx: any;
  const mockRideId = 'test_ride_123';
  const mockUserId = 'test_user_123';

  beforeEach(() => {
    ctx = {
      db: {
        query: jest.fn(),
        patch: jest.fn(),
      },
    };
  });

  it('should successfully cancel a ride', async () => {
    const mockRide = {
      _id: 'ride_123',
      rideId: mockRideId,
      passengerId: mockUserId,
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

    const result = await cancelRideHandler(ctx, {
      rideId: mockRideId,
      userId: mockUserId,
    });

    expect(result).toEqual({
      _id: mockRide._id,
      message: 'Ride cancelled successfully',
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(mockRide._id, {
      status: 'cancelled',
      cancelledAt: expect.any(Number),
      cancelledBy: mockUserId,
    });
  });

  it('should throw error when ride is not found', async () => {
    ctx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(null as unknown as never),
      }),
    });

    await expect(
      cancelRideHandler(ctx, {
        rideId: mockRideId,
        userId: mockUserId,
      })
    ).rejects.toThrow('Ride not found');
  });

  it('should throw error when user is not authorized to cancel the ride', async () => {
    const mockRide = {
      _id: 'ride_123',
      rideId: mockRideId,
      passengerId: 'different_user_123',
      status: 'requested',
    };

    ctx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(mockRide as unknown as never),
      }),
    });

    await expect(
      cancelRideHandler(ctx, {
        rideId: mockRideId,
        userId: mockUserId,
      })
    ).rejects.toThrow('User is not authorized to cancel this ride');
  });
});
