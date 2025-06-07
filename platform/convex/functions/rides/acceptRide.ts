//i am hoping to write a function that accepts a ride request and updates the ride status in the database,as well as assigns a driver to that ride.
//have to change the ride status to "accepted" and assign the driver to the ride.
//need to change rides table in schema to include driverId and status
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    rideId: v.string(),
    driverId: v.id("taxiTap_users"),
  },
  async handler(ctx, args) {
    // Find the ride
    const ride = await ctx.db
      .query("rides")
      .withIndex("by_ride_id", (q) => q.eq("rideId", args.rideId))
      .unique();

    if (!ride) {
      throw new Error("Ride not found");
    }
    if (ride.status !== "requested") {
      throw new Error("Ride is not available for acceptance");
    }

    // Update the ride
    await ctx.db.patch(ride._id, {
      status: "accepted",
      driverId: args.driverId,
      acceptedAt: Date.now(),
    });

    return { success: true };
  },
});