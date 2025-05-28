jest.mock('convex/values', () => ({
  v: {
    string: jest.fn(() => 'string'),
  },
}));

jest.mock('../../../convex/_generated/server', () => ({
  query: jest.fn(),
  QueryCtx: {},
}));

import { loginHandler } from '../../../convex/functions/users/UserManagement/logInWithEmail';

const createMockQueryCtx = () => ({
  db: {
    query: jest.fn(),
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
  runQuery: jest.fn(),
  scheduler: {
    runAfter: jest.fn(),
    runAt: jest.fn(),
    cancel: jest.fn(),
  },
});

describe('loginHandler', () => {
  let mockCtx: any;
  let mockQuery: jest.Mock;
  let mockWithIndex: jest.Mock;
  let mockFirst: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFirst = jest.fn();
    mockWithIndex = jest.fn().mockReturnValue({ first: mockFirst });
    mockQuery = jest.fn().mockReturnValue({ withIndex: mockWithIndex });

    mockCtx = createMockQueryCtx();
    mockCtx.db.query = mockQuery;
  });

  describe('successful login', () => {
    it('should return user data when email and password are correct', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        password: 'password123',
      };

      const args = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(mockUser);

      const result = await loginHandler(mockCtx, args);

      expect(mockQuery).toHaveBeenCalledWith('taxiTap_users');
      expect(mockWithIndex).toHaveBeenCalledWith('by_email', expect.any(Function));
      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
      });
    });

    it('should call the index query with correct email filter', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        password: 'password123',
      };

      const args = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(mockUser);

      let capturedCallback: ((q: any) => any) | undefined;
      mockWithIndex.mockImplementation((indexName: string, callback: (q: any) => any) => {
        capturedCallback = callback;
        return { first: mockFirst };
      });

      await loginHandler(mockCtx, args);

      expect(mockWithIndex).toHaveBeenCalledWith('by_email', expect.any(Function));

      if (capturedCallback) {
        const mockQ = { eq: jest.fn().mockReturnValue('filtered_query') };
        const callbackResult = capturedCallback(mockQ);
        expect(mockQ.eq).toHaveBeenCalledWith('email', 'test@example.com');
        expect(callbackResult).toBe('filtered_query');
      }
    });
  });

  describe('user not found', () => {
    it('should throw "User not found" error when user does not exist', async () => {
      const args = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('User not found');
      expect(mockQuery).toHaveBeenCalledWith('taxiTap_users');
    });

    it('should throw "User not found" error when user is undefined', async () => {
      const args = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(undefined);

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('User not found');
    });
  });

  describe('invalid password', () => {
    it('should throw "Invalid password" error when password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        password: 'correctpassword',
      };

      const args = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockFirst.mockResolvedValue(mockUser);

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('Invalid password');
      expect(mockQuery).toHaveBeenCalledWith('taxiTap_users');
    });

    it('should throw "Invalid password" error when password is empty string', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        password: 'password123',
      };

      const args = {
        email: 'test@example.com',
        password: '',
      };

      mockFirst.mockResolvedValue(mockUser);

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('Invalid password');
    });
  });

  describe('edge cases', () => {
    it('should handle case-sensitive email correctly', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'Test@Example.com',
        name: 'John Doe',
        password: 'password123',
      };

      const args = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(null);

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('User not found');
    });

    it('should handle special characters in email and password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test+special@example.com',
        name: 'John Doe',
        password: 'p@ssw0rd!#$%',
      };

      const args = {
        email: 'test+special@example.com',
        password: 'p@ssw0rd!#$%',
      };

      mockFirst.mockResolvedValue(mockUser);

      const result = await loginHandler(mockCtx, args);

      expect(result).toEqual({
        id: 'user123',
        email: 'test+special@example.com',
        name: 'John Doe',
      });
    });

    it('should not return password in the response', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        password: 'password123',
        otherSensitiveData: 'secret',
      };

      const args = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFirst.mockResolvedValue(mockUser);

      const result = await loginHandler(mockCtx, args);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('otherSensitiveData');
      expect(Object.keys(result)).toEqual(['id', 'email', 'name']);
    });
  });

  describe('database errors', () => {
    it('should propagate database query errors', async () => {
      const args = {
        email: 'test@example.com',
        password: 'password123',
      };

      const dbError = new Error('Database connection failed');
      mockFirst.mockRejectedValue(dbError);

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('Database connection failed');
    });

    it('should handle database timeout errors', async () => {
      const args = {
        email: 'test@example.com',
        password: 'password123',
      };

      const timeoutError = new Error('Query timeout');
      mockQuery.mockImplementation(() => {
        throw timeoutError;
      });

      await expect(loginHandler(mockCtx, args)).rejects.toThrow('Query timeout');
    });
  });
});
