//this os the funtionc for a user to cancel a ride
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
// import { Doc } from './_generated/dataModel';

export const cancelRideHandler = async (ctx: any, args: { rideId: string; userId: string }) => {
    // Find the ride
    const ride = await ctx.db
        .query("rides")
        .withIndex("by_ride_id", (q: { eq: (field: string, value: string) => any }) => q.eq("rideId", args.rideId))
        .first();

    if (!ride) {
        throw new Error("Ride not found");
    }

    // Check if the user is authorized to cancel the ride
    if (ride.passengerId !== args.userId && ride.driverId !== args.userId) {
        throw new Error("User is not authorized to cancel this ride");
    }
    
    // Update the ride status to cancelled
    const updatedRide = await ctx.db.patch(ride._id, {
        status: "cancelled",
        cancelledAt: Date.now(),
        cancelledBy: args.userId,
    });

    return {
        _id: updatedRide._id,
        message: "Ride cancelled successfully",
    };
};

export const cancelRide = mutation({
    args: {
        rideId: v.string(),
        userId: v.string(),
    },
    handler: cancelRideHandler,
});
