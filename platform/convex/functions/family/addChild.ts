// convex/functions/family/addChild.ts
import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { idkAddChildHandler } from './idkAddChildHandler';

export const addChild = mutation({
  args: {
    parentId: v.string(),
    name: v.string(),
    age: v.number(),
  },
  handler: idkAddChildHandler,
});
