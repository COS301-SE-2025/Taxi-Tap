import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../../../_generated/server";

export const signUpHandler = async (
  ctx: MutationCtx,
  args: { 
    email: string; 
    name: string; 
    password: string;
    accountType: "passenger" | "driver" | "both";
    phoneNumber: string;
    age: number;
  }
) => {
  const existing = await ctx.db
    .query("taxiTap_users")
    .withIndex("by_email", (q) => q.eq("email", args.email))
    .first();

  if (existing) {
    throw new Error("Email already exists");
  }

  // Check if phone number already exists
  const existingPhone = await ctx.db
    .query("taxiTap_users")
    .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
    .first();

  if (existingPhone) {
    throw new Error("Phone number already exists");
  }

  //const passwordHash = utils.hexEncode(sha256(new TextEncoder().encode(args.password)));

  let userId: any;

  try {
    userId = await ctx.db.insert("taxiTap_users", {
      email: args.email,
      name: args.name,
      password: args.password,
      age: args.age,
      phoneNumber: args.phoneNumber,
      accountType: args.accountType,
      isVerified: false,
      isActive: true,
      currentActiveRole: args.accountType === "both" ? "passenger" : args.accountType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (e) {
    // Optional: Check again if the failure was due to race condition
    const exists = await ctx.db
      .query("taxiTap_users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (exists) {
      throw new Error("Email already exists (raced)");
    }
    throw e;
  }

  // Create appropriate profiles based on account type
  try {
    if (args.accountType === "passenger" || args.accountType === "both") {
      await ctx.db.insert("passengers", {
        userId: userId,
        numberOfRidesTaken: 0,
        totalDistance: 0,
        totalFare: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (args.accountType === "driver" || args.accountType === "both") {
      await ctx.db.insert("drivers", {
        userId: userId,
        numberOfRidesCompleted: 0,
        totalDistance: 0,
        totalFare: 0,
      });
    }
  } catch (e) {
    // If profile creation fails, we should clean up the user record
    await ctx.db.delete(userId);
    throw new Error("Failed to create user profile. Please try again.");
  }

  return {
    success: true,
    userId: userId,
    message: `Account created successfully as ${args.accountType}`,
  };
};

// Use the handler in your Convex mutation
export const signUp = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    accountType: v.union(
      v.literal("passenger"),
      v.literal("driver"),
      v.literal("both")
    ),
    phoneNumber: v.string(),
    age: v.number(),
  },
  handler: signUpHandler,
});