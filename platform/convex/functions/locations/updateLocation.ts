import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateLocation = mutation({
  args: {
    userId: v.id("taxiTap_users"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, { userId, latitude, longitude }) => {
    await ctx.db.insert("locations", {
      userId,
      latitude,
      longitude,
      updatedAt: new Date().toISOString(),
    });
  },
});
