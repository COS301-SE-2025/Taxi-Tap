/**
 * @file updateLocation.test.ts
 *
 * Integration-style test for the Convex `updateLocation` mutation.
 * – No real Convex backend needed
 * – Pure in-memory DB + fully-typed `MutationCtx`
 */

import { updateLocation } from '../../../convex/functions/locations/updateLocation';
import { MutationCtx } from '../../../convex/_generated/server';
import { Id } from '../../../convex/_generated/dataModel';

const makeMockDB = () => {
  const collections: Record<string, Record<string, any>> = { locations: {} };

  return {
    insert: (id: string, doc: any) => {
      collections.locations[id] = { _id: id, ...doc };
    },
    query: () => ({
      withIndex: (_i: string, filterFn: (doc: any) => boolean) => ({
        first: async () =>
          Object.values(collections.locations).find(filterFn) ?? null,
      }),
    }),
    patch: async (id: string, updates: any) => {
      Object.assign(collections.locations[id], updates);
    },
    collections,
  };
};

/* ────────────────────────────────────────────────────────────
   Fully-typed MutationCtx stub (Convex needs scheduler + runQuery)
   ──────────────────────────────────────────────────────────── */
const makeCtx = () => {
  const db = makeMockDB();
  const ctx: MutationCtx = {
    db: db as any,
    auth: {} as any,
    storage: {} as any,
    scheduler: {} as any,
    runQuery: async () => undefined,
    runMutation: async () => undefined, 
  };
  return { ctx, db };
};

/* ────────────────────────────────────────────────────────────
   Test suite
   ──────────────────────────────────────────────────────────── */
describe('updateLocation mutation', () => {
  let ctx: MutationCtx;
  let db: any;
  const userId = 'user123' as Id<'taxiTap_users'>;

  beforeEach(() => {
    ({ ctx, db } = makeCtx());

    // seed one location document
    db.insert('loc1', {
      userId,
      latitude: 0,
      longitude: 0,
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('patches coords and timestamp for an existing user', async () => {
    await (updateLocation as any)(ctx, {
      userId,
      latitude: -25.123,
      longitude: 27.456,
    });

    const updated = Object.values(db.collections.locations).find(
      (l: any) => l.userId === userId,
    ) as any;

    expect(updated.latitude).toBeCloseTo(-25.123);
    expect(updated.longitude).toBeCloseTo(27.456);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
      new Date('2024-01-01').getTime(),
    );
  });

  it('throws if no record exists for the user', async () => {
    const fake = 'noDoc' as Id<'taxiTap_users'>;

    await expect(
      (updateLocation as any)(ctx, {
        userId: fake,
        latitude: 1,
        longitude: 1,
      }),
    ).rejects.toThrow(`No location record found for user ${fake}`);
  });
});