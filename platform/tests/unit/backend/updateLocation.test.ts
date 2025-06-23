import { jest } from '@jest/globals';

// Step 1: Mock it BEFORE the import
jest.mock('../../../convex/functions/locations/updateLocation', () => {
  return {
    updateLocation: jest.fn(), // mock the mutation as a function
  };
});

import { updateLocation } from '../../../convex/functions/locations/updateLocation';

describe('updateLocation', () => {
  it('should simulate mutation call with mock args', async () => {
    const args = {
      userId: 'user_abc123',
      latitude: -25.748,
      longitude: 28.229,
    };

    // Step 2: Explicitly cast as jest.Mock for type-safe calling
    const mockedFn = updateLocation as unknown as jest.Mock;

    // Step 3: Call the mocked mutation
    await mockedFn(args);

    // Step 4: Verify it was called correctly
    expect(mockedFn).toHaveBeenCalledWith(args);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });
});
