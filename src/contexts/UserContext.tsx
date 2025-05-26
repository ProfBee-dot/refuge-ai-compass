
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'user' | 'volunteer' | 'donor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  verified: boolean;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAdmin: boolean;
  isDonor: boolean;
  isVolunteer: boolean;
  isLoggedIn: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('refugeeai_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: User) => {
    // Additional security validation could be added here
    setUser(userData);
    localStorage.setItem('refugeeai_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('refugeeai_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('refugeeai_user', JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === 'admin';
  const isDonor = user?.role === 'donor';
  const isVolunteer = user?.role === 'volunteer';
  const isLoggedIn = !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAdmin,
        isDonor,
        isVolunteer,
        isLoggedIn,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
