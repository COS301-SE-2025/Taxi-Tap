import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "../../../_generated/server";

export const loginHandler = async (
  ctx: QueryCtx, 
  args: { 
    email: string; 
    password: string; 
    requestedAccountType: "passenger" | "driver" 
  }
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

  // Check if user has permission for the requested account type
  const hasPermission = 
    user.accountType === args.requestedAccountType || 
    user.accountType === "both";

  if (!hasPermission) {
    throw new Error(
      `Access denied: You don't have ${args.requestedAccountType} privileges. ` +
      `Your account type is: ${user.accountType}`
    );
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error("Account is deactivated. Please contact support.");
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    accountType: user.accountType,
    requestedRole: args.requestedAccountType,
    currentActiveRole: user.currentActiveRole,
    isVerified: user.isVerified,
  };
};

// Use the handler in your Convex query
export const login = query({
  args: {
    email: v.string(),
    password: v.string(),
    requestedAccountType: v.union(v.literal("passenger"), v.literal("driver")),
  },
  handler: loginHandler,
});