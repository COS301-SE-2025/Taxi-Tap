import { switchBothToDriverHandler } from "../../../convex/functions/users/UserManagement/switchBothtoDriver";
import { MutationCtx } from "../../../convex/_generated/server";

// Full mock convex/values (prevents type errors from Convex import)
jest.mock("convex/values", () => ({
  v: {
    id: jest.fn(() => ({})),
    string: jest.fn(() => ({})),
    number: jest.fn(() => ({})),
    literal: jest.fn((val) => val),
    union: jest.fn((...args) => args),
    optional: jest.fn((val) => val),
  },
}));

describe("switchBothToDriverHandler", () => {
  let ctx: MutationCtx;

  beforeEach(() => {
    jest.clearAllMocks();

    ctx = {
      db: {
        query: jest.fn(),
        patch: jest.fn(),
      },
    } as unknown as MutationCtx;
  });

  it("throws error if user not found", async () => {
    // Mock query for user returning null
    (ctx.db.query as any).mockReturnValue({
      filter: jest.fn(() => ({
        first: jest.fn().mockResolvedValue(null),
      })),
    });

    await expect(
      switchBothToDriverHandler(ctx, { userId: "user1" as any })
    ).rejects.toThrow("User not found");
  });

  it("throws error if user does not have 'both' accountType", async () => {
    (ctx.db.query as any).mockReturnValue({
      filter: jest.fn(() => ({
        first: jest.fn().mockResolvedValue({
          _id: "user1",
          accountType: "driver",
        }),
      })),
    });

    await expect(
      switchBothToDriverHandler(ctx, { userId: "user1" as any })
    ).rejects.toThrow("User does not currently have both account types");
  });

  it("throws error if user has active passenger rides", async () => {
    // First query - user found with 'both' accountType
    (ctx.db.query as any).mockReturnValueOnce({
      filter: jest.fn(() => ({
        first: jest.fn().mockResolvedValue({
          _id: "user1",
          accountType: "both",
        }),
      })),
    });

    // Second query - passenger rides query returns active ride
    (ctx.db.query as any).mockReturnValueOnce({
      withIndex: jest.fn(() => ({
        filter: jest.fn(() => ({
          first: jest.fn().mockResolvedValue({
            _id: "ride1",
          }),
        })),
      })),
    });

    await expect(
      switchBothToDriverHandler(ctx, { userId: "user1" as any })
    ).rejects.toThrow("Cannot switch to driver-only while you have active rides as a passenger");
  });

  it("successfully switches account to driver only", async () => {
    // User found with 'both' accountType
    (ctx.db.query as any).mockReturnValueOnce({
      filter: jest.fn(() => ({
        first: jest.fn().mockResolvedValue({
          _id: "user1",
          accountType: "both",
        }),
      })),
    });

    // No active passenger rides
    (ctx.db.query as any).mockReturnValueOnce({
      withIndex: jest.fn(() => ({
        filter: jest.fn(() => ({
          first: jest.fn().mockResolvedValue(null),
        })),
      })),
    });

    const result = await switchBothToDriverHandler(ctx, { userId: "user1" as any });

    expect(result).toEqual({
      success: true,
      message: "Account switched to driver only",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("user1", expect.objectContaining({
      accountType: "driver",
      currentActiveRole: "driver",
    }));
  });
});