import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  taxiTap_users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    age: v.number(),
    phoneNumber: v.string(),
    
    isVerified: v.boolean(),
    isActive: v.boolean(),
    accountType: v.union(
      v.literal("passenger"),
      v.literal("driver"),
      v.literal("both")
    ),
    
    currentActiveRole: v.optional(v.union(
      v.literal("passenger"),
      v.literal("driver")
    )),
    lastRoleSwitchAt: v.optional(v.number()),
    
    profilePicture: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("other"),
      v.literal("prefer_not_to_say")
    )),
        
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phoneNumber: v.string(),
      relationship: v.string(),
    })),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phoneNumber"])
    .index("by_account_type", ["accountType"])
    .index("by_current_role", ["currentActiveRole"])
    .index("by_is_active", ["isActive"])
    .index("by_created_at", ["createdAt"]),

  rides: defineTable({
    rideId: v.string(),
    passengerId: v.id("taxiTap_users"),
    
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
    
    status: v.union(
      v.literal("requested"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    
    driverId: v.optional(v.id("taxiTap_users")),
    
    requestedAt: v.number(),
    acceptedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    
    estimatedFare: v.optional(v.number()),
    finalFare: v.optional(v.number()),
    
    estimatedDistance: v.optional(v.number()),
    actualDistance: v.optional(v.number()),
  })
    .index("by_ride_id", ["rideId"])
    .index("by_passenger", ["passengerId"])
    .index("by_driver", ["driverId"])
    .index("by_status", ["status"])
    .index("by_requested_at", ["requestedAt"]),

  //passenger table
  passengers: defineTable({
    userId: v.id("taxiTap_users"),
    //passengerID: v.string(),
    numberOfRidesTaken: v.number(),
    totalDistance: v.number(),
    totalFare: v.number(),
    averageRating: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    //.index("by_passenger_id", ["passengerID"])
    .index("by_created_at", ["createdAt"]),
  
    drivers: defineTable({
      userId: v.id("taxiTap_users"),
      numberOfRidesCompleted: v.number(),
      totalDistance: v.number(),
      totalFare: v.number(),
      averageRating: v.optional(v.number()),
      activeRoute: v.optional(v.id("routes")),
      assignedRoute: v.optional(v.id("routes")),
      taxiAssociation: v.optional(v.string()),
      routeAssignedAt: v.optional(v.number()), 
    })
    .index("by_user_id", ["userId"])
    .index("by_taxi_association", ["taxiAssociation"])
    .index("by_assigned_route", ["assignedRoute"])
    .index("by_average_rating", ["averageRating"]),
    
routes: defineTable({
    routeId: v.string(),
    name: v.string(),
    geometry: v.any(),
    stops: v.array(v.object({
      id: v.string(),
      name: v.string(),
      coordinates: v.array(v.number()),
      order: v.number()
    })),
    fare: v.number(),
    estimatedDuration: v.number(),
    isActive: v.boolean(),
    taxiAssociation: v.string(),
    taxiAssociationRegistrationNumber: v.string()
  }).index("by_route_id", ["routeId"]),

  routeStops: defineTable({
    routeId: v.string(), 
    stopId: v.string(), 
    name: v.string(), 
    coordinates: v.array(v.number()), 
    order: v.number(), 
    isStartPoint: v.boolean(), 
    isEndPoint: v.boolean(),
    estimatedTime: v.optional(v.number()), 
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_route_id", ["routeId"])
  .index("by_stop_name", ["name"])
  .index("by_coordinates", ["coordinates"]),

  enrichedRouteStops: defineTable({
    routeId: v.string(),
    stops: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        coordinates: v.array(v.number()),
        order: v.number(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_route_id", ["routeId"]),

  reverseGeocodedStops: defineTable({
    id: v.string(),
    name: v.string(),
    lastUsed: v.number(),
  }).index("by_stop_id", ["id"]),

  //Taxis Table - stores information about taxis
  taxis: defineTable({
    driverId: v.id("drivers"),
    taxiId: v.optional(v.string()),
    licensePlate: v.string(),
    model: v.string(),
    color: v.string(),
    year: v.number(),
    image: v.optional(v.string()),
    capacity: v.number(),
    isAvailable: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_driver_id", ["driverId"])
    .index("by_taxi_id", ["taxiId"])
    .index("by_is_available", ["isAvailable"])
    .index("by_created_at", ["createdAt"]),
});

