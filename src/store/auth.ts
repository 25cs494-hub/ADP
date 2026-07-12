import { create } from 'zustand';

export type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Admin', email: 'manager@transitops.com', role: 'Fleet Manager' },
  { id: '2', name: 'Bob Dispatcher', email: 'dispatch@transitops.com', role: 'Dispatcher' },
  { id: '3', name: 'Charlie Safety', email: 'safety@transitops.com', role: 'Safety Officer' },
  { id: '4', name: 'Diana Finance', email: 'finance@transitops.com', role: 'Financial Analyst' },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, _password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find((u) => u.email === email);
    
    // Accept any password for mock demo, just check email
    if (foundUser) {
      set({ user: foundUser, isAuthenticated: true });
    } else {
      throw new Error('Invalid credentials. Try manager@transitops.com');
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
