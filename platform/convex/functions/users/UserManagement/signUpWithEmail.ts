import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import * as utils from "@noble/hashes/utils";


export const signUp = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      throw new Error("Email already exists");
    }

    //const passwordHash = utils.hexEncode(sha256(new TextEncoder().encode(args.password)));

    await ctx.db.insert("taxiTap_users", {
        email: args.email,
        name: args.name,
        password: args.password,
        age: 0
    });
  },
});

