// convex/addUser.ts
import { mutation } from "../../_generated/server";

import { v } from "convex/values";

export const addUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    age: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      age: args.age,
    });
    return id;
  },
});
