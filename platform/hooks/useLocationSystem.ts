import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function useLocationSystem(userId: string | undefined) {
  // 👇 pull out the actual mutation function
  const updateLocation = useMutation(
    api.functions.locations.updateLocation.updateLocation
  );
  const createLocation = useMutation(
    api.functions.locations.createLocation.createLocation
  );

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCoords({ latitude, longitude });

          (async () => {
            try {
              await updateLocation({
                userId: userId as Id<"taxiTap_users">,
                latitude,
                longitude,
              });
            } catch (err: any) {
              if (err?.message?.includes("No location record found")) {
                // Fallback: create location, then retry update
                await createLocation({
                  userId: userId as Id<"taxiTap_users">,
                  latitude,
                  longitude,
                  role: "driver", // or detect role if available
                });
                await updateLocation({
                  userId: userId as Id<"taxiTap_users">,
                  latitude,
                  longitude,
                });
              } else {
                throw err;
              }
            }
          })();
        }
      );
    })();
  }, [userId]);

  // 👇 and likewise for the query
  const nearbyTaxis = useQuery(
    api.functions.locations.getNearbyTaxis.getNearbyTaxis,
    coords
      ? { passengerLat: coords.latitude, passengerLng: coords.longitude }
      : "skip"
  );

  return {
    userLocation: coords,
    nearbyTaxis,
  };
}