import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { sendNotification } from "../notifications/sendNotifications";

export const requestRideHandler = async (ctx: any, args: {
  passengerId: string;
  driverId: string;
  startLocation: { coordinates: { latitude: number; longitude: number }; address: string };
  endLocation: { coordinates: { latitude: number; longitude: number }; address: string };
  estimatedFare?: number;
  estimatedDistance?: number;
}) => {
  const rideId = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const ride = await ctx.db.insert("rides", {
    rideId,
    passengerId: args.passengerId,
    driverId: args.driverId,
    startLocation: args.startLocation,
    endLocation: args.endLocation,
    status: "requested",
    requestedAt: Date.now(),
    estimatedFare: args.estimatedFare,
    estimatedDistance: args.estimatedDistance,
  });

  // Notify the driver
  await ctx.runMutation(sendNotification, {
    userId: args.driverId,
    type: "ride_request",
    title: "New Ride Request",
    message: `You have a new ride request from a passenger.`,
    priority: "high",
    metadata: { rideId, passengerId: args.passengerId },
  });

  return {
    _id: ride,
    rideId,
    message: `Ride requested successfully from ${args.startLocation.address} to ${args.endLocation.address}`,
  };
};

export const requestRide = mutation({
  args: {
    passengerId: v.id("taxiTap_users"),
    driverId: v.id("taxiTap_users"),
    startLocation: v.object({
      coordinates: v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
      address: v.string(),
    }),
    endLocation: v.object({
      coordinates: v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
      address: v.string(),
    }),
    estimatedFare: v.optional(v.number()),
    estimatedDistance: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
  },
  handler: requestRideHandler,
});