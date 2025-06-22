jest.mock('convex/values', () => ({
  v: {
    string: jest.fn(() => 'string'),
  },
}));

jest.mock('../../../convex/_generated/server', () => ({
  query: jest.fn(),
  QueryCtx: {},
}));

import { displayRoutesHandler } from '../../../convex/functions/routes/displayRoutes';

// Mock QueryCtx helper
const createMockQueryCtx = () => ({
  db: {
    query: jest.fn(),
  },
});

describe('displayRoutesHandler', () => {
  let mockCtx: any;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn();
    mockCtx = createMockQueryCtx();
    mockCtx.db.query = mockQuery;
  });

  describe('successful fetch with geometry', () => {
    it('should return correct parsed names and coordinates', async () => {
      const mockRoutes = [
        { 
          name: 'City Center - Airport',
          geometry: {
            coordinates: [
              [28.12345, -25.98765],  // first coordinate: [latitude, longitude]
              [28.54321, -25.12345],  // last coordinate
            ],
            type: "LineString"
          }
        },
        { 
          name: 'Downtown - Suburb',
          geometry: {
            coordinates: [
              [28.0000, -26.0000],
              [28.1111, -26.2222],
            ],
            type: "LineString"
          }
        }
      ];

      mockQuery.mockReturnValue({ collect: jest.fn().mockResolvedValue(mockRoutes) });

      const result = await displayRoutesHandler(mockCtx);

      expect(result).toEqual([
        {
          start: 'City Center',
          destination: 'Airport',
          startCoords: { latitude: 28.12345, longitude: -25.98765 },
          destinationCoords: { latitude: 28.54321, longitude: -25.12345 }
        },
        {
          start: 'Downtown',
          destination: 'Suburb',
          startCoords: { latitude: 28.0000, longitude: -26.0000 },
          destinationCoords: { latitude: 28.1111, longitude: -26.2222 }
        }
      ]);
    });

    it('should handle missing coordinates gracefully', async () => {
      const mockRoutes = [
        { name: 'Only Name', geometry: { coordinates: [] } }
      ];

      mockQuery.mockReturnValue({ collect: jest.fn().mockResolvedValue(mockRoutes) });

      const result = await displayRoutesHandler(mockCtx);

      expect(result).toEqual([
        {
          start: 'Only Name',
          destination: null,
          startCoords: null,
          destinationCoords: null,
        }
      ]);
    });

    it('should handle missing geometry field gracefully', async () => {
      const mockRoutes = [
        { name: 'Fallback Test', geometry: null }
      ];

      mockQuery.mockReturnValue({ collect: jest.fn().mockResolvedValue(mockRoutes) });

      const result = await displayRoutesHandler(mockCtx);

      expect(result).toEqual([
        {
          start: 'Fallback Test',
          destination: null,
          startCoords: null,
          destinationCoords: null,
        }
      ]);
    });
  });

  describe('edge cases with names only', () => {
    it('should trim extra spaces around names', async () => {
      const mockRoutes = [
        { 
          name: '  North Side   -  South Side  ',
          geometry: { coordinates: [[28.1, -25.1], [28.2, -25.2]] }
        }
      ];

      mockQuery.mockReturnValue({ collect: jest.fn().mockResolvedValue(mockRoutes) });

      const result = await displayRoutesHandler(mockCtx);

      expect(result).toEqual([
        {
          start: 'North Side',
          destination: 'South Side',
          startCoords: { latitude: 28.1, longitude: -25.1 },
          destinationCoords: { latitude: 28.2, longitude: -25.2 },
        }
      ]);
    });

    it('should handle empty routes array', async () => {
      mockQuery.mockReturnValue({ collect: jest.fn().mockResolvedValue([]) });

      const result = await displayRoutesHandler(mockCtx);

      expect(result).toEqual([]);
    });
  });

  describe('database error', () => {
    it('should propagate database query errors', async () => {
      const dbError = new Error('Database failure');
      mockQuery.mockImplementation(() => { throw dbError });

      await expect(displayRoutesHandler(mockCtx)).rejects.toThrow('Database failure');
    });
  });
});