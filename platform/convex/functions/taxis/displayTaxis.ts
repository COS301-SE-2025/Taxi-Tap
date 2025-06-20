import { query } from "../../_generated/server";

// Define the actual query directly
export const getAvailableTaxis = query({
  args: {},
  handler: async (ctx) => {
    const availableTaxis = await ctx.db
      .query("taxis")
      .withIndex("by_is_available", (q) => q.eq("isAvailable", true))
      .collect();

    return availableTaxis.map((taxi) => ({
      licensePlate: taxi.licensePlate,
      image: taxi.image ?? null,
    }));
  },
});