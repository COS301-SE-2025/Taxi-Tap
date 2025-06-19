import { query, QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { DatabaseReader } from "../../_generated/server";


function parseRouteName(routeName: string) {
  const parts = routeName?.split("-").map(part => part.trim()) ?? ["Unknown", "Unknown"];
  return {
    start: parts[0] ?? "Unknown",
    destination: parts[1] ?? "Unknown"
  };
}

// Helper function to safely extract coordinates from geometry
function extractCoordinates(geometry: { coordinates: any; }) {
  const coordinates = geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return {
      startCoords: null,
      destinationCoords: null,
    };
  }

  const firstCoord = coordinates[0];
  const lastCoord = coordinates[coordinates.length - 1];

  if (!Array.isArray(firstCoord) || firstCoord.length < 2 || !Array.isArray(lastCoord) || lastCoord.length < 2) {
    return {
      startCoords: null,
      destinationCoords: null,
    };
  }

  const [startLatitude, startLongitude] = firstCoord;
  const [destLatitude, destLongitude] = lastCoord;

  return {
    startCoords: {
      latitude: startLatitude,
      longitude: startLongitude,
    },
    destinationCoords: {
      latitude: destLatitude,
      longitude: destLongitude,
    },
  };
}

// 1. Get all routes
export const getAllRoutesHandler = async ({ db }: { db: DatabaseReader }) => {
  const routes = await db.query("routes").collect();
  
  // Return only the essential fields
  return routes.map((route: { geometry: any; isActive: any; name: any; routeId: any; stops: any; taxiAssociation: any; }) => ({
    geometry: route.geometry,
    isActive: route.isActive,
    name: route.name,
    routeId: route.routeId,
    stops: route.stops,
    taxiAssociation: route.taxiAssociation
  }));
};

export const getAllRoutes = query(getAllRoutesHandler);

// 2. Get all routes for a specific taxi association
export const getRoutesByTaxiAssociationHandler = async ({ db }: { db: DatabaseReader }, args: { taxiAssociation: string }) => {
  const routes = await db
    .query("routes")
    .filter((q) => q.eq(q.field("taxiAssociation"), args.taxiAssociation))
    .collect();
  
  // Return only the essential fields
  return routes.map((route: { geometry: any; isActive: boolean; name: string; routeId: string; stops: any; taxiAssociation: string }) => ({
    geometry: route.geometry,
    isActive: route.isActive,
    name: route.name,
    routeId: route.routeId,
    stops: route.stops,
    taxiAssociation: route.taxiAssociation
  }));
};

export const getRoutesByTaxiAssociation = query({
  args: { taxiAssociation: v.string() },
  handler: getRoutesByTaxiAssociationHandler,
});

// 3. Get all destinations (end points) for a specific start point
export const getDestinationsByStartPointHandler = async ({ db }: { db: DatabaseReader }, args: { startPoint: string }) => {
  const routes = await db.query("routes").collect();
  
  const destinations: string[] = [];
  
  routes.forEach((route: { isActive: any; name: string; }) => {
    if (route.isActive) {
      const { start, destination } = parseRouteName(route.name);
      
      // Check if the start point matches (case-insensitive)
      if (start.toLowerCase().includes(args.startPoint.toLowerCase()) || 
          args.startPoint.toLowerCase().includes(start.toLowerCase())) {
        if (!destinations.includes(destination) && destination !== "Unknown") {
          destinations.push(destination);
        }
      }
    }
  });
  
  return destinations.sort();
};

export const getDestinationsByStartPoint = query({
  args: { startPoint: v.string() },
  handler: getDestinationsByStartPointHandler,
});



// 4. Get route stops given start and end points
export const getRouteStopsHandler = async ({ db }: { db: DatabaseReader }, args: { startPoint: string; endPoint: string }) => {
  const routes = await db.query("routes").collect();
  
  // Find the route that matches both start and end points
  const matchingRoute = routes.find((route: { isActive: any; name: string; }) => {
    if (!route.isActive) return false;
    
    const { start, destination } = parseRouteName(route.name);
    
    const startMatches = start.toLowerCase().includes(args.startPoint.toLowerCase()) || 
                        args.startPoint.toLowerCase().includes(start.toLowerCase());
    const endMatches = destination.toLowerCase().includes(args.endPoint.toLowerCase()) || 
                      args.endPoint.toLowerCase().includes(destination.toLowerCase());
    
    return startMatches && endMatches;
  });
  
  if (!matchingRoute) {
    return [];
  }
  
  // Return the stops for the matching route, sorted by order
  return matchingRoute.stops.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
};

export const getRouteStops = query({
  args: { 
    startPoint: v.string(),
    endPoint: v.string()
  },
  handler: getRouteStopsHandler,
});
export const getRoutesWithCoordinatesHandler = async ({ db }: { db: DatabaseReader }) => {
  const routes = await db.query("routes").collect();

  return routes.map((route: { name: string; geometry: { coordinates: any; }; routeId: any; taxiAssociation: any; isActive: any; stops: any; }) => {
    const { start, destination } = parseRouteName(route.name);
    const { startCoords, destinationCoords } = extractCoordinates(route.geometry);

    return {
      // Basic route info
      routeId: route.routeId,
      name: route.name,
      taxiAssociation: route.taxiAssociation,
      isActive: route.isActive,
      
      // Parsed route info
      start,
      destination,
      startCoords,
      destinationCoords,
      
      // Full route data
      geometry: route.geometry,
      stops: route.stops,
    };
  });
};

export const getRoutesWithCoordinates = query(getRoutesWithCoordinatesHandler);

// Helper function to get unique start points (consistent with displayRoutes parsing)
export const getAllStartPointsHandler = async ({ db }: { db: DatabaseReader }) => {
  const routes = await db.query("routes").collect();
  
  const startPoints: string[] = [];
  
  routes.forEach((route: { isActive: any; name: string; }) => {
    if (route.isActive) {
      const { start } = parseRouteName(route.name);
      if (!startPoints.includes(start) && start !== "Unknown") {
        startPoints.push(start);
      }
    }
  });
  
  return startPoints.sort();
};

export const getAllStartPoints = query(getAllStartPointsHandler);

// Helper function to get all taxi associations
export const getAllTaxiAssociationsHandler = async ({ db }: { db: DatabaseReader }) => {
  const routes = await db.query("routes").collect();
  
  const associations: string[] = [];
  
  routes.forEach((route: { isActive: boolean; taxiAssociation: string }) => {
    if (route.isActive && !associations.includes(route.taxiAssociation)) {
      associations.push(route.taxiAssociation);
    }
  });
  
  return associations.sort();
};

export const getAllTaxiAssociations = query(getAllTaxiAssociationsHandler);

// Get routes by start point (useful for the UI)
export const getRoutesByStartPointHandler = async ({ db }: { db: DatabaseReader }, args: { startPoint: string }) => {
  const routes = await db.query("routes").collect();
  
  return routes
    .filter((route: { isActive: any; name: string; }) => {
      if (!route.isActive) return false;
      
      const { start } = parseRouteName(route.name);
      return start.toLowerCase().includes(args.startPoint.toLowerCase()) || 
             args.startPoint.toLowerCase().includes(start.toLowerCase());
    })
    .map((route: { name: string; geometry: { coordinates: any; }; routeId: any; taxiAssociation: any; stops: any; isActive: any; }) => {
      const { start, destination } = parseRouteName(route.name);
      const { startCoords, destinationCoords } = extractCoordinates(route.geometry);
      
      return {
        routeId: route.routeId,
        name: route.name,
        taxiAssociation: route.taxiAssociation,
        start,
        destination,
        startCoords,
        destinationCoords,
        geometry: route.geometry,
        stops: route.stops,
        isActive: route.isActive,
      };
    })
    .sort((a: { destination: string }, b: { destination: string }) => a.destination.localeCompare(b.destination));
};

export const getRoutesByStartPoint = query({
  args: { startPoint: v.string() },
  handler: getRoutesByStartPointHandler,
});