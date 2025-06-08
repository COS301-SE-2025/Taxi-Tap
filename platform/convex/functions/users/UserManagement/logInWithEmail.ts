import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "../../../_generated/server";

export const loginHandler = async (
  ctx: QueryCtx, 
  args: { 
    email: string; 
    password: string; 
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

  // Check if account is active
  if (!user.isActive) {
    throw new Error("Account is deactivated. Please contact support.");
  }

  // Use the user's current active role for login
  const activeRole = user.currentActiveRole;
  
  if (!activeRole) {
    throw new Error("No active role set. Please contact support.");
  }

  // Verify user has permission for their current active role
  const hasPermission = 
    user.accountType === activeRole || 
    user.accountType === "both";

  if (!hasPermission) {
    throw new Error(
      `Role mismatch: Current active role (${activeRole}) doesn't match your account permissions (${user.accountType})`
    );
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    accountType: user.accountType,
    currentActiveRole: user.currentActiveRole,
    isVerified: user.isVerified,
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