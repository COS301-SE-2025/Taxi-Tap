import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Updates the information for a driver's taxi.
 * The driver must be authenticated.
 * All fields are optional, so only provided fields will be updated.
 */
export const updateTaxiInfo = mutation({
  args: {
    userId: v.id("taxiTap_users"),
    licensePlate: v.optional(v.string()),
    model: v.optional(v.string()),
    color: v.optional(v.string()),
    year: v.optional(v.number()),
    image: v.optional(v.string()),
    capacity: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find the driver profile for the given user
    const driverProfile = await ctx.db
      .query("drivers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    if (!driverProfile) {
      throw new Error("Could not find a driver profile for the current user.");
    }

    // Find the taxi associated with this driver
    const taxi = await ctx.db
      .query("taxis")
      .withIndex("by_driver_id", (q) => q.eq("driverId", driverProfile._id))
      .unique();

    if (!taxi) {
      throw new Error("Could not find a taxi for this driver.");
    }

    // Remove userId from the update object to match the taxis schema
    const { userId, ...taxiFields } = args;
    await ctx.db.patch(taxi._id, { ...taxiFields, updatedAt: Date.now() });

    return { success: true, taxiId: taxi._id };
  },
}); 