//i am hoping to write a function that accepts a ride request and updates the ride status in the database,as well as assigns a driver to that ride.
//have to change the ride status to "accepted" and assign the driver to the ride.
//need to change rides table in schema to include driverId and status
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { acceptRideHandler } from "./acceptRideHandler";
// import { Doc } from "./_generated/dataModel";

export const acceptRideHandler = async (
  ctx: any,
  args: {
    rideId: string;
    driverId: string;
  }
) => {
  console.log("acceptRideHandler called with args:", args);
  
  // Find the ride
  const ride = await ctx.db
    .query("rides")
    .withIndex("by_ride_id", (q: { eq: (field: string, value: string) => any }) => q.eq("rideId", args.rideId))
    .first();

  console.log("Found ride:", ride);

  if (!ride) {
    console.log("Ride not found for rideId:", args.rideId);
    throw new Error("Ride not found");
  }
  if (ride.status !== "requested") {
    console.log("Ride status is not 'requested', current status:", ride.status);
    throw new Error("Ride is not available for acceptance");
  }

  console.log("Updating ride with _id:", ride._id);

  // Update the ride
  const updatedRideId = await ctx.db.patch(ride._id, {
    status: "accepted",
    driverId: args.driverId,
    acceptedAt: Date.now(),
  });

  console.log("Ride updated successfully, id:", updatedRideId);

  // Notify the passenger using the internal ride notification system
  await ctx.runMutation(internal.functions.notifications.rideNotifications.sendRideNotification, {
    rideId: args.rideId,
    type: "ride_accepted",
    driverId: args.driverId,
  });

  return {
    _id: updatedRideId,
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