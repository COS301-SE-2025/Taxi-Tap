jest.mock('convex/values', () => ({
  v: {
    string: jest.fn(() => 'string'),
    id: jest.fn(() => 'id'),
  },
}));

jest.mock('../../../convex/_generated/server', () => ({
  mutation: jest.fn(),
}));

import { cancelRide } from '../../../convex/functions/rides/cancelRide';

const createMockMutationCtx = () => ({
  db: {
    query: jest.fn(),
    patch: jest.fn(),
  },
});

describe('cancelRide', () => {
  let mockCtx: any;
  let mockQuery: jest.Mock;
  let mockWithIndex: jest.Mock;
  let mockUnique: jest.Mock;
  let mockPatch: jest.Mock;

  const rideId = 'ride123';
  const userId = 'user_abc';
  const rideDocId = 'ride_doc_id';

  beforeEach(() => {
    jest.clearAllMocks();

    mockUnique = jest.fn();
    mockWithIndex = jest.fn().mockReturnValue({ unique: mockUnique });
    mockQuery = jest.fn().mockReturnValue({ withIndex: mockWithIndex });
    mockPatch = jest.fn();

    mockCtx = createMockMutationCtx();
    mockCtx.db.query = mockQuery;
    mockCtx.db.patch = mockPatch;
  });

  it('successfully cancels a ride', async () => {
    const mockRide = {
      _id: rideDocId,
      rideId,
      passengerId: userId,
    };

    mockUnique.mockResolvedValue(mockRide);

    const result = await cancelRide(mockCtx, { rideId, userId });

    expect(mockQuery).toHaveBeenCalledWith('rides');
    expect(mockWithIndex).toHaveBeenCalledWith('by_ride_id', expect.any(Function));

    const mockQ = { eq: jest.fn().mockReturnValue('filtered_query') };
    mockWithIndex.mock.calls[0][1](mockQ); // run the filter callback
    expect(mockQ.eq).toHaveBeenCalledWith('rideId', rideId);

    expect(mockPatch).toHaveBeenCalledWith(rideDocId, { status: 'cancelled' });
    expect(result).toEqual({ success: true, message: 'Ride cancelled successfully' });
  });

  it('throws error if ride is not found', async () => {
    mockUnique.mockResolvedValue(null);

    await expect(cancelRide(mockCtx, { rideId, userId }))
      .rejects.toThrow('Ride not found');

    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('throws error if user is not the passenger', async () => {
    const mockRide = {
      _id: rideDocId,
      rideId,
      passengerId: 'other_user',
    };

    mockUnique.mockResolvedValue(mockRide);

    await expect(cancelRide(mockCtx, { rideId, userId }))
      .rejects.toThrow('You are not authorized to cancel this ride');

    expect(mockPatch).not.toHaveBeenCalled();
  });
});
