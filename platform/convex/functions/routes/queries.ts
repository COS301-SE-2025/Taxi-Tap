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
