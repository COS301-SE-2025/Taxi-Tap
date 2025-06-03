import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../../../_generated/server";

export const switchBothToPassengerHandler = async (
  ctx: MutationCtx,
  args: { userId: v.Id<"taxiTap_users"> }
) => {
  const user = await ctx.db.get(args.userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (user.accountType !== "both") {
    throw new Error("User does not currently have both account types");
  }
  
  // Check if user has any active rides as a driver
  const activeDriverRides = await ctx.db
    .query("rides")
    .withIndex("by_driver", (q) => q.eq("driverId", args.userId))
    .filter((q) => 
      q.or(
        q.eq(q.field("status"), "accepted"),
        q.eq(q.field("status"), "in_progress")
      )
    )
    .first();
  
  if (activeDriverRides) {
    throw new Error("Cannot switch to passenger-only while you have active rides as a driver");
  }
  
  // Update user account type to passenger only
  await ctx.db.patch(args.userId, {
    accountType: "passenger",
    currentActiveRole: undefined, // Clear active role since they're now single-role
    lastRoleSwitchAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  return { success: true, message: "Account switched to passenger only" };
};

export const switchBothToPassenger = mutation({
  args: {
    userId: v.id("taxiTap_users"),
  },
  handler: switchBothToPassengerHandler,
});