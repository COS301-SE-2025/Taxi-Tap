import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../../../_generated/server";

export const switchBothToDriverHandler = async (
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
  
  // Check if user has any active rides as a passenger
  const activePassengerRides = await ctx.db
    .query("rides")
    .withIndex("by_passenger", (q) => q.eq("passengerId", args.userId))
    .filter((q) => 
      q.or(
        q.eq(q.field("status"), "requested"),
        q.eq(q.field("status"), "accepted"),
        q.eq(q.field("status"), "in_progress")
      )
    )
    .first();
  
  if (activePassengerRides) {
    throw new Error("Cannot switch to driver-only while you have active rides as a passenger");
  }
  
  // Update user account type to driver only
  await ctx.db.patch(args.userId, {
    accountType: "driver",
    currentActiveRole: undefined, // Clear active role since they're now single-role
    lastRoleSwitchAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  return { success: true, message: "Account switched to driver only" };
};

export const switchBothToDriver = mutation({
  args: {
    userId: v.id("taxiTap_users"),
  },
  handler: switchBothToDriverHandler,
});