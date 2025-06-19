import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateLocation = mutation({
  args: {
    userId: v.id("taxiTap_users"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, { userId, latitude, longitude }) => {
    const existing = await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const updatedAt = new Date().toISOString();

    if (existing) {
      await ctx.db.patch(existing._id, { latitude, longitude, updatedAt });
    } else {
      await ctx.db.insert("locations", { userId, latitude, longitude, updatedAt });
    }
  },
});
