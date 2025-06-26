// tests/unit/backend/updateLocation.test.ts
/* eslint-disable */
// @ts-nocheck           — we’re unit-testing behaviour, not types

import { jest } from '@jest/globals'

/* ──────────────────────────────────────────────────────────────
   1️⃣  Stub Convex “values” so validators don’t explode
   ────────────────────────────────────────────────────────────── */
jest.mock('convex/values', () => {
  const stub = () => ({})
  return { v: Object.assign(stub, { id: stub, number: stub }) }
})

/* ──────────────────────────────────────────────────────────────
   2️⃣  Convex server helper is imported *relatively* in the
       production file: "../../_generated/server".
       Depending on Jest’s resolver, it can end up as any of the
       strings below, so we mock all three.
   ────────────────────────────────────────────────────────────── */
const fakeServer = {
  mutation: (cfg: any) => ({ handler: cfg.handler }),
}

// • when Node resolves the relative path inside the module
jest.mock('convex/_generated/server', () => fakeServer, { virtual: true })

// • when Jest resolves the fully-relative path from *this* file (three “..”)
jest.mock('../../../convex/_generated/server', () => fakeServer, {
  virtual: true,
})

// • when Jest resolves exactly the specifier string the module uses
jest.mock('../../_generated/server', () => fakeServer, { virtual: true })

/* ──────────────────────────────────────────────────────────────
   3️⃣  Import the real mutation – now it can load safely
   ────────────────────────────────────────────────────────────── */
import { updateLocation } from '../../../convex/functions/locations/updateLocation'

/* ──────────────────────────────────────────────────────────────
   4️⃣  Helper to build a minimal ctx with spies
   ────────────────────────────────────────────────────────────── */
const buildCtx = (loc: any | null) => {
  const patch = jest.fn().mockResolvedValue(undefined)
  const first = jest.fn().mockResolvedValue(loc)
  const query = jest.fn(() => ({
    withIndex: () => ({ first }),
  }))
  return { ctx: { db: { query, patch } } as any, patch, first }
}

/* ──────────────────────────────────────────────────────────────
   5️⃣  Tests
   ────────────────────────────────────────────────────────────── */
describe('updateLocation mutation', () => {
  const callArgs = {
    userId: 'user_123',
    latitude: -26.2,
    longitude: 28.04,
  }

  it('patches the existing location document', async () => {
    const existing = { _id: 'loc1', userId: callArgs.userId }
    const { ctx, patch } = buildCtx(existing)

    await (updateLocation as any).handler(ctx, callArgs)

    expect(patch).toHaveBeenCalledTimes(1)
    expect(patch).toHaveBeenCalledWith(
      'loc1',
      expect.objectContaining({
        latitude: callArgs.latitude,
        longitude: callArgs.longitude,
        updatedAt: expect.any(String),
      }),
    )
  })

  it('throws when no location record exists', async () => {
    const { ctx } = buildCtx(null)

    await expect(
      (updateLocation as any).handler(ctx, callArgs),
    ).rejects.toThrow(`No location record found for user ${callArgs.userId}`)
  })
})
