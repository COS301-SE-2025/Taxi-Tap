import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    age: v.number(),
  }),
  messages: defineTable({
    body: v.string(),
    sender: v.id("users"),
  }),
  messages_ati: defineTable({
    body: v.string(),
    sender: v.id("users"),
  }),
  messages_ati23: defineTable({
    body: v.string(),
    sender: v.id("users"),
  }),
  taxiTap_users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    age: v.number(),
  }),
});