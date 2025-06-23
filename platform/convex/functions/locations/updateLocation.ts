import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateLocation = mutation({
  args: {
    userId: v.id("taxiTap_users"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, { userId, latitude, longitude }) => {
    // Lookup the existing location record (must exist)
    const loc = await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!loc) {
      throw new Error(`No location record found for user ${userId}`);
    }

    // Patch only the coords & timestamp
    await ctx.db.patch(loc._id, {
      latitude,
      longitude,
      updatedAt: new Date().toISOString(),
    });
  },
});
