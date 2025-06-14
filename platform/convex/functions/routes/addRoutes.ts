import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { MutationCtx } from "../../_generated/server";

type AddRoutesArgs = {
  data: {
    routes: {
      routeId: string;
      name: string;
      geometry: any;
      stops: {
        id: string;
        name: string;
        coordinates: number[];
        order: number;
      }[];
      fare: number;
      estimatedDuration: number;
      isActive: boolean;
      taxiAssociation: string;
      taxiAssociationRegistrationNumber: string;
    }[];
    metadata: any; // Still included in the type for incoming data validation
  };
};

export const addRoutesHandler = async (
  ctx: MutationCtx,
  args: AddRoutesArgs
) => {
  for (const route of args.data.routes) {
    await ctx.db.insert("routes", {
      routeId: route.routeId,
      name: route.name,
      geometry: route.geometry,
      stops: route.stops,
      fare: route.fare,
      estimatedDuration: route.estimatedDuration,
      isActive: route.isActive,
      taxiAssociation: route.taxiAssociation,
      taxiAssociationRegistrationNumber: route.taxiAssociationRegistrationNumber,
      // metadata is intentionally omitted here
    });
  }
  console.log(`Successfully added ${args.data.routes.length} routes.`);
  return { success: true, addedCount: args.data.routes.length };
};

export const addRoutes = mutation({
  args: {
    data: v.object({
      routes: v.array(
        v.object({
          routeId: v.string(),
          name: v.string(),
          geometry: v.any(),
          stops: v.array(
            v.object({
              id: v.string(),
              name: v.string(),
              coordinates: v.array(v.number()),
              order: v.number(),
            })
          ),
          fare: v.number(),
          estimatedDuration: v.number(),
          isActive: v.boolean(),
          taxiAssociation: v.string(),
          taxiAssociationRegistrationNumber: v.string(),
        })
      ),
      metadata: v.any(), // Still define it in validation to accept the incoming JSON structure
    }),
  },
  handler: addRoutesHandler,
});