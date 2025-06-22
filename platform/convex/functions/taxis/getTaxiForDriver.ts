import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Gets the taxi information for the given driver userId.
 */
export const getTaxiForDriver = query({
  args: {
    userId: v.id("taxiTap_users"),
  },
  handler: async (ctx, args) => {
    // Find the driver profile for the given user
    const driverProfile = await ctx.db
      .query("drivers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    if (!driverProfile) {
      // No driver profile found for this user.
      return null;
    }

    // Find the taxi associated with this driver
    const taxi = await ctx.db
      .query("taxis")
      .withIndex("by_driver_id", (q) => q.eq("driverId", driverProfile._id))
      .unique();

    return taxi;
  },
}); 