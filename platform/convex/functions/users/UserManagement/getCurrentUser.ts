import { query } from "../../../_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await ctx.db
      .query("taxiTap_users")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .first();

    return user ?? null;
  },
});
