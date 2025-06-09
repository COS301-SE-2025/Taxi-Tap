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
import type * as functions_users_UserManagement_getUserById from "../functions/users/UserManagement/getUserById.js";
import type * as functions_users_UserManagement_logInWithEmail from "../functions/users/UserManagement/logInWithEmail.js";
import type * as functions_users_UserManagement_logInWithSMS from "../functions/users/UserManagement/logInWithSMS.js";
import type * as functions_users_UserManagement_signUpWithEmail from "../functions/users/UserManagement/signUpWithEmail.js";
import type * as functions_users_UserManagement_signUpWithSMS from "../functions/users/UserManagement/signUpWithSMS.js";
import type * as functions_users_UserManagement_switchActiveRole from "../functions/users/UserManagement/switchActiveRole.js";
import type * as functions_users_UserManagement_switchBothtoDriver from "../functions/users/UserManagement/switchBothtoDriver.js";
import type * as functions_users_UserManagement_switchBothtoPassenger from "../functions/users/UserManagement/switchBothtoPassenger.js";
import type * as functions_users_UserManagement_switchDrivertoBoth from "../functions/users/UserManagement/switchDrivertoBoth.js";
import type * as functions_users_UserManagement_switchPassengertoBoth from "../functions/users/UserManagement/switchPassengertoBoth.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/users/UserManagement/getUserById": typeof functions_users_UserManagement_getUserById;
  "functions/users/UserManagement/logInWithEmail": typeof functions_users_UserManagement_logInWithEmail;
  "functions/users/UserManagement/logInWithSMS": typeof functions_users_UserManagement_logInWithSMS;
  "functions/users/UserManagement/signUpWithEmail": typeof functions_users_UserManagement_signUpWithEmail;
  "functions/users/UserManagement/signUpWithSMS": typeof functions_users_UserManagement_signUpWithSMS;
  "functions/users/UserManagement/switchActiveRole": typeof functions_users_UserManagement_switchActiveRole;
  "functions/users/UserManagement/switchBothtoDriver": typeof functions_users_UserManagement_switchBothtoDriver;
  "functions/users/UserManagement/switchBothtoPassenger": typeof functions_users_UserManagement_switchBothtoPassenger;
  "functions/users/UserManagement/switchDrivertoBoth": typeof functions_users_UserManagement_switchDrivertoBoth;
  "functions/users/UserManagement/switchPassengertoBoth": typeof functions_users_UserManagement_switchPassengertoBoth;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
