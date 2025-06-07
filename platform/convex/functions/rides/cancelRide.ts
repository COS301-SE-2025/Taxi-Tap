//this os the funtionc for a user to cancel a ride
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
export const cancelRide = mutation({
    args: {
        rideId: v.string(),
        userId: v.id("taxiTap_users"),
    },
    handler: async (ctx, args) => {
        // Find the ride
        const ride = await ctx.db
            .query("rides")
            .withIndex("by_ride_id", (q) => q.eq("rideId", args.rideId))
            .unique();

        if (!ride) {
            throw new Error("Ride not found");
        }

        // Check if the user is authorized to cancel the ride
        if (ride.passengerId !== args.userId) {
            throw new Error("You are not authorized to cancel this ride");
        }
        
        // Update the ride status to cancelled
        await ctx.db.patch(ride._id, {
            status: "cancelled",
        });

        return { success: true, message: "Ride cancelled successfully" };
        }
    });
