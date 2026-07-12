import { create } from 'zustand';
import { toast } from 'sonner';
import type { Role } from './auth';

export type NotificationCategory = 'success' | 'warning' | 'error' | 'info';
export type Priority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO String
  read: boolean;
  category: NotificationCategory;
  roles: Role[]; // The roles authorized to view this notification
  priority: Priority;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (role: Role) => void;
  deleteNotification: (id: string) => void;
  clearAll: (role: Role) => void;
  checkSmartAlerts: (dataState: any) => void;
}

// Seed historical notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: 'n_seed_1',
    title: 'Fleet Manager Logged In',
    description: 'Successful login attempt from IP 192.168.1.102.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    read: false,
    category: 'success',
    roles: ['Fleet Manager'],
    priority: 'low'
  },
  {
    id: 'n_seed_2',
    title: 'Trip Dispatched',
    description: 'Trip t1 to Boston has been successfully dispatched with vehicle Scania R500.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5d ago
    read: true,
    category: 'info',
    roles: ['Dispatcher', 'Fleet Manager'],
    priority: 'medium'
  },
  {
    id: 'n_seed_3',
    title: 'Maintenance Completed',
    description: 'Maintenance service diagnostics completed for vehicle VN-2001.',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10d ago
    read: true,
    category: 'success',
    roles: ['Fleet Manager', 'Safety Officer'],
    priority: 'medium'
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,

  addNotification: (notification) => {
    const id = `n${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp,
      read: false
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));

    // Email notification simulation (Bonus Requirement)
    const isEmailTrigger = 
      notification.title.toLowerCase().includes('expiry') ||
      notification.title.toLowerCase().includes('expiration') ||
      notification.title.toLowerCase().includes('expired') ||
      notification.title.toLowerCase().includes('overdue') ||
      notification.title.toLowerCase().includes('budget') ||
      notification.title.toLowerCase().includes('exceeds') ||
      notification.title.toLowerCase().includes('limit') ||
      notification.title.toLowerCase().includes('unavailable') ||
      notification.title.toLowerCase().includes('capacity') ||
      notification.title.toLowerCase().includes('cost');

    if (isEmailTrigger) {
      const recipient = notification.roles.join(', ');
      setTimeout(() => {
        toast.info(`📧 Email alert sent to [${recipient}]: ${notification.title}`, {
          duration: 5000,
          description: notification.description
        });
      }, 300);
    }
  },

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),

  markAllAsRead: (role) => set((state) => ({
    notifications: state.notifications.map(n => n.roles.includes(role) ? { ...n, read: true } : n)
  })),

  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearAll: (role) => set((state) => ({
    notifications: state.notifications.filter(n => !n.roles.includes(role))
  })),

  checkSmartAlerts: (dataState) => {
    const { drivers, maintenanceLogs, fuelLogs, expenses } = dataState;
    const now = new Date();
    const store = get();
    const triggered: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [];

    // 1. Driver License expiration alerts
    drivers.forEach((driver: any) => {
      const expiry = new Date(driver.licenseExpiry);
      const diffMs = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      const titleExpired = `License Expired: ${driver.name}`;
      const title30d = `License Expiration Warning: ${driver.name}`;
      const title7d = `License Expiration Critical: ${driver.name}`;

      if (diffDays <= 0) {
        // Excluded already created alerts
        if (!store.notifications.some(n => n.title === titleExpired)) {
          triggered.push({
            title: titleExpired,
            description: `Driver ${driver.name}'s license ${driver.licenseNumber} CE expired on ${driver.licenseExpiry}. Please suspend driver.`,
            category: 'error',
            roles: ['Safety Officer', 'Fleet Manager'],
            priority: 'high'
          });
        }
      } else if (diffDays <= 7) {
        if (!store.notifications.some(n => n.title === title7d)) {
          triggered.push({
            title: title7d,
            description: `Driver ${driver.name}'s license ${driver.licenseNumber} CE expires in ${diffDays} days (${driver.licenseExpiry}).`,
            category: 'warning',
            roles: ['Safety Officer', 'Fleet Manager'],
            priority: 'high'
          });
        }
      } else if (diffDays <= 30) {
        if (!store.notifications.some(n => n.title === title30d)) {
          triggered.push({
            title: title30d,
            description: `Driver ${driver.name}'s license ${driver.licenseNumber} CE expires in ${diffDays} days (${driver.licenseExpiry}).`,
            category: 'warning',
            roles: ['Safety Officer', 'Fleet Manager'],
            priority: 'medium'
          });
        }
      }
    });

    // 2. Overdue Maintenance alerts
    maintenanceLogs.forEach((log: any) => {
      if (log.status === 'Open' || log.status === 'In Progress') {
        const logDate = new Date(log.date);
        const diffMs = now.getTime() - logDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const title = `Overdue Maintenance: Vehicle ${log.vehicleId}`;
        
        if (diffDays > 5 && !store.notifications.some(n => n.title === title)) {
          triggered.push({
            title,
            description: `Scheduled maintenance for vehicle ${log.vehicleId} (${log.serviceType} - ${log.issue}) is overdue by ${diffDays} days.`,
            category: 'error',
            roles: ['Fleet Manager', 'Safety Officer'],
            priority: 'high'
          });
        }
      }
    });

    // 3. Monthly Fuel Budget Exceeded alert
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const totalFuelCostThisMonth = fuelLogs.filter((log: any) => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    }).reduce((sum: number, log: any) => sum + log.cost, 0);

    const fuelBudgetTitle = `Monthly Fuel Budget Exceeded`;
    if (totalFuelCostThisMonth > 1500 && !store.notifications.some(n => n.title === fuelBudgetTitle)) {
      triggered.push({
        title: fuelBudgetTitle,
        description: `Total fuel expense of $${totalFuelCostThisMonth.toFixed(2)} this month exceeds the allocated budget of $1,500.00.`,
        category: 'error',
        roles: ['Financial Analyst', 'Fleet Manager'],
        priority: 'high'
      });
    }

    // 4. Monthly Operational Expenses Over budget alert
    const totalExpensesThisMonth = expenses.filter((exp: any) => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }).reduce((sum: number, exp: any) => sum + exp.amount, 0);

    const expenseBudgetTitle = `Operational Budget Exceeded`;
    if (totalExpensesThisMonth > 5000 && !store.notifications.some(n => n.title === expenseBudgetTitle)) {
      triggered.push({
        title: expenseBudgetTitle,
        description: `Total operational expenses of $${totalExpensesThisMonth.toFixed(2)} this month exceed the budget threshold of $5,000.00.`,
        category: 'error',
        roles: ['Financial Analyst', 'Fleet Manager'],
        priority: 'high'
      });
    }

    // Add any triggered smart alerts
    if (triggered.length > 0) {
      triggered.forEach(alert => store.addNotification(alert));
    }
  }
}));

// Relative timestamp helper function
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
