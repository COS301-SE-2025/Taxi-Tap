const { createQueryCtx } = require('../../mocks/convex-server');
const { 
  getRouteStopsHandler, 
  getRoutesWithCoordinatesHandler,
  getAllStartPointsHandler,
  getDestinationsByStartPointHandler,
  getRoutesByStartPointHandler,
  getAllTaxiAssociationsHandler
} = require('../../../convex/functions/routes/queries');

// Mock data for testing
const mockRoutes = [
  {
    _id: 'route1',
    name: 'Johannesburg CBD-Pretoria CBD',
    stops: [
      { id: '1', name: 'Johannesburg CBD', coordinates: [-26.2041, 28.0473], order: 1 },
      { id: '2', name: 'Sandton', coordinates: [-26.1067, 28.0567], order: 2 },
      { id: '3', name: 'Pretoria CBD', coordinates: [-25.7479, 28.2293], order: 3 }
    ],
    isActive: true,
    taxiAssociation: "PTA Taxi Association",
    geometry: {
      type: "LineString",
      coordinates: [[-26.2041, 28.0473], [-26.1067, 28.0567], [-25.7479, 28.2293]]
    }
  },
  {
    _id: 'route2',
    name: 'Cape Town CBD-Stellenbosch',
    stops: [
      { id: '4', name: 'Cape Town CBD', coordinates: [-33.9249, 18.4241], order: 1 },
      { id: '5', name: 'Bellville', coordinates: [-33.9044, 18.6326], order: 2 },
      { id: '6', name: 'Stellenbosch', coordinates: [-33.9321, 18.8602], order: 3 }
    ],
    isActive: true,
    taxiAssociation: "CPT Taxi Association",
    geometry: {
      type: "LineString",
      coordinates: [[-33.9249, 18.4241], [-33.9044, 18.6326], [-33.9321, 18.8602]]
    }
  }
];

// Mock QueryCtx
const createMockQueryCtx = (routes = mockRoutes) => {
  const ctx = createQueryCtx();
  ctx.db.query = jest.fn().mockImplementation((table: string) => ({
    collect: jest.fn().mockResolvedValue(routes)
  }));
  return ctx;
};

describe('Route Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRouteStopsHandler', () => {
    it('should return stops for a given route', async () => {
      const ctx = createMockQueryCtx();
      const args = {
        startPoint: 'Johannesburg CBD',
        endPoint: 'Pretoria CBD'
      };

      const stops = await getRouteStopsHandler(ctx, args);
      
      expect(stops).toBeDefined();
      expect(Array.isArray(stops)).toBe(true);
      if (stops.length > 0) {
        expect(stops[0]).toHaveProperty('name');
        expect(stops[0]).toHaveProperty('order');
        expect(stops[0]).toHaveProperty('coordinates');
      }
    });
  });

  describe('getRoutesWithCoordinatesHandler', () => {
    it('should return routes with coordinates', async () => {
      const ctx = createMockQueryCtx();
      const routes = await getRoutesWithCoordinatesHandler(ctx);

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      if (routes.length > 0) {
        expect(routes[0]).toHaveProperty('start');
        expect(routes[0]).toHaveProperty('destination');
        expect(routes[0]).toHaveProperty('startCoords');
        expect(routes[0]).toHaveProperty('destinationCoords');
      }
    });
  });

  describe('getAllStartPointsHandler', () => {
    it('should return unique start points', async () => {
      const ctx = createMockQueryCtx();
      const startPoints = await getAllStartPointsHandler(ctx);

      expect(startPoints).toBeDefined();
      expect(Array.isArray(startPoints)).toBe(true);
      expect(startPoints).toContain('Johannesburg CBD');
      expect(startPoints).toContain('Cape Town CBD');
    });
  });

  describe('getDestinationsByStartPointHandler', () => {
    it('should return destinations for a given start point', async () => {
      const ctx = createMockQueryCtx();
      const destinations = await getDestinationsByStartPointHandler(ctx, { startPoint: 'Johannesburg CBD' });

      expect(destinations).toBeDefined();
      expect(Array.isArray(destinations)).toBe(true);
      expect(destinations).toContain('Pretoria CBD');
    });
  });

  describe('getRoutesByStartPointHandler', () => {
    it('should return routes for a given start point', async () => {
      const ctx = createMockQueryCtx();
      const routes = await getRoutesByStartPointHandler(ctx, { startPoint: 'Johannesburg CBD' });

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      if (routes.length > 0) {
        expect(routes[0]).toHaveProperty('start');
        expect(routes[0]).toHaveProperty('destination');
        expect(routes[0]).toHaveProperty('startCoords');
        expect(routes[0]).toHaveProperty('destinationCoords');
      }
    });
  });

  describe('getAllTaxiAssociationsHandler', () => {
    it('should return unique taxi associations', async () => {
      const ctx = createMockQueryCtx();
      const associations = await getAllTaxiAssociationsHandler(ctx);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations).toContain('PTA Taxi Association');
      expect(associations).toContain('CPT Taxi Association');
    });
  });
});