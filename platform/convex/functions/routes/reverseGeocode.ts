// convex/functions/routes/reverseGeocode.ts
import { action, internalMutation, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

export const getCachedStop = internalQuery({
  args: { key: v.string() },
  async handler(ctx, { key }) {
    return await ctx.db
      .query("reverseGeocodedStops")
      .withIndex("by_stop_id", (q) => q.eq("id", key))
      .unique();
  },
});

export const cacheStop = internalMutation({
  args: { key: v.string(), name: v.string() },
  async handler(ctx, { key, name }) {
    await ctx.db.insert("reverseGeocodedStops", {
      id: key,
      name,
      lastUsed: Date.now(),
    });
  },
});

export const getReadableStopName = action({
  args: {
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, { lat, lon }: { lat: number; lon: number }): Promise<string> => {
    const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;

    const cached = await ctx.runQuery(internal.functions.routes.reverseGeocode.getCachedStop, { key });
    if (cached) {
      console.log(`Cache hit for ${key}: ${cached.name}`);
      return cached.name;
    }

    console.log(`Cache miss for ${key}, fetching from Nominatim...`);
    
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const response = await fetch(url, {
        headers: { "User-Agent": "TaxiTap/1.0 (habohamese@gmail.com)" },
      });

      if (!response.ok) {
        console.error(`Nominatim API error: ${response.status}`);
        return "Unnamed Stop";
      }

      const data = await response.json();
      console.log(`Nominatim response for ${key}:`, JSON.stringify(data, null, 2));
      
      const address = data.address || {};
      const name = 
        address.mall ||
        address.shop ||
        address.amenity ||
        address.building ||
        address.road ||
        address.neighbourhood ||
        address.suburb ||
        address.city_district ||
        address.town ||
        address.city ||
        data.display_name?.split(',')[0] ||
        "Unnamed Stop";

      await ctx.runMutation(internal.functions.routes.reverseGeocode.cacheStop, { key, name });
      console.log(`Cached result for ${key}: ${name}`);
      
      return name;
    } catch (error) {
      console.error(`Error fetching location name for ${key}:`, error);
      return "Unnamed Stop";
    }
  },
});
