// contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions
interface User {
  id: string;
  name: string;
  role: string;
  accountType: string;
}

interface UserLoginData {
  _id?: string;
  id?: string;
  name: string;
  currentActiveRole: string;
  accountType: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: UserLoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (newRole: string) => Promise<void>;
  updateUserName: (newName: string) => Promise<void>;
  updateAccountType: (newAccountType: string) => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async (): Promise<void> => {
    try {
      const userData = await AsyncStorage.multiGet(['userId', 'userName', 'userRole', 'userAccountType']);
      const [userId, userName, userRole, userAccountType] = userData.map(([key, value]) => value);
      
      if (userId) {
        setUser({
          id: userId,
          name: userName || '',
          role: userRole || '',
          accountType: userAccountType || '',
        });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: UserLoginData): Promise<void> => {
    const userInfo: User = {
      id: userData._id || userData.id || '',
      name: userData.name,
      role: userData.currentActiveRole,
      accountType: userData.accountType, // Include account type for switching logic
    };
    
    setUser(userInfo);
    
    // Save to AsyncStorage
    await AsyncStorage.multiSet([
      ['userId', userInfo.id],
      ['userName', userInfo.name],
      ['userRole', userInfo.role],
      ['userAccountType', userInfo.accountType],
    ]);
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    await AsyncStorage.multiRemove(['userId', 'userName', 'userRole', 'userAccountType']);
  };

  const updateUserRole = async (newRole: string): Promise<void> => {
    if (user) {
      const updatedUser: User = { ...user, role: newRole };
      setUser(updatedUser);
      await AsyncStorage.setItem('userRole', newRole);
    }
  };

  const updateUserName = async (newName: string): Promise<void> => {
    if (user) {
      const updatedUser: User = { ...user, name: newName };
      setUser(updatedUser);
      await AsyncStorage.setItem('userName', newName);
    }
  };

  const updateAccountType = async (newAccountType: string): Promise<void> => {
    if (user) {
      const updatedUser: User = { ...user, accountType: newAccountType };
      setUser(updatedUser);
      await AsyncStorage.setItem('userAccountType', newAccountType);
    }
  };

  const contextValue: UserContextType = {
    user,
    loading,
    login,
    logout,
    updateUserRole,
    updateUserName,
    updateAccountType,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};