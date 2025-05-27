import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    age: v.number(),
  }),
  messages: defineTable({
    body: v.string(),
    sender: v.id("users"),
  }),
  messages_ati: defineTable({
    body: v.string(),
    sender: v.id("users"),
  }),
  messages_ati23: defineTable({
    body: v.string(),
    sender: v.id("users"),
  }),
  taxiTap_users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    age: v.number(),
  }),
  rides: defineTable({
    rideId: v.string(),
    passengerId: v.id("users"),
    
    startLocation: v.object({
      coordinates: v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
      address: v.string(), // Human-readable address from frontend
    }),
  
    endLocation: v.object({
      coordinates: v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
      address: v.string(), // Human-readable address from frontend
    }),
    
    status: v.union(
      v.literal("requested"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    
    driverId: v.optional(v.id("users")), // Optional, can be null if no driver is assigned yet
    
    requestedAt: v.number(),
    acceptedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    
    estimatedFare: v.optional(v.number()),
    finalFare: v.optional(v.number()),
    
    estimatedDistance: v.optional(v.number()), // in kilometers
  //  estimatedDuration: v.optional(v.number()), // in minutes
    actualDistance: v.optional(v.number()),
  //  actualDuration: v.optional(v.number()),
  })
    .index("by_ride_id", ["rideId"]) // Index for quick lookup by rideId
    .index("by_passenger", ["passengerId"]) // Index for passenger's ride history
    .index("by_driver", ["driverId"]) // Index for driver's rides
    .index("by_status", ["status"]) // Index for finding rides by status
    .index("by_requested_at", ["requestedAt"]), // Index for chronological ordering
});