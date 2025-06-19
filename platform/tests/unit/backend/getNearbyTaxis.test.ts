// tests/unit/backend/getNearbyTaxis.test.ts

// Mock the Convex server import so `query(config)` just returns `config`
jest.mock("../../../convex/_generated/server", () => ({
  query: jest.fn((config: any) => config),
}));

import { getNearbyTaxis } from "../../../convex/functions/locations/getNearbyTaxis";

// 🔧 Helper to mock Convex query context
const createMockQueryCtx = () => ({
  db: {
    query: jest.fn(),
  },
});

describe("getNearbyTaxis", () => {
  let mockCtx: any;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = createMockQueryCtx();
    mockQuery = mockCtx.db.query;
  });

  describe("basic distance filtering", () => {
    it("returns only taxis within 5km radius", async () => {
      const passengerLat = -25.7479;
      const passengerLng = 28.2293;

      const mockLocations = [
        {
          _id: "loc1",
          userId: "user1",
          latitude: -25.7481,
          longitude: 28.2291,
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "loc2",
          userId: "user2",
          latitude: -26.2041,
          longitude: 28.0473,
          updatedAt: new Date().toISOString(),
        },
      ];

      mockQuery.mockReturnValue({
        collect: jest.fn().mockResolvedValue(mockLocations),
      });

      // Cast to any so TS lets us call it directly
      const result = await (getNearbyTaxis as any)(mockCtx, {
        passengerLat,
        passengerLng,
      });

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("user1");
    });

    it("returns empty array if no taxis are nearby", async () => {
      const mockLocations = [
        {
          _id: "loc3",
          userId: "user3",
          latitude: -26.5,
          longitude: 28.7,
          updatedAt: new Date().toISOString(),
        },
      ];

      mockQuery.mockReturnValue({
        collect: jest.fn().mockResolvedValue(mockLocations),
      });

      const result = await (getNearbyTaxis as any)(mockCtx, {
        passengerLat: -25.7479,
        passengerLng: 28.2293,
      });

      expect(result).toEqual([]);
    });

    it("handles empty database response", async () => {
      mockQuery.mockReturnValue({
        collect: jest.fn().mockResolvedValue([]),
      });

      const result = await (getNearbyTaxis as any)(mockCtx, {
        passengerLat: -25.7479,
        passengerLng: 28.2293,
      });

      expect(result).toEqual([]);
    });

    it("throws error on db failure", async () => {
      mockQuery.mockImplementation(() => {
        throw new Error("DB failed");
      });

      await expect(
        (getNearbyTaxis as any)(mockCtx, {
          passengerLat: -25.7479,
          passengerLng: 28.2293,
        })
      ).rejects.toThrow("DB failed");
    });
  });
});
