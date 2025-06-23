import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getUserNotifications = query({
  args: {
    userId: v.id("taxiTap_users"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.unreadOnly) {
      q = q.filter((q) => q.eq(q.field("isRead"), false));
    }

    if (args.limit) {
      return await q.take(args.limit);
    }

    return await q.collect();
  }
});

export const getUnreadCount = query({
  args: {
    userId: v.id("taxiTap_users")
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  }
});
