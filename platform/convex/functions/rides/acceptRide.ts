//i am hoping to write a function that accepts a ride request and updates the ride status in the database,as well as assigns a driver to that ride.
//have to change the ride status to "accepted" and assign the driver to the ride.
//need to change rides table in schema to include driverId and status
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
// import { Doc } from "./_generated/dataModel";

export const acceptRideHandler = async (
  ctx: any,
  args: {
    rideId: string;
    driverId: string;
  }
) => {
  // Find the ride
  const ride = await ctx.db
    .query("rides")
    .withIndex("by_ride_id", (q: { eq: (field: string, value: string) => any }) => q.eq("rideId", args.rideId))
    .first();

  if (!ride) {
    throw new Error("Ride not found");
  }
  if (ride.status !== "requested") {
    throw new Error("Ride is not available for acceptance");
  }

  // Update the ride
  const updatedRide = await ctx.db.patch(ride._id, {
    status: "accepted",
    driverId: args.driverId,
    acceptedAt: Date.now(),
  });

  // Notify the passenger using the internal ride notification system
  await ctx.runMutation(internal.functions.notifications.rideNotifications.sendRideNotification, {
    rideId: args.rideId,
    type: "ride_accepted",
    driverId: args.driverId,
  });

  return {
    _id: updatedRide._id,
    message: "Ride accepted successfully",
  };
};

export const acceptRide = mutation({
  args: {
    rideId: v.string(),
    driverId: v.id("taxiTap_users"),
  },
  handler: acceptRideHandler,
});