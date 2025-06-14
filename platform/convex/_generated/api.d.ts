/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_rides_RequestRide from "../functions/rides/RequestRide.js";
import type * as functions_rides_acceptRide from "../functions/rides/acceptRide.js";
import type * as functions_rides_cancelRide from "../functions/rides/cancelRide.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/rides/RequestRide": typeof functions_rides_RequestRide;
  "functions/rides/acceptRide": typeof functions_rides_acceptRide;
  "functions/rides/cancelRide": typeof functions_rides_cancelRide;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
