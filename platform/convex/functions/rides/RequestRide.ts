// import { mutation } from "../../_generated/server";
// import { v } from "convex/values";

// export const requestRide = mutation({
//   args: {
//     passengerId: v.id("users"),
//     startLocation: v.object({
//       coordinates: v.object({
//         latitude: v.number(),
//         longitude: v.number(),
//       }),
//       address: v.string(),
//     }),
//     endLocation: v.object({
//       coordinates: v.object({
//         latitude: v.number(),
//         longitude: v.number(),
//       }),
//       address: v.string(),
//     }),
//     estimatedFare: v.optional(v.number()),
//     estimatedDistance: v.optional(v.number()),
//     estimatedDuration: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     const rideId = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     const ride = await ctx.db.insert("rides", {
//       rideId,
//       passengerId: args.passengerId,
//       startLocation: args.startLocation,
//       endLocation: args.endLocation,
//       status: "requested",
//       requestedAt: Date.now(),
//       estimatedFare: args.estimatedFare,
//       estimatedDistance: args.estimatedDistance,
//      // estimatedDuration: args.estimatedDuration,
//     });
    
//     return {
//       _id: ride,
//       rideId,
//       message: `Ride requested successfully from ${args.startLocation.address} to ${args.endLocation.address}`,
//     };
//   },
// });