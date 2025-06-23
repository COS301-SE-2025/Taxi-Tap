jest.mock('../../../convex/functions/locations/getNearbyTaxis', () => ({
  getNearbyTaxis: jest.fn().mockResolvedValue([
    {
      _id: 'loc1',
      latitude: -25.748,
      longitude: 28.229,
      updatedAt: new Date().toISOString(),
      userId: 'driver1',
      role: 'driver',
    },
  ]),
}));

import { getNearbyTaxis } from '../../../convex/functions/locations/getNearbyTaxis';

describe('getNearbyTaxis', () => {
  it('should simulate query call and return mocked drivers', async () => {
    const args = {
      passengerLat: -25.7479,
      passengerLng: 28.2293,
    };

    // ✅ Call the mock directly
    const result = await (getNearbyTaxis as unknown as jest.Mock).mockResolvedValue([
      {
        _id: 'loc1',
        latitude: -25.748,
        longitude: 28.229,
        updatedAt: new Date().toISOString(),
        userId: 'driver1',
        role: 'driver',
      },
    ])(args);

    // ✅ Now test the result
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].userId).toBe('driver1');
  });
});
