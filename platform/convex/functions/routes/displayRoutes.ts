import { query, QueryCtx } from "../../_generated/server";

export const displayRoutesHandler = async ({ db }: QueryCtx) => {
  const routes = await db.query("routes").collect();

  return routes.map(route => {
    const parts = route.name?.split("-").map(part => part.trim()) ?? ["Unknown", "Unknown"];
    const geometry = route.geometry;

    // Safely extract coordinates
    const coordinates = geometry?.coordinates;

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return {
        start: parts[0],
        destination: parts[1] ?? null,
        startCoords: null,
        destinationCoords: null,
      };
    }

    const firstCoord = coordinates[0];
    const lastCoord = coordinates[coordinates.length - 1];

    if (!Array.isArray(firstCoord) || firstCoord.length < 2 || !Array.isArray(lastCoord) || lastCoord.length < 2) {
      return {
        start: parts[0],
        destination: parts[1] ?? null,
        startCoords: null,
        destinationCoords: null,
      };
    }

    const [startLatitude, startLongitude] = firstCoord;
    const [destLatitude, destLongitude] = lastCoord;

    return {
      start: parts[0] ?? null,
      destination: parts[1] ?? null,
      startCoords: {
        latitude: startLatitude,
        longitude: startLongitude,
      },
      destinationCoords: {
        latitude: destLatitude,
        longitude: destLongitude,
      },
    };
  });
};

export const displayRoutes = query(displayRoutesHandler);