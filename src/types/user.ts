
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

export interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string, organization?: string, role?: UserRole) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isDonor: boolean;
  isVolunteer: boolean;
  isLoggedIn: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  loading: boolean;
}
