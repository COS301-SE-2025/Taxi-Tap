import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "../../../_generated/server";


export const loginHandler = async (
  ctx: QueryCtx, 
  args: { email: string; password: string }
) => {
  const user = await ctx.db
    .query("taxiTap_users")
    .withIndex("by_email", (q) => q.eq("email", args.email))
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
};

// Use the handler in your Convex query
export const login = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: loginHandler,
});