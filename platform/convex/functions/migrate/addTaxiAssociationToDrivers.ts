import { mutation } from "../../_generated/server";

export const addTaxiAssociationToDrivers = mutation({
  args: {},
  handler: async (ctx) => {
    const drivers = await ctx.db.query("drivers").collect();
    let updated = 0;
    for (const driver of drivers) {
      if (driver.taxiAssociation === undefined) {
        await ctx.db.patch(driver._id, { taxiAssociation: "" }); // or your default value
        updated++;
      }
    }
    return { updated };
  },
});