// Mock Convex server types
export type DatabaseReader = {
  query: (table: string) => {
    collect: () => Promise<any[]>;
    filter: (predicate: any) => any;
  };
};

export type QueryCtx = {
  db: DatabaseReader;
};

// Create a concrete implementation of QueryCtx
export const createQueryCtx = (): QueryCtx => ({
  db: {
    query: (table: string) => ({
      collect: () => Promise.resolve([]),
      filter: (predicate: any) => ({
        collect: () => Promise.resolve([])
      })
    })
  }
});

export const query = (handler: any) => handler;

// Export as both default and named exports to support different import styles
export default {
  createQueryCtx,
  query
}; 