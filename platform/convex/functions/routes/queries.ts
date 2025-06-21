import { query } from "../../_generated/server";
import { v } from "convex/values";

// Helper function to check if a location matches a route point
function locationMatches(routePoint: string, searchPoint: string): boolean {
  const routeLower = routePoint.toLowerCase();
  const searchLower = searchPoint.toLowerCase();
  
  return routeLower.includes(searchLower) || searchLower.includes(routeLower);
}

// Helper function to parse route names
function parseRouteName(routeName: string) {
  const parts = routeName.split(' to ');
  return {
    start: parts[0]?.trim() || '',
    destination: parts[1]?.trim() || ''
  };
}

// Get route stops with enrichment fallback
export const getRouteStopsWithEnrichment = query({
  args: { routeId: v.string() },
  handler: async (ctx, { routeId }) => {
    // First, try to get enriched stops
    const enrichedRoute = await ctx.db
      .query("enrichedRouteStops")
      .withIndex("by_route_id", (q) => q.eq("routeId", routeId))
      .unique();

    if (enrichedRoute) {
      console.log(`Found enriched stops for route ${routeId}`);
      return {
        stops: enrichedRoute.stops,
        isEnriched: true,
        updatedAt: enrichedRoute.updatedAt,
      };
    }

    // Fallback to original route stops
    const originalRoute = await ctx.db
      .query("routes")
      .withIndex("by_route_id", (q) => q.eq("routeId", routeId))
      .unique();

    if (!originalRoute) {
      throw new Error(`Route ${routeId} not found`);
    }

    console.log(`Using original stops for route ${routeId}`);
    return {
      stops: originalRoute.stops,
      isEnriched: false,
      updatedAt: null,
    };
  },
});

// Get all routes with enrichment status
export const getAllRoutesWithEnrichmentStatus = query({
  args: {},
  handler: async (ctx) => {
    const routes = await ctx.db.query("routes").collect();
    const enrichedRoutes = await ctx.db.query("enrichedRouteStops").collect();
    
    const enrichedRouteIds = new Set(enrichedRoutes.map(r => r.routeId));
    
    return routes.map(route => ({
      ...route,
      hasEnrichedStops: enrichedRouteIds.has(route.routeId),
    }));
  },
});

// Get all available routes for a passenger to browse
export const getAllAvailableRoutesForPassenger = query({
  handler: async (ctx) => {
    const routes = await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return routes.map(route => {
      const { start, destination } = parseRouteName(route.name);
      const sortedStops = route.stops.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
      
      return {
        routeId: route.routeId,
        routeName: route.name,
        start,
        destination,
        taxiAssociation: route.taxiAssociation,
        fare: route.fare,
        estimatedDuration: route.estimatedDuration,
        stops: sortedStops,
        totalStops: sortedStops.length
      };
    }).sort((a, b) => a.start.localeCompare(b.start));
  },
});

// Get routes by taxi association for passengers
export const getRoutesByTaxiAssociationForPassenger = query({
  args: { taxiAssociation: v.string() },
  handler: async (ctx, args) => {
    const routes = await ctx.db
      .query("routes")
      .filter((q) => 
        q.and(
          q.eq(q.field("taxiAssociation"), args.taxiAssociation),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
    
    return routes.map(route => {
      const { start, destination } = parseRouteName(route.name);
      const sortedStops = route.stops.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
      
      return {
        routeId: route.routeId,
        routeName: route.name,
        start,
        destination,
        taxiAssociation: route.taxiAssociation,
        fare: route.fare,
        estimatedDuration: route.estimatedDuration,
        stops: sortedStops,
        totalStops: sortedStops.length
      };
    });
  },
});

// Get detailed route information including active drivers
export const getRouteDetailsWithDrivers = query({
  args: { routeId: v.string() },
  handler: async (ctx, args) => {
    // Get the route
    const route = await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("routeId"), args.routeId))
      .first();
    
    if (!route) {
      return {
        success: false,
        message: "Route not found",
        route: null,
        activeDrivers: []
      };
    }
    
    // Get drivers assigned to this route
    const driversOnRoute = await ctx.db
      .query("drivers")
      .filter((q) => q.eq(q.field("assignedRoute"), route._id))
      .collect();
    
    // Get user details for the drivers
    const activeDrivers = await Promise.all(
      driversOnRoute.map(async (driver) => {
        const user = await ctx.db.get(driver.userId);
        return {
          driverId: driver.userId,
          driverName: user?.name || "Unknown",
          averageRating: driver.averageRating,
          totalRides: driver.numberOfRidesCompleted,
          isActive: user?.isActive || false
        };
      })
    );
    
    const { start, destination } = parseRouteName(route.name);
    const sortedStops = route.stops.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
    
    return {
      success: true,
      route: {
        routeId: route.routeId,
        routeName: route.name,
        start,
        destination,
        taxiAssociation: route.taxiAssociation,
        fare: route.fare,
        estimatedDuration: route.estimatedDuration,
        stops: sortedStops,
        geometry: route.geometry,
        totalStops: sortedStops.length,
        isActive: route.isActive
      },
      activeDrivers: activeDrivers.filter(driver => driver.isActive),
      message: `Route details retrieved successfully`
    };
  },
});

// Get driver's assigned route
export const getDriverAssignedRoute = query({
  args: { userId: v.id("taxiTap_users") },
  handler: async (ctx, args) => {
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver || !driver.assignedRoute) {
      return null;
    }

    const route = await ctx.db.get(driver.assignedRoute);
    return route;
  },
}); 