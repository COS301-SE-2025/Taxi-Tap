import { getAvailableTaxisHandler } from '../../convex/functions/taxis/displayTaxis';
import { QueryCtx } from '../../convex/_generated/server';

// Simulated in-memory database
const createMockDatabase = () => {
  const collections: Record<string, Record<string, any>> = {
    taxis: {},
    drivers: {},
    taxiTap_users: {},
  };

  return {
    insert: (collection: string, id: string, doc: any) => {
      collections[collection][id] = { _id: id, ...doc };
    },
    query: (collection: string) => ({
      withIndex: (_: string, filterFn: Function) => ({
        collect: async () => {
          const items = Object.values(collections[collection]);
          return items.filter((item) => filterFn({
            eq: (field: string, value: any) => item[field] === value,
          }));
        },
      }),
    }),
    get: async (id: string) => {
      const [collection, docId] = id.split(':');  // fake id format: "drivers:driver1"
      return collections[collection]?.[docId] ?? null;
    },
    _collections: collections,
  };
};

// Create simulated Convex context
const createMockCtx = () => {
  const db = createMockDatabase();
  const ctx = { db } as unknown as QueryCtx;
  return { ctx, db };
};

describe('Integration tests for getAvailableTaxisHandler', () => {
  let ctx: QueryCtx;
  let db: any;

  beforeEach(() => {
    const mock = createMockCtx();
    ctx = mock.ctx;
    db = mock.db;
  });

  it('returns available taxis with full data', async () => {
    // Insert data into in-memory DB
    db.insert('taxis', 'taxi1', {
      driverId: 'drivers:driver1',
      licensePlate: 'ABC123',
      image: 'http://image.url/taxi1.png',
      capacity: 4,
      model: 'Toyota Prius',
      isAvailable: true,
    });

    db.insert('drivers', 'driver1', { userId: 'taxiTap_users:user1' });
    db.insert('taxiTap_users', 'user1', { name: 'Alice' });

    const result = await getAvailableTaxisHandler(ctx);
    expect(result).toEqual([
      {
        licensePlate: 'ABC123',
        image: 'http://image.url/taxi1.png',
        seats: 4,
        model: 'Toyota Prius',
        driverName: 'Alice',
        userId: 'user1',
      },
    ]);
  });

  it('skips taxis with missing drivers or users', async () => {
    db.insert('taxis', 'taxi1', {
      driverId: 'drivers:driver1',
      licensePlate: 'AAA111',
      capacity: 4,
      model: 'Model A',
      isAvailable: true,
    });

    db.insert('taxis', 'taxi2', {
      driverId: 'drivers:missingDriver',
      licensePlate: 'BBB222',
      capacity: 4,
      model: 'Model B',
      isAvailable: true,
    });

    db.insert('drivers', 'driver1', { userId: 'taxiTap_users:user1' });
    db.insert('taxiTap_users', 'user1', { name: 'Alice' });

    const result = await getAvailableTaxisHandler(ctx);
    expect(result).toEqual([
      {
        licensePlate: 'AAA111',
        image: null,
        seats: 4,
        model: 'Model A',
        driverName: 'Alice',
        userId: 'user1',
      },
    ]);
  });

  it('returns empty if no available taxis', async () => {
    const result = await getAvailableTaxisHandler(ctx);
    expect(result).toEqual([]);
  });
});
