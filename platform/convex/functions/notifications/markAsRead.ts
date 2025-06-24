import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications")
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now()
    });
  }
});
