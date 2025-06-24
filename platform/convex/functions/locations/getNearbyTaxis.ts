import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getNearbyTaxis = query({
  args: {
    passengerLat: v.number(),
    passengerLng: v.number(),
  },
  handler: async (ctx, { passengerLat, passengerLng }) => {
    // 1️⃣  Grab every location doc (or use an index if you have one)
    const allLocations = await ctx.db.query("locations").collect();

    const EARTH_RADIUS = 6371; // km

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const getDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      return EARTH_RADIUS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    // 2️⃣  Keep only drivers within 5 km
    return allLocations
      .filter((loc) => loc.role === "driver")
      .filter(
        (loc) =>
          getDistance(
            passengerLat,
            passengerLng,
            loc.latitude,
            loc.longitude
          ) < 5
      );
  },
});
