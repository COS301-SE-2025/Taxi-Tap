// tests/unit/backend/updateLocation.test.ts

// Mock the Convex server import so `mutation(config)` just returns `config`
jest.mock("../../../convex/_generated/server", () => ({
  mutation: jest.fn((config: any) => config),
}));

import { updateLocation } from "../../../convex/functions/locations/updateLocation";

// 🔧 Helper to mock Convex mutation context
const createMockMutationCtx = () => ({
  db: {
    query: jest.fn(),
    insert: jest.fn(),
    patch: jest.fn(),
  },
});

describe("updateLocation", () => {
  let mockCtx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = createMockMutationCtx();
  });

  it("inserts a new record when none exists", async () => {
    // ctx.db.query(...).withIndex(...).first() → null
    mockCtx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: async () => null,
      }),
    });

    const args = {
      userId: "user1",
      latitude: -25.7479,
      longitude: 28.2293,
    };

    // Call the handler directly
    await (updateLocation as any).handler(mockCtx, args);

    expect(mockCtx.db.insert).toHaveBeenCalledWith("locations", expect.objectContaining({
      userId: "user1",
      latitude: -25.7479,
      longitude: 28.2293,
    }));
    expect(mockCtx.db.patch).not.toHaveBeenCalled();
  });

  it("patches the existing record when found", async () => {
    const existing = { _id: "loc123" };

    mockCtx.db.query.mockReturnValue({
      withIndex: jest.fn().mockReturnValue({
        first: async () => existing,
      }),
    });

    const args = {
      userId: "user2",
      latitude: -26.2041,
      longitude: 28.0473,
    };

    await (updateLocation as any).handler(mockCtx, args);

    expect(mockCtx.db.patch).toHaveBeenCalledWith("loc123", expect.objectContaining({
      latitude: -26.2041,
      longitude: 28.0473,
    }));
    expect(mockCtx.db.insert).not.toHaveBeenCalled();
  });

  it("propagates errors from the database", async () => {
    mockCtx.db.query.mockImplementation(() => {
      throw new Error("DB is down");
    });

    await expect(
      (updateLocation as any).handler(mockCtx, {
        userId: "user3",
        latitude: 0,
        longitude: 0,
      })
    ).rejects.toThrow("DB is down");
  });
});
