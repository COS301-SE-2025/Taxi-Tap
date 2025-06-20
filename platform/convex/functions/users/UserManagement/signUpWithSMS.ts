import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../../../_generated/server";

export const signUpSMSHandler = async (
  ctx: MutationCtx,
  args: { 
    phoneNumber: string; 
    name: string; 
    password: string; 
    accountType: "passenger" | "driver" | "both";
    email?: string;
    age?: number;
  }
) => {
  // Check if phone number already exists
  const existingByPhone = await ctx.db
    .query("taxiTap_users")
    .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
    .first();

  if (existingByPhone) {
    throw new Error("Phone number already exists");
  }


  const now = Date.now();

  try {
    const userId = await ctx.db.insert("taxiTap_users", {
      phoneNumber: args.phoneNumber,
      name: args.name,
      password: args.password,
      email: args.email || "", // Default empty string if not provided
      age: args.age || 18, // Default age if not provided
      accountType: args.accountType,
      currentActiveRole: args.accountType === "both" ? "passenger" : args.accountType, // Default to passenger for "both", otherwise use the account type
      isVerified: false, // New SMS users start unverified
      isActive: true, // New users are active by default
      createdAt: now,
      updatedAt: now,
    });

    // Create corresponding passenger/driver records based on account type
    if (args.accountType === "passenger" || args.accountType === "both") {
      await ctx.db.insert("passengers", {
        userId: userId,
        numberOfRidesTaken: 0,
        totalDistance: 0,
        totalFare: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (args.accountType === "driver" || args.accountType === "both") {
      await ctx.db.insert("drivers", {
        userId: userId,
        numberOfRidesCompleted: 0,
        totalDistance: 0,
        totalFare: 0,
        averageRating: undefined,
        activeRoute: undefined,
        assignedRoute: undefined,
        taxiAssociation: "",
        routeAssignedAt: undefined,
      });
    }

    return { success: true, userId: userId };

  } catch (e) {
    // Optional: Check again if the failure was due to race condition
    const exists = await ctx.db
      .query("taxiTap_users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (exists) {
      throw new Error("Phone number already exists (race condition)");
    }
    throw e;
  }
};

// Use the handler in your Convex mutation
export const signUpSMS = mutation({
  args: {
    phoneNumber: v.string(),
    name: v.string(),
    password: v.string(),
    accountType: v.union(v.literal("passenger"), v.literal("driver"), v.literal("both")),
    email: v.optional(v.string()),
    age: v.optional(v.number()),
  },
  handler: signUpSMSHandler,
});