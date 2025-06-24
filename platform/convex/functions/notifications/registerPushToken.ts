import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const registerPushToken = mutation({
  args: {
    userId: v.id("taxiTap_users"),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"))
  },
  handler: async (ctx, args) => {
    // Check if token already exists
    const existingToken = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existingToken) {
      // Update existing token
      return await ctx.db.patch(existingToken._id, {
        userId: args.userId,
        isActive: true,
        updatedAt: Date.now(),
        lastUsedAt: Date.now()
      });
    }

    // Create new token
    return await ctx.db.insert("pushTokens", {
      userId: args.userId,
      token: args.token,
      platform: args.platform,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now()
    });
  }
});
