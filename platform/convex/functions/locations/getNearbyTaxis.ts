import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getNearbyTaxis = query({
  args: {
    passengerLat: v.number(),
    passengerLng: v.number(),
  },
  handler: async (ctx, { passengerLat, passengerLng }) => {
    const allLocations = await ctx.db.query("locations").collect();

    const EARTH_RADIUS = 6371; // km

    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      return EARTH_RADIUS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    return allLocations.filter(loc => {
      const distance = getDistance(passengerLat, passengerLng, loc.latitude, loc.longitude);
      return distance < 5; // only include users within 5km
    });
  },
});
