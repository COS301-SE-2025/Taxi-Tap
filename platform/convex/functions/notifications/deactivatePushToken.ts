import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const deactivatePushToken = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (tokenDoc) {
      return await ctx.db.patch(tokenDoc._id, {
        isActive: false,
        updatedAt: Date.now()
      });
    }

    return null;
  }
});
