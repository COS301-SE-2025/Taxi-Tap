import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";

export const completeRide = mutation({
  args: {
    rideId: v.string(),
    driverId: v.id("taxiTap_users"),
  },
  handler: async (ctx, args) => {
    // Find the ride
    const ride = await ctx.db
      .query("rides")
      .withIndex("by_ride_id", (q) => q.eq("rideId", args.rideId))
      .first();

    if (!ride) {
      throw new Error("Ride not found");
    }
    if (ride.driverId !== args.driverId) {
      throw new Error("Only the assigned driver can complete this ride");
    }
    if (ride.status !== "accepted") {
      throw new Error("Ride is not in progress");
    }

    // Update the ride status
    await ctx.db.patch(ride._id, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Notify the passenger
    await ctx.runMutation(api.functions.notifications.sendNotifications.sendNotification, {
      userId: ride.passengerId,
      type: "ride_completed",
      title: "Ride Completed",
      message: "Your ride has been marked as completed by the driver.",
      priority: "normal",
      metadata: { rideId: args.rideId, driverId: args.driverId },
    });

    return {
      _id: ride._id,
      message: "Ride marked as completed.",
    };
  },
}); 