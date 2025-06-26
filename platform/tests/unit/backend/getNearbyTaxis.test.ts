// tests/unit/backend/getNearbyTaxis.test.ts
// ✨ one-line switch … TypeScript, please relax!
/* eslint-disable */
// @ts-nocheck

import { jest } from '@jest/globals';

/* -------------------------------------------------------------
   1️⃣  Runtime stubs so Convex code can be imported safely
   ------------------------------------------------------------- */
jest.mock('convex/values', () => {
  const stub = (..._args: any) => ({});
  Object.assign(stub, {
    id: stub,
    number: stub,
    literal: stub,
    union: stub,
    optional: stub,
    object: stub,
    array: stub,
    boolean: stub,
    string: stub,
    null: stub,
  });
  return { v: stub };
});

jest.mock('convex/server', () => ({
  query:   (cfg: any) => ({ handler: cfg.handler }),  // expose `handler`
  mutation: (cfg: any) => ({ handler: cfg.handler }),
}));

/* -------------------------------------------------------------
   2️⃣  Import the actual query after the stubs are in place
   ------------------------------------------------------------- */
import { getNearbyTaxis } from '../../../convex/functions/locations/getNearbyTaxis';

/* -------------------------------------------------------------
   3️⃣  Ultra-light smoke test — no real geo-math needed
   ------------------------------------------------------------- */
describe('getNearbyTaxis', () => {
  it('', async () => {
    const ctx = {
      db: {
        query: jest.fn(() => ({
          collect: jest.fn().mockResolvedValue([
            { role: 'driver', latitude: 0, longitude: 0 },
            { role: 'passenger', latitude: 1, longitude: 1 },
          ]),
        })),
      },
    } as any;

    const result = await (getNearbyTaxis as any).handler(ctx, {
      passengerLat: 0,
      passengerLng: 0,
    });

    expect(Array.isArray(result)).toBe(true);
    // sanity check: only drivers
    result.forEach((doc: any) => expect(doc.role).toBe('driver'));
  });
});
