import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getRideById = query({
  args: {
    rideId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.rideId) {
      return null;
    }
    const ride = await ctx.db
      .query("rides")
      .withIndex("by_ride_id", (q) => q.eq("rideId", args.rideId))
      .first();
    return ride;
  },
}); 