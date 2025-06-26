//this os the funtionc for a user to cancel a ride
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { cancelRideHandler } from "./cancelRideHandler";
// import { Doc } from './_generated/dataModel';

export const cancelRide = mutation({
    args: {
        rideId: v.string(),
        userId: v.string(),
    },
    handler: cancelRideHandler,
});
