// convex/addUser.ts
import { mutation } from "./_generated/server";

export default mutation(
  async ({ db }, { name, email, age }: { 
    name: string; 
    email: string; 
    age: number }) => {
    // Inserts a new user into the "users" table
    const id = await db.insert("users", { name, email, age });
    return id; // returns the generated _id
  }
);
