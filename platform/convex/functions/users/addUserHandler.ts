// convex/functions/users/addUserHandler.ts
export async function addUserHandler(ctx: any, args: {
  name: string;
  email: string;
  age: number;
}) {
  return await ctx.db.insert('users', {
    name: args.name,
    email: args.email,
    age: args.age,
  });
}
