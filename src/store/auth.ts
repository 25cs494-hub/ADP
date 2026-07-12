import { create } from 'zustand';

export type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst' | 'Driver' | 'Admin';

export interface UserSecurity {
  passwordStatus: 'Strong' | 'Medium' | 'Weak';
  lastPasswordChanged: string;
  twoFactorEnabled: boolean;
  loginHistory: Array<{ activity: string; date: string; time: string; status: string; device: string; ip: string }>;
  activeSessions: Array<{ device: string; location: string; ip: string; status: string }>;
}

export interface UserNotificationPreferences {
  emailNotifications: boolean;
  maintenanceAlerts: boolean;
  tripNotifications: boolean;
  driverLicenseExpiryAlerts: boolean;
  weeklyReports: boolean;
  monthlyAnalyticsReport: boolean;
}

export interface UserSettings {
  darkMode: boolean;
  language: string;
  timeZone: string;
  dateFormat: string;
}

export interface UserActivity {
  id: string;
  activity: string;
  date: string;
  time: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Success';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  employeeId: string;
  phoneNumber: string;
  department: string;
  joinedDate: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  security: UserSecurity;
  notificationPreferences: UserNotificationPreferences;
  settings: UserSettings;
  activities: UserActivity[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Omit<User, 'id' | 'email' | 'role' | 'employeeId' | 'joinedDate'>>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  toggle2FA: () => void;
  logoutAllDevices: () => void;
  updateNotificationPreferences: (prefs: Partial<UserNotificationPreferences>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

const defaultSecurity = (_roleName: string): UserSecurity => ({
  passwordStatus: 'Strong',
  lastPasswordChanged: '2026-05-10',
  twoFactorEnabled: false,
  loginHistory: [
    { activity: 'Logged into the system', date: '2026-07-12', time: '09:30 AM', status: 'Success', device: 'Chrome / Windows Desktop', ip: '192.168.1.45' },
    { activity: 'Logged into the system', date: '2026-07-11', time: '08:15 AM', status: 'Success', device: 'Chrome / Windows Desktop', ip: '192.168.1.45' },
    { activity: 'Logged into the system', date: '2026-07-10', time: '11:20 AM', status: 'Success', device: 'Safari / iPhone 15', ip: '72.14.213.12' },
    { activity: 'Logged into the system', date: '2026-07-09', time: '09:05 AM', status: 'Success', device: 'Chrome / Windows Desktop', ip: '192.168.1.45' },
    { activity: 'Login Failed (Invalid Password)', date: '2026-07-09', time: '09:03 AM', status: 'Failed', device: 'Chrome / Windows Desktop', ip: '192.168.1.45' }
  ],
  activeSessions: [
    { device: 'Chrome / Windows Desktop (Current Session)', location: 'Chicago, IL', ip: '192.168.1.45', status: 'Active' },
    { device: 'Safari / iPhone 15', location: 'Chicago, IL', ip: '72.14.213.12', status: 'Active' }
  ]
});

const defaultNotificationPreferences = (roleName: string): UserNotificationPreferences => ({
  emailNotifications: true,
  maintenanceAlerts: ['Fleet Manager', 'Safety Officer', 'Admin'].includes(roleName),
  tripNotifications: ['Fleet Manager', 'Dispatcher', 'Driver', 'Admin'].includes(roleName),
  driverLicenseExpiryAlerts: ['Fleet Manager', 'Safety Officer', 'Admin'].includes(roleName),
  weeklyReports: ['Fleet Manager', 'Financial Analyst', 'Admin'].includes(roleName),
  monthlyAnalyticsReport: ['Fleet Manager', 'Financial Analyst', 'Admin'].includes(roleName)
});

const defaultSettings = (): UserSettings => ({
  darkMode: false,
  language: 'en',
  timeZone: 'America/Chicago',
  dateFormat: 'YYYY-MM-DD'
});

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Admin',
    email: 'manager@transitops.com',
    role: 'Fleet Manager',
    employeeId: 'EMP-1001',
    phoneNumber: '555-019-2834',
    department: 'Fleet Operations',
    joinedDate: '2024-03-15',
    lastLogin: '2026-07-12 09:30 AM',
    status: 'Active',
    address: '123 Logistics Blvd Suite 400',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    postalCode: '60601',
    emergencyContactName: 'John Admin',
    emergencyContactNumber: '555-019-9988',
    security: defaultSecurity('Fleet Manager'),
    notificationPreferences: defaultNotificationPreferences('Fleet Manager'),
    settings: defaultSettings(),
    activities: [
      { id: 'act-1', activity: 'Logged into the system', date: '2026-07-12', time: '09:30 AM', status: 'Success' },
      { id: 'act-2', activity: 'Updated vehicle details for TR-1002', date: '2026-07-12', time: '10:15 AM', status: 'Success' },
      { id: 'act-3', activity: 'Created trip to Boston (t1)', date: '2026-07-11', time: '11:00 AM', status: 'Success' },
      { id: 'act-4', activity: 'Completed scheduled maintenance on vehicle v3', date: '2026-07-11', time: '04:30 PM', status: 'Success' },
      { id: 'act-5', activity: 'Exported Fleet Utilization CSV Report', date: '2026-07-10', time: '02:15 PM', status: 'Success' }
    ]
  },
  {
    id: '2',
    name: 'Bob Dispatcher',
    email: 'dispatch@transitops.com',
    role: 'Dispatcher',
    employeeId: 'EMP-1002',
    phoneNumber: '555-019-5566',
    department: 'Logistics & Dispatch',
    joinedDate: '2024-06-10',
    lastLogin: '2026-07-12 09:12 AM',
    status: 'Active',
    address: '456 Route Ave',
    city: 'Indianapolis',
    state: 'IN',
    country: 'United States',
    postalCode: '46201',
    emergencyContactName: 'Sarah Dispatcher',
    emergencyContactNumber: '555-019-8877',
    security: defaultSecurity('Dispatcher'),
    notificationPreferences: defaultNotificationPreferences('Dispatcher'),
    settings: defaultSettings(),
    activities: [
      { id: 'act-1', activity: 'Logged into the system', date: '2026-07-12', time: '09:12 AM', status: 'Success' },
      { id: 'act-2', activity: 'Dispatched trip to Detroit (t2)', date: '2026-07-12', time: '10:30 AM', status: 'Success' },
      { id: 'act-3', activity: 'Assigned Driver Jane Smith to Scania R500', date: '2026-07-12', time: '10:45 AM', status: 'Success' },
      { id: 'act-4', activity: 'Logged out of mobile session', date: '2026-07-11', time: '07:15 PM', status: 'Success' }
    ]
  },
  {
    id: '3',
    name: 'Charlie Safety',
    email: 'safety@transitops.com',
    role: 'Safety Officer',
    employeeId: 'EMP-1003',
    phoneNumber: '555-019-1122',
    department: 'Safety & Compliance',
    joinedDate: '2024-09-01',
    lastLogin: '2026-07-12 08:45 AM',
    status: 'Active',
    address: '789 Compliance Way',
    city: 'Springfield',
    state: 'IL',
    country: 'United States',
    postalCode: '62701',
    emergencyContactName: 'Nate Safety',
    emergencyContactNumber: '555-019-2233',
    security: defaultSecurity('Safety Officer'),
    notificationPreferences: defaultNotificationPreferences('Safety Officer'),
    settings: defaultSettings(),
    activities: [
      { id: 'act-1', activity: 'Logged into the system', date: '2026-07-12', time: '08:45 AM', status: 'Success' },
      { id: 'act-2', activity: 'Suspended Driver Mike Johnson due to safety audit', date: '2026-07-12', time: '09:15 AM', status: 'Success' },
      { id: 'act-3', activity: 'Reviewed license expiry reports', date: '2026-07-11', time: '11:30 AM', status: 'Success' }
    ]
  },
  {
    id: '4',
    name: 'Diana Finance',
    email: 'finance@transitops.com',
    role: 'Financial Analyst',
    employeeId: 'EMP-1004',
    phoneNumber: '555-019-3344',
    department: 'Financial Operations',
    joinedDate: '2025-01-20',
    lastLogin: '2026-07-12 09:00 AM',
    status: 'Active',
    address: '321 Ledger Ln',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10005',
    emergencyContactName: 'Arthur Finance',
    emergencyContactNumber: '555-019-4455',
    security: defaultSecurity('Financial Analyst'),
    notificationPreferences: defaultNotificationPreferences('Financial Analyst'),
    settings: defaultSettings(),
    activities: [
      { id: 'act-1', activity: 'Logged into the system', date: '2026-07-12', time: '09:00 AM', status: 'Success' },
      { id: 'act-2', activity: 'Approved fuel log reimbursement for driver d1', date: '2026-07-12', time: '10:00 AM', status: 'Success' },
      { id: 'act-3', activity: 'Reviewed operational cost report for June 2026', date: '2026-07-11', time: '03:15 PM', status: 'Success' }
    ]
  },
  {
    id: '5',
    name: 'John Doe',
    email: 'driver@transitops.com',
    role: 'Driver',
    employeeId: 'EMP-1005',
    phoneNumber: '555-0101',
    department: 'Logistics - Drivers',
    joinedDate: '2025-02-15',
    lastLogin: '2026-07-12 07:00 AM',
    status: 'Active',
    address: '88 Odometer Rd',
    city: 'Detroit',
    state: 'MI',
    country: 'United States',
    postalCode: '48201',
    emergencyContactName: 'Jane Doe',
    emergencyContactNumber: '555-0102',
    security: defaultSecurity('Driver'),
    notificationPreferences: defaultNotificationPreferences('Driver'),
    settings: defaultSettings(),
    activities: [
      { id: 'act-1', activity: 'Logged into the system via Driver App', date: '2026-07-12', time: '07:00 AM', status: 'Success' },
      { id: 'act-2', activity: 'Completed trip t8 from Denver to Salt Lake City', date: '2026-07-11', time: '05:00 PM', status: 'Success' },
      { id: 'act-3', activity: 'Logged fuel fill-up of 227 L at Pilot Station', date: '2026-07-10', time: '11:30 AM', status: 'Success' }
    ]
  },
  {
    id: '6',
    name: 'System Admin',
    email: 'admin@transitops.com',
    role: 'Admin',
    employeeId: 'EMP-0001',
    phoneNumber: '555-019-9999',
    department: 'IT Administration',
    joinedDate: '2023-10-01',
    lastLogin: '2026-07-12 08:00 AM',
    status: 'Active',
    address: '1 System Root Way',
    city: 'San Jose',
    state: 'CA',
    country: 'United States',
    postalCode: '95101',
    emergencyContactName: 'Sys Emergency',
    emergencyContactNumber: '555-019-0000',
    security: defaultSecurity('Admin'),
    notificationPreferences: defaultNotificationPreferences('Admin'),
    settings: defaultSettings(),
    activities: [
      { id: 'act-1', activity: 'Logged into the admin console', date: '2026-07-12', time: '08:00 AM', status: 'Success' },
      { id: 'act-2', activity: 'Backed up database system', date: '2026-07-12', time: '08:30 AM', status: 'Success' },
      { id: 'act-3', activity: 'Updated security configurations and CORS policy', date: '2026-07-11', time: '02:00 PM', status: 'Success' }
    ]
  }
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, _password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    // Accept any password for mock demo, just check email
    if (foundUser) {
      set({ user: foundUser, isAuthenticated: true });
    } else {
      throw new Error('Invalid credentials. Try manager@transitops.com');
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  
  updateProfile: (data) => set((state) => {
    if (!state.user) return state;
    return {
      user: {
        ...state.user,
        ...data,
      } as User
    };
  }),

  changePassword: async (_oldPass, newPass) => {
    // Mock validation
    if (newPass.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(newPass)) {
      throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!/[0-9]/.test(newPass)) {
      throw new Error('Password must contain at least one digit.');
    }
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          security: {
            ...state.user.security,
            passwordStatus: 'Strong',
            lastPasswordChanged: new Date().toISOString().split('T')[0],
            loginHistory: [
              {
                activity: 'Password Changed',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Success',
                device: 'Chrome / Windows Desktop (Current)',
                ip: '192.168.1.45'
              },
              ...state.user.security.loginHistory.slice(0, 4)
            ]
          }
        }
      };
    });
  },

  toggle2FA: () => set((state) => {
    if (!state.user) return state;
    const isEnabled = !state.user.security.twoFactorEnabled;
    return {
      user: {
        ...state.user,
        security: {
          ...state.user.security,
          twoFactorEnabled: isEnabled,
          loginHistory: [
            {
              activity: isEnabled ? 'Enabled 2FA' : 'Disabled 2FA',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'Success',
              device: 'Chrome / Windows Desktop (Current)',
              ip: '192.168.1.45'
            },
            ...state.user.security.loginHistory.slice(0, 4)
          ]
        }
      }
    };
  }),

  logoutAllDevices: () => set((state) => {
    if (!state.user) return state;
    return {
      user: {
        ...state.user,
        security: {
          ...state.user.security,
          activeSessions: state.user.security.activeSessions.filter(s => s.device.includes('(Current Session)')),
          loginHistory: [
            {
              activity: 'Logged out other devices',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'Success',
              device: 'Chrome / Windows Desktop (Current)',
              ip: '192.168.1.45'
            },
            ...state.user.security.loginHistory.slice(0, 4)
          ]
        }
      }
    };
  }),

  updateNotificationPreferences: (prefs) => set((state) => {
    if (!state.user) return state;
    return {
      user: {
        ...state.user,
        notificationPreferences: {
          ...state.user.notificationPreferences,
          ...prefs
        }
      }
    };
  }),

  updateSettings: (settings) => set((state) => {
    if (!state.user) return state;
    if (settings.darkMode !== undefined) {
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return {
      user: {
        ...state.user,
        settings: {
          ...state.user.settings,
          ...settings
        }
      }
    };
  })
}));
