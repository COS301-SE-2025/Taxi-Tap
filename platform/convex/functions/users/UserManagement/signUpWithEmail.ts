import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../../../_generated/server";
import * as utils from "@noble/hashes/utils";

export const signUpHandler = async (
  ctx: MutationCtx,
  args: { email: string; name: string; password: string }
) => {
  const existing = await ctx.db
    .query("taxiTap_users")
    .withIndex("by_email", (q) => q.eq("email", args.email))
    .first();

  if (existing) {
    throw new Error("Email already exists");
  }

  //const passwordHash = utils.hexEncode(sha256(new TextEncoder().encode(args.password)));

  try {
    await ctx.db.insert("taxiTap_users", {
      email: args.email,
      name: args.name,
      password: args.password,
      age: 0,
    });
  } catch (e) {
    // Optional: Check again if the failure was due to race condition
    const exists = await ctx.db
      .query("taxiTap_users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (exists) {
      throw new Error("Email already exists (raced)");
    }
    throw e;
  }
};

// Use the handler in your Convex mutation
export const signUp = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: signUpHandler,
});