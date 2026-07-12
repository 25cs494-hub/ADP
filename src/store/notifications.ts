import { create } from 'zustand';
import { toast } from 'sonner';

export type NotificationCategory = 'Vehicle' | 'Driver' | 'Trip' | 'Maintenance' | 'Fuel & Expenses' | 'System';
export type NotificationType = 'Success' | 'Warning' | 'Error' | 'Info';
export type NotificationPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Notification {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  timestamp: string; // ISO string
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  isDrawerOpen: boolean;
  bellShaking: boolean;
  toggleDrawer: (open?: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  spawnMockNotification: () => void;
  setBellShaking: (shaking: boolean) => void;
}

// Simple timeAgo utility to display relative times dynamically
export const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay}d ago`;
};

// 22 Pre-populated realistic transport notifications
const initialNotifications = (): Notification[] => {
  const baseTime = new Date().getTime();
  const mins = 60 * 1000;
  const hrs = 60 * mins;
  const days = 24 * hrs;

  return [
    {
      id: 'n1',
      category: 'Vehicle',
      type: 'Success',
      priority: 'Low',
      title: 'Vehicle Dispatched Successfully',
      description: 'Volvo FH16 (TR-1001) has been dispatched for Trip #t3 from Los Angeles to Las Vegas.',
      timestamp: new Date(baseTime - 3 * mins).toISOString(),
      read: false,
    },
    {
      id: 'n2',
      category: 'Driver',
      type: 'Warning',
      priority: 'High',
      title: 'Driver License Expiring Soon',
      description: 'Driver David Miller\'s CE class license will expire in 28 days on 2026-08-15.',
      timestamp: new Date(baseTime - 12 * mins).toISOString(),
      read: false,
    },
    {
      id: 'n3',
      category: 'Trip',
      type: 'Error',
      priority: 'Critical',
      title: 'Cargo Weight Exceeded Limit',
      description: 'Trip to Boston cancelled because cargo weight (38,000 lbs) exceeds Scania R500 capacity.',
      timestamp: new Date(baseTime - 25 * mins).toISOString(),
      read: false,
    },
    {
      id: 'n4',
      category: 'Maintenance',
      type: 'Info',
      priority: 'Medium',
      title: 'Maintenance Inspection Scheduled',
      description: 'Ford F-550 (TR-1003) is scheduled for Brake Pads Replacement on 2026-07-15.',
      timestamp: new Date(baseTime - 1.5 * hrs).toISOString(),
      read: false,
    },
    {
      id: 'n5',
      category: 'Fuel & Expenses',
      type: 'Success',
      priority: 'Low',
      title: 'Fuel Log Registered',
      description: 'Fuel log of 284 Liters recorded for Kenworth T680 (TR-1005) at Loves Travel Stop.',
      timestamp: new Date(baseTime - 2 * hrs).toISOString(),
      read: false,
    },
    {
      id: 'n6',
      category: 'System',
      type: 'Success',
      priority: 'Low',
      title: 'User Profile Updated',
      description: 'Alice Admin\'s contact details and email address updated successfully.',
      timestamp: new Date(baseTime - 4 * hrs).toISOString(),
      read: true,
    },
    {
      id: 'n7',
      category: 'Trip',
      type: 'Success',
      priority: 'Medium',
      title: 'Trip Completed Successfully',
      description: 'Trip #t2 (Chicago to Detroit) completed. Driver John Doe and Volvo FH16 are now Available.',
      timestamp: new Date(baseTime - 6 * hrs).toISOString(),
      read: true,
    },
    {
      id: 'n8',
      category: 'Driver',
      type: 'Error',
      priority: 'Critical',
      title: 'Driver License Suspended',
      description: 'Driver Mike Johnson suspended from dispatch queue due to critical safety compliance violation.',
      timestamp: new Date(baseTime - 8 * hrs).toISOString(),
      read: false,
    },
    {
      id: 'n9',
      category: 'Vehicle',
      type: 'Info',
      priority: 'Low',
      title: 'Vehicle Moved to Shop',
      description: 'Mercedes Sprinter (VN-2001) moved to In Shop status for HVAC Diagnostics.',
      timestamp: new Date(baseTime - 12 * hrs).toISOString(),
      read: true,
    },
    {
      id: 'n10',
      category: 'System',
      type: 'Warning',
      priority: 'High',
      title: 'Failed Login Detected',
      description: 'Unusual failed login attempt detected on manager account from IP 198.51.100.77.',
      timestamp: new Date(baseTime - 1 * days).toISOString(),
      read: true,
    },
    {
      id: 'n11',
      category: 'Fuel & Expenses',
      type: 'Info',
      priority: 'Medium',
      title: 'Monthly Fuel Efficiency Calculated',
      description: 'Fleet fuel efficiency report generated. Average MPG increased by 4.2% across heavy units.',
      timestamp: new Date(baseTime - 1.2 * days).toISOString(),
      read: true,
    },
    {
      id: 'n12',
      category: 'Maintenance',
      type: 'Success',
      priority: 'Medium',
      title: 'Scheduled Oil Change Completed',
      description: 'Maintenance completed for Scania R500 (TR-1002). Vehicle returned to active service.',
      timestamp: new Date(baseTime - 1.8 * days).toISOString(),
      read: true,
    },
    {
      id: 'n13',
      category: 'Trip',
      type: 'Info',
      priority: 'Low',
      title: 'Draft Trip Scheduled',
      description: 'Trip draft #t12 created: New York, NY to Washington, DC. Estimated load: 2,800 lbs.',
      timestamp: new Date(baseTime - 2 * days).toISOString(),
      read: true,
    },
    {
      id: 'n14',
      category: 'Driver',
      type: 'Info',
      priority: 'Low',
      title: 'Driver Assigned to Fleet Unit',
      description: 'Driver Robert Chen assigned to active unit Kenworth T680.',
      timestamp: new Date(baseTime - 2.2 * days).toISOString(),
      read: true,
    },
    {
      id: 'n15',
      category: 'Vehicle',
      type: 'Info',
      priority: 'Low',
      title: 'Vehicle Retired from Duty',
      description: 'Chevrolet Express (VN-2003) retired due to acquisition cost amortization limits.',
      timestamp: new Date(baseTime - 2.8 * days).toISOString(),
      read: true,
    },
    {
      id: 'n16',
      category: 'Fuel & Expenses',
      type: 'Warning',
      priority: 'High',
      title: 'High Unscheduled Cost Logged',
      description: 'Maintenance expense of $1,400 recorded for VN-2003 Transmission replacement.',
      timestamp: new Date(baseTime - 3 * days).toISOString(),
      read: true,
    },
    {
      id: 'n17',
      category: 'System',
      type: 'Info',
      priority: 'Low',
      title: 'Security Password Changed',
      description: 'Alice Admin password successfully updated from browser settings page.',
      timestamp: new Date(baseTime - 3.5 * days).toISOString(),
      read: true,
    },
    {
      id: 'n18',
      category: 'Trip',
      type: 'Error',
      priority: 'High',
      title: 'Dispatch Wizard Fail',
      description: 'Dispatch failed because assigned driver Mike Johnson is in Suspended status.',
      timestamp: new Date(baseTime - 4 * days).toISOString(),
      read: true,
    },
    {
      id: 'n19',
      category: 'Driver',
      type: 'Error',
      priority: 'Critical',
      title: 'Driver License Expired',
      description: 'Driver James Wilson\'s CE class operator license has expired (Expired: 2024-06-12).',
      timestamp: new Date(baseTime - 4.5 * days).toISOString(),
      read: true,
    },
    {
      id: 'n20',
      category: 'System',
      type: 'Success',
      priority: 'Low',
      title: 'Database Snapshot Compiled',
      description: 'TransitOps daily backup completed successfully. Archive snapshot saved to secure cloud.',
      timestamp: new Date(baseTime - 5 * days).toISOString(),
      read: true,
    },
    {
      id: 'n21',
      category: 'Vehicle',
      type: 'Success',
      priority: 'Low',
      title: 'Registration Node Added',
      description: 'New vehicle record added for Ford F-550 (TR-1003). Initial odometer set to 62,000 km.',
      timestamp: new Date(baseTime - 5.5 * days).toISOString(),
      read: true,
    },
    {
      id: 'n22',
      category: 'Trip',
      type: 'Warning',
      priority: 'High',
      title: 'Trip Cancelled: Weather Alert',
      description: 'Trip #t12 cancelled because of regional storm warnings along East Coast corridor.',
      timestamp: new Date(baseTime - 6 * days).toISOString(),
      read: true,
    }
  ];
};

// Spawning templates for random simulation
const mockAlertTemplates = [
  {
    category: 'Vehicle',
    type: 'Error',
    priority: 'Critical',
    title: 'High Engine Temperature Alert',
    description: 'Critical cooling warning on Volvo FH16 (TR-1001). Coolant levels dropping rapidly.',
  },
  {
    category: 'Driver',
    type: 'Info',
    priority: 'Low',
    title: 'Driver Shift Check-In',
    description: 'Driver Jane Smith has checked in for her assigned morning route.',
  },
  {
    category: 'Trip',
    type: 'Success',
    priority: 'Medium',
    title: 'Trip Dispatched and En Route',
    description: 'Trip #t10 Chicago to Minneapolis has successfully departed. ETA: 2026-07-13.',
  },
  {
    category: 'Maintenance',
    type: 'Warning',
    priority: 'High',
    title: 'Brake Wear Diagnostic Warning',
    description: 'Scania R500 brake pads wear sensor triggered. Schedule maintenance service.',
  },
  {
    category: 'Fuel & Expenses',
    type: 'Error',
    priority: 'Critical',
    title: 'Unusual Fuel Drop Detected',
    description: 'Sudden fuel level drop of 45 L detected in Kenworth T680 (VN-1005) near mile marker 45.',
  },
  {
    category: 'System',
    type: 'Warning',
    priority: 'High',
    title: 'New Session Login Attempt',
    description: 'New session initiated on macOS / Chrome from Los Angeles, CA. Verify if unauthorized.',
  },
  {
    category: 'Driver',
    type: 'Success',
    priority: 'Low',
    title: 'Driver Background Checks Complete',
    description: 'Onboarding completed for Emily Davis. License CE verification succeeded.',
  },
  {
    category: 'Maintenance',
    type: 'Warning',
    priority: 'Medium',
    title: 'Odometer Check Overdue',
    description: 'VN-2002 Ram ProMaster is overdue for maintenance cycle check by 1,450 km.',
  }
] as const;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications(),
  isDrawerOpen: false,
  bellShaking: false,

  toggleDrawer: (open) => {
    set((state) => ({ isDrawerOpen: open !== undefined ? open : !state.isDrawerOpen }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    toast.success('All notifications marked as read.');
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    toast.info('Notification deleted.');
  },

  clearAll: () => {
    set({ notifications: [] });
    toast.error('Notification tray cleared.');
  },

  addNotification: (noti) => {
    const newNoti: Notification = {
      ...noti,
      id: `n_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNoti, ...state.notifications],
      bellShaking: true,
    }));

    // Trigger visual toast
    if (newNoti.priority === 'Critical') {
      toast.error(`CRITICAL: ${newNoti.title} - ${newNoti.description}`, { duration: 6000 });
    } else if (newNoti.priority === 'High' || newNoti.type === 'Warning') {
      toast.warning(`${newNoti.title}: ${newNoti.description}`);
    } else if (newNoti.type === 'Success') {
      toast.success(`${newNoti.title}: ${newNoti.description}`);
    } else {
      toast.info(`${newNoti.title}: ${newNoti.description}`);
    }

    // Try playing a mock notification sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5 note
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context blocked or not supported - ignore silently
    }
  },

  spawnMockNotification: () => {
    const randomIndex = Math.floor(Math.random() * mockAlertTemplates.length);
    const template = mockAlertTemplates[randomIndex];
    get().addNotification(template);
  },

  setBellShaking: (shaking) => {
    set({ bellShaking: shaking });
  },
}));
