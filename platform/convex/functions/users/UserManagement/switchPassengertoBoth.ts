import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../../../_generated/server";

export const switchPassengerToBothHandler = async (
  ctx: MutationCtx,
  args: { userId: v.Id<"taxiTap_users"> }
) => {
  const user = await ctx.db.get(args.userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (user.accountType !== "passenger") {
    throw new Error("User is not currently a passenger");
  }
  
  // Update user account type to both and set current active role to passenger
  await ctx.db.patch(args.userId, {
    accountType: "both",
    currentActiveRole: "passenger",
    lastRoleSwitchAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  // Create driver profile if it doesn't exist
  const existingDriverProfile = await ctx.db
    .query("drivers")
    .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
    .first();
  
  if (!existingDriverProfile) {
    await ctx.db.insert("drivers", {
      userId: args.userId,
      numberOfRidesCompleted: 0,
      totalDistance: 0,
      totalFare: 0,
      averageRating: undefined,
    });
  }
  
  return { success: true, message: "Account upgraded to both passenger and driver" };
};

export const switchPassengerToBoth = mutation({
  args: {
    userId: v.id("taxiTap_users"),
  },
  handler: switchPassengerToBothHandler,
});