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
import type * as functions_family_addChild from "../functions/family/addChild.js";
import type * as functions_family_idkAddChildHandler from "../functions/family/idkAddChildHandler.js";
import type * as functions_users_addUser from "../functions/users/addUser.js";
import type * as functions_users_addUserHandler from "../functions/users/addUserHandler.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/family/addChild": typeof functions_family_addChild;
  "functions/family/idkAddChildHandler": typeof functions_family_idkAddChildHandler;
  "functions/users/addUser": typeof functions_users_addUser;
  "functions/users/addUserHandler": typeof functions_users_addUserHandler;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
