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
import type * as functions_rides_RequestRide from "../functions/rides/RequestRide.js";
import type * as functions_users_UserManagement_logInWithEmail from "../functions/users/UserManagement/logInWithEmail.js";
import type * as functions_users_UserManagement_signUpWithEmail from "../functions/users/UserManagement/signUpWithEmail.js";
import type * as functions_users_UserManagement_switchBothtoDriver from "../functions/users/UserManagement/switchBothtoDriver.js";
import type * as functions_users_UserManagement_switchBothtoPassenger from "../functions/users/UserManagement/switchBothtoPassenger.js";
import type * as functions_users_UserManagement_switchDrivertoBoth from "../functions/users/UserManagement/switchDrivertoBoth.js";
import type * as functions_users_UserManagement_switchPassengertoBoth from "../functions/users/UserManagement/switchPassengertoBoth.js";
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
  "functions/rides/RequestRide": typeof functions_rides_RequestRide;
  "functions/users/UserManagement/logInWithEmail": typeof functions_users_UserManagement_logInWithEmail;
  "functions/users/UserManagement/signUpWithEmail": typeof functions_users_UserManagement_signUpWithEmail;
  "functions/users/UserManagement/switchBothtoDriver": typeof functions_users_UserManagement_switchBothtoDriver;
  "functions/users/UserManagement/switchBothtoPassenger": typeof functions_users_UserManagement_switchBothtoPassenger;
  "functions/users/UserManagement/switchDrivertoBoth": typeof functions_users_UserManagement_switchDrivertoBoth;
  "functions/users/UserManagement/switchPassengertoBoth": typeof functions_users_UserManagement_switchPassengertoBoth;
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
