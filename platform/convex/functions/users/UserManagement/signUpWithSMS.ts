// import { mutation } from "../../../_generated/server";
// import { v } from "convex/values";
// import { MutationCtx } from "../../../_generated/server";

// export const signUpSMSHandler = async (
//   ctx: MutationCtx,
//   args: { number: string; name: string; password: string; role: string }
// ) => {
//   const existing = await ctx.db
//     .query("taxiTapUsers")
//     .withIndex("by_number", (q) => q.eq("number", args.number))
//     .first();

//   if (existing) {
//     throw new Error("Number already exists");
//   }

//   //const passwordHash = utils.hexEncode(sha256(new TextEncoder().encode(args.password)));

//   try {
//     await ctx.db.insert("taxiTapUsers", {
//       number: args.number,
//       name: args.name,
//       password: args.password,
//       role: args.role,
//     });
//   } catch (e) {
//     // Optional: Check again if the failure was due to race condition
//     const exists = await ctx.db
//       .query("taxiTapUsers")
//       .withIndex("by_number", (q) => q.eq("number", args.number))
//       .first();

//     if (exists) {
//       throw new Error("Number already exists (raced)");
//     }
//     throw e;
//   }
// };

// // Use the handler in your Convex mutation
// export const signUpSMS = mutation({
//   args: {
//     number: v.string(),
//     name: v.string(),
//     password: v.string(),
//     role: v.string(),
//   },
//   handler: signUpSMSHandler,
// });