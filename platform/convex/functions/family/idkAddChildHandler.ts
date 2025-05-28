// convex/functions/family/idkAddChildHandler.ts
export async function idkAddChildHandler(
  ctx: any,
  args: {
    parentId: string;
    name: string;
    age: number;
  }
) {
  // Insert a new child record linked to the parent
  const childId = await ctx.db.insert('children', {
    parentId: args.parentId,
    name: args.name,
    age: args.age,
  });
  return childId;
}
