// convex/functions/routes/enrichRoutes.ts
import { action, internalMutation, internalQuery } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";

const isBadStopName = (name: string) => {
  if (!name) return true;
  const upper = name.trim().toUpperCase();
  return (
    upper === "" || 
    upper.includes("DROP OFF") || 
    upper === "N/A" ||
    upper === "UNNAMED" ||
    upper.length < 2
  );
};

export const _getRoutes = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("routes").collect();
  },
});

export const _getRoute = internalQuery({
  args: { routeId: v.string() },
  handler: async (ctx, { routeId }) => {
    return await ctx.db
      .query("routes")
      .withIndex("by_route_id", (q) => q.eq("routeId", routeId))
      .unique();
  },
});

export const _getEnrichedRoute = internalQuery({
  args: { routeId: v.string() },
  handler: async (ctx, { routeId }) => {
    return await ctx.db
      .query("enrichedRouteStops")
      .withIndex("by_route_id", (q) => q.eq("routeId", routeId))
      .unique();
  },
});

export const _updateEnrichedRoute = internalMutation({
  args: {
    id: v.id("enrichedRouteStops"),
    stops: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        coordinates: v.array(v.number()),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, { id, stops }) => {
    await ctx.db.patch(id, {
      stops,
      updatedAt: Date.now(),
    });
  },
});

export const _createEnrichedRoute = internalMutation({
  args: {
    routeId: v.string(),
    stops: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        coordinates: v.array(v.number()),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, { routeId, stops }) => {
    await ctx.db.insert("enrichedRouteStops", {
      routeId,
      stops,
      updatedAt: Date.now(),
    });
  },
});

// Test individual route enrichment
export const enrichSingleRoute = action({
  args: { routeId: v.string() },
  handler: async (ctx, { routeId }): Promise<{
    success: boolean;
    message: string;
    enrichedCount: number;
    totalStops: number;
    details?: Array<{ id: string; name: string }>;
  }> => {
    console.log(`Starting enrichment for route: ${routeId}`);
    
    const route = await ctx.runQuery(internal.functions.routes.enrichRoutes._getRoute, { routeId });
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    console.log(`Found route with ${route.stops.length} stops`);
    
    let enrichedCount = 0;
    const enrichedStops = [];

    for (const stop of route.stops) {
      console.log(`Processing stop ${stop.id}: "${stop.name}"`);
      
      if (isBadStopName(stop.name)) {
        console.log(`Stop ${stop.id} needs enrichment`);
        const [lat, lon] = stop.coordinates;
        
        try {
          // Use type assertion to access the function
          const reverseGeocodeModule = internal.functions.routes.reverseGeocode as any;
          const name: string = await ctx.runAction(
            reverseGeocodeModule.getReadableStopName,
            { lat, lon }
          );
          enrichedStops.push({ ...stop, name });
          enrichedCount++;
          console.log(`Enriched stop ${stop.id}: "${stop.name}" -> "${name}"`);
        } catch (error) {
          console.error(`Failed to enrich stop ${stop.id}:`, error);
          enrichedStops.push(stop);
        }
      } else {
        enrichedStops.push(stop);
        console.log(`Stop ${stop.id} already has good name: "${stop.name}"`);
      }
    }

    if (enrichedCount > 0) {
      const existing = await ctx.runQuery(internal.functions.routes.enrichRoutes._getEnrichedRoute, { routeId });

      if (existing) {
        await ctx.runMutation(internal.functions.routes.enrichRoutes._updateEnrichedRoute, {
          id: existing._id,
          stops: enrichedStops,
        });
        console.log(`Updated existing enriched route record`);
      } else {
        await ctx.runMutation(internal.functions.routes.enrichRoutes._createEnrichedRoute, {
          routeId,
          stops: enrichedStops,
        });
        console.log(`Created new enriched route record`);
      }

      return {
        success: true,
        message: `Route ${routeId} enriched successfully`,
        enrichedCount,
        totalStops: route.stops.length,
        details: enrichedStops.map(s => ({ id: s.id, name: s.name }))
      };
    }

    return {
      success: false,
      message: `Route ${routeId} doesn't need enrichment`,
      enrichedCount: 0,
      totalStops: route.stops.length
    };
  },
});

// Test all routes enrichment - simplified to avoid circular references
export const enrichAllRoutes = action({
  args: {},
  handler: async (ctx): Promise<{
    message: string;
    totalRoutes: number;
    updatedCount: number;
    errorCount: number;
    errors: string[];
  }> => {
    console.log("Starting bulk route enrichment...");
    
    const routes = await ctx.runQuery(internal.functions.routes.enrichRoutes._getRoutes);
    console.log(`Found ${routes.length} routes to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const route of routes) {
      try {
        console.log(`Processing route: ${route.routeId}`);
        
        // Process each route directly here instead of calling enrichSingleRoute
        let enrichedCount = 0;
        const enrichedStops = [];

        for (const stop of route.stops) {
          if (isBadStopName(stop.name)) {
            const [lat, lon] = stop.coordinates;
            
            try {
              // Use type assertion to access the function
              const reverseGeocodeModule = internal.functions.routes.reverseGeocode as any;
              const name: string = await ctx.runAction(
                reverseGeocodeModule.getReadableStopName,
                { lat, lon }
              );
              enrichedStops.push({ ...stop, name });
              enrichedCount++;
            } catch (error) {
              console.error(`Failed to enrich stop ${stop.id}:`, error);
              enrichedStops.push(stop);
            }
          } else {
            enrichedStops.push(stop);
          }
        }

        if (enrichedCount > 0) {
          const existing = await ctx.runQuery(internal.functions.routes.enrichRoutes._getEnrichedRoute, { routeId: route.routeId });

          if (existing) {
            await ctx.runMutation(internal.functions.routes.enrichRoutes._updateEnrichedRoute, {
              id: existing._id,
              stops: enrichedStops,
            });
          } else {
            await ctx.runMutation(internal.functions.routes.enrichRoutes._createEnrichedRoute, {
              routeId: route.routeId,
              stops: enrichedStops,
            });
          }
          updatedCount++;
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Route ${route.routeId}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return {
      message: `Processed ${routes.length} routes, enriched ${updatedCount}`,
      totalRoutes: routes.length,
      updatedCount,
      errorCount,
      errors: errors.slice(0, 10), // Limit errors in response
    };
  },
});
