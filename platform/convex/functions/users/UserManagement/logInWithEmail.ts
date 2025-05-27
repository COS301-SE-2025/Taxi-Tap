import { query } from "../../../_generated/server";
import { v } from "convex/values";

export const login = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("taxiTap_users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.password !== args.password) {
      throw new Error("Invalid password");
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  },
});
