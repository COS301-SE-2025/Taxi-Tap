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
  // 1️⃣ Check if phone number already exists
  const existingByPhone = await ctx.db
    .query("taxiTap_users")
    .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
    .first();
  if (existingByPhone) {
    throw new Error("Phone number already exists");
  }

  const now = Date.now();
  // Determine the “active” role for location purposes
  const effectiveRole: "passenger" | "driver" =
    args.accountType === "both" ? "passenger" : args.accountType;

  try {
    // 2️⃣ Insert new user
    const userId = await ctx.db.insert("taxiTap_users", {
      phoneNumber: args.phoneNumber,
      name: args.name,
      password: args.password,
      email: args.email || "",
      age: args.age ?? 18,
      accountType: args.accountType,
      currentActiveRole: effectiveRole,
      isVerified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 3️⃣ Insert default location with role
    await ctx.db.insert("locations", {
      userId,
      latitude: 0,
      longitude: 0,
      updatedAt: new Date().toISOString(),
      role: effectiveRole,
    });

    // 4️⃣ Insert passenger/driver metadata
    if (args.accountType === "passenger" || args.accountType === "both") {
      await ctx.db.insert("passengers", {
        userId,
        numberOfRidesTaken: 0,
        totalDistance: 0,
        totalFare: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (args.accountType === "driver" || args.accountType === "both") {
      await ctx.db.insert("drivers", {
        userId,
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

    return { success: true, userId };
  } catch (e) {
    // Handle potential race condition
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

// Expose the mutation to your frontend
export const signUpSMS = mutation({
  args: {
    phoneNumber: v.string(),
    name: v.string(),
    password: v.string(),
    accountType: v.union(
      v.literal("passenger"),
      v.literal("driver"),
      v.literal("both")
    ),
    email: v.optional(v.string()),
    age: v.optional(v.number()),
  },
  handler: signUpSMSHandler,
});
