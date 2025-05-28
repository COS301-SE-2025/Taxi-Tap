import { addUserHandler } from '../../../convex/functions/users/addUserHandler';

test('adds a user and returns ID', async () => {
  const mockCtx = {
    db: {
      insert: jest.fn(() => Promise.resolve('mock-id')),
    },
  };

  const result = await addUserHandler(mockCtx, {
    name: 'Ati',
    email: 'ati@example.com',
    age: 22,
  });

  expect(result).toBe('mock-id');
  expect(mockCtx.db.insert).toHaveBeenCalledWith('users', {
    name: 'Ati',
    email: 'ati@example.com',
    age: 22,
  });
});