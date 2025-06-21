import { query } from "../../_generated/server";

export const getAvailableTaxis = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all available taxis
    const availableTaxis = await ctx.db
      .query("taxis")
      .withIndex("by_is_available", (q) => q.eq("isAvailable", true))
      .collect();

    // For each taxi, fetch driver and user info
    const results = [];

    for (const taxi of availableTaxis) {
      // Get the driver document (driverId is an Id<"drivers">)
      const driver = await ctx.db.get(taxi.driverId);
      if (!driver) {
        continue; // skip taxis without drivers or handle accordingly
      }

      // Get the user linked to this driver
      const user = await ctx.db.get(driver.userId);
      if (!user) {
        continue; // skip if no user found
      }

      results.push({
        licensePlate: taxi.licensePlate,
        image: taxi.image ?? null,
        seats: taxi.capacity,
        model: taxi.model,
        driverName: user.name,
        userId: user._id,
      });
    }

    return results;
  },
});