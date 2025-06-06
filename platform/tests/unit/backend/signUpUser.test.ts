/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('convex/values', () => ({
  v: {
    string: jest.fn(() => 'string'),
  },
}));

jest.mock('../../../convex/_generated/server', () => ({
  mutation: jest.fn(),
  MutationCtx: {},
}));

jest.mock('@noble/hashes/utils', () => ({
  hexEncode: jest.fn(),
}));

import { signUpHandler } from '../../../convex/functions/users/UserManagement/signUpWithEmail';

const createMockMutationCtx = () => ({
  db: {
    query: jest.fn(),
    insert: jest.fn(),
    get: jest.fn(),
    normalizeId: jest.fn(),
    system: {},
  },
  auth: {
    getUserIdentity: jest.fn(),
  },
  storage: {
    getUrl: jest.fn(),
    generateUploadUrl: jest.fn(),
  },
  runMutation: jest.fn(),
  scheduler: {
    runAfter: jest.fn(),
    runAt: jest.fn(),
    cancel: jest.fn(),
  },
});

describe('signUpHandler', () => {
  let mockCtx: any;
  let mockQuery: jest.Mock;
  let mockWithIndex: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFirst = jest.fn();
    mockWithIndex = jest.fn().mockReturnValue({ first: mockFirst });
    mockQuery = jest.fn().mockReturnValue({ withIndex: mockWithIndex });
    mockInsert = jest.fn();

    mockCtx = createMockMutationCtx();
    mockCtx.db.query = mockQuery;
    mockCtx.db.insert = mockInsert;
  });

  describe('successful signup', () => {
    it('should create a new user when email does not exist', async () => {
      const args = {
        email: 'newuser@example.com',
        name: 'John Doe',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      await signUpHandler(mockCtx, args);

      expect(mockQuery).toHaveBeenCalledWith('taxiTap_users');
      expect(mockWithIndex).toHaveBeenCalledWith('by_email', expect.any(Function));
      expect(mockInsert).toHaveBeenCalledWith('taxiTap_users', {
        email: 'newuser@example.com',
        name: 'John Doe',
        password: 'password123',
        age: 0,
      });
    });

    it('should use correct email filter in index query', async () => {
      const args = {
        email: 'test@example.com',
        name: 'Jane Doe',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      let capturedCallback: ((q: any) => any) | undefined;
      mockWithIndex.mockImplementation((_, callback) => {
        capturedCallback = callback;
        return { first: mockFirst };
      });

      await signUpHandler(mockCtx, args);

      expect(mockWithIndex).toHaveBeenCalledWith('by_email', expect.any(Function));
      
      if (capturedCallback) {
        const mockQ = { eq: jest.fn().mockReturnValue('filtered_query') };
        const result = capturedCallback(mockQ);
        expect(mockQ.eq).toHaveBeenCalledWith('email', 'test@example.com');
        expect(result).toBe('filtered_query');
      }
    });

    it('should default age to 0', async () => {
      const args = {
        email: 'newuser@example.com',
        name: 'John Doe',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      await signUpHandler(mockCtx, args);

      expect(mockInsert).toHaveBeenCalledWith('taxiTap_users', expect.objectContaining({ age: 0 }));
    });
  });

  describe('email already exists', () => {
    it('should throw if user exists', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'existingpassword',
      };

      const args = {
        email: 'existing@example.com',
        name: 'New User',
        password: 'newpassword',
      };

      mockFirst.mockResolvedValue(existingUser);

      await expect(signUpHandler(mockCtx, args)).rejects.toThrow('Email already exists');
      expect(mockQuery).toHaveBeenCalledWith('taxiTap_users');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should not insert if user already exists', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'existingpassword',
      };

      const args = {
        email: 'existing@example.com',
        name: 'New User',
        password: 'newpassword',
      };

      mockFirst.mockResolvedValue(existingUser);

      await expect(signUpHandler(mockCtx, args)).rejects.toThrow('Email already exists');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('race condition handling', () => {
    it('should handle race condition on insert', async () => {
      const args = {
        email: 'raced@example.com',
        name: 'Raced User',
        password: 'password123',
      };

      const racedUser = {
        _id: 'user123',
        email: 'raced@example.com',
        name: 'Other User',
        password: 'otherpassword',
      };

      mockFirst.mockResolvedValueOnce(null);
      mockInsert.mockRejectedValue(new Error('Constraint violation'));
      mockFirst.mockResolvedValueOnce(racedUser);

      await expect(signUpHandler(mockCtx, args)).rejects.toThrow('Email already exists (raced)');
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    it('should re-throw original error if no user found after insert fails', async () => {
      const args = {
        email: 'error@example.com',
        name: 'Error User',
        password: 'password123',
      };

      const originalError = new Error('Database constraint violation');

      mockFirst.mockResolvedValueOnce(null);
      mockInsert.mockRejectedValue(originalError);
      mockFirst.mockResolvedValueOnce(null);

      await expect(signUpHandler(mockCtx, args)).rejects.toThrow('Database constraint violation');
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should preserve email case', async () => {
      const args = {
        email: 'Test@Example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      await signUpHandler(mockCtx, args);

      expect(mockInsert).toHaveBeenCalledWith('taxiTap_users', expect.objectContaining({
        email: 'Test@Example.com',
      }));
    });

    it('should support special characters', async () => {
      const args = {
        email: 'test+special@example.com',
        name: 'John O\'Connor-Smith',
        password: 'p@ssw0rd!#$%^&*()',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      await signUpHandler(mockCtx, args);

      expect(mockInsert).toHaveBeenCalledWith('taxiTap_users', {
        email: 'test+special@example.com',
        name: 'John O\'Connor-Smith',
        password: 'p@ssw0rd!#$%^&*()',
        age: 0,
      });
    });

    it('should support unicode in names', async () => {
      const args = {
        email: 'unicode@example.com',
        name: 'José María González-Pérez',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      await signUpHandler(mockCtx, args);

      expect(mockInsert).toHaveBeenCalledWith('taxiTap_users', expect.objectContaining({
        name: 'José María González-Pérez',
      }));
    });

    it('should accept empty strings', async () => {
      const args = {
        email: 'empty@example.com',
        name: '',
        password: '',
      };

      mockFirst.mockResolvedValue(null);
      mockInsert.mockResolvedValue('user123');

      await signUpHandler(mockCtx, args);

      expect(mockInsert).toHaveBeenCalledWith('taxiTap_users', {
        email: 'empty@example.com',
        name: '',
        password: '',
        age: 0,
      });
    });
  });

  describe('database errors', () => {
    it('should throw if query fails', async () => {
      const args = {
        email: 'query-error@example.com',
        name: 'Query Error User',
        password: 'password123',
      };

      const dbError = new Error('Database connection failed');
      mockFirst.mockRejectedValue(dbError);

      await expect(signUpHandler(mockCtx, args)).rejects.toThrow('Database connection failed');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });
});
