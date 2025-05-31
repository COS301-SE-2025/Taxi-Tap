import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "../../../_generated/server";


export const loginSMSHandler = async (
  ctx: QueryCtx, 
  args: { number: string; password: string }
) => {
  const user = await ctx.db
    .query("taxiTapUsers")
    .withIndex("by_number", (q) => q.eq("number", args.number))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.password !== args.password) {
    throw new Error("Invalid password");
  }

  return {
    id: user._id,
    number: user.number,
    name: user.name,
  };
};

// Use the handler in your Convex query
export const loginSMS = query({
  args: {
    number: v.string(),
    password: v.string(),
  },
  handler: loginSMSHandler,
});