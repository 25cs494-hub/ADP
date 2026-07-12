import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { useNotificationStore, formatTimeAgo } from '../../store/notifications';
import { useDataStore } from '../../store/data';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings, 
  User as UserIcon,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  const dataState = useDataStore();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll, 
    checkSmartAlerts,
    addNotification
  } = useNotificationStore();

  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initial theme check
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['Fleet Manager', 'Dispatcher'] },
    { name: 'Drivers', path: '/drivers', icon: Users, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { name: 'Trips', path: '/trips', icon: Map, roles: ['Fleet Manager', 'Dispatcher'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Fleet Manager', 'Safety Officer'] },
    { name: 'Fuel Management', path: '/fuel-management', icon: Fuel, roles: ['Fleet Manager', 'Financial Analyst'] },
    { name: 'Expenses', path: '/expenses', icon: DollarSign, roles: ['Fleet Manager', 'Financial Analyst'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['Fleet Manager', 'Financial Analyst'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Fleet Manager'] },
    { name: 'Profile', path: '/profile', icon: UserIcon, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  ];

  const allowedNavItems = navItems.filter(item => user?.role && item.roles.includes(user.role));

  // Run checkSmartAlerts whenever the data changes
  useEffect(() => {
    checkSmartAlerts(dataState);
  }, [dataState, checkSmartAlerts]);

  // Route Role Authorization Guard & unauthorized access attempt logging
  useEffect(() => {
    if (!user) return;
    const activeItem = navItems.find(item => item.path === pathname);
    if (activeItem && !activeItem.roles.includes(user.role)) {
      // Create security alert
      addNotification({
        title: 'Unauthorized Access Attempt',
        description: `User ${user.name} (${user.role}) attempted to access restricted page: ${activeItem.name} (${pathname}).`,
        category: 'error',
        roles: ['Fleet Manager'],
        priority: 'high'
      });
      
      // Redirect
      navigate('/dashboard');
      
      // Alert user
      toast.error(`Access Denied: You do not have permission to view ${activeItem.name}.`);
    }
  }, [pathname, user, navigate, addNotification]);

  const roleNotifications = notifications.filter(n => user?.role && n.roles.includes(user.role));
  const unreadCount = roleNotifications.filter(n => !n.read).length;
  const recentNotifications = [...roleNotifications]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'success':
        return 'bg-emerald-500/10 dark:bg-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 dark:bg-amber-500/20';
      case 'error':
        return 'bg-rose-500/10 dark:bg-rose-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 dark:bg-blue-500/20';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        transition-all duration-300 ease-in-out
        bg-white dark:bg-slate-900 border-r border-border
        flex flex-col z-20
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">TransitOps</span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex-shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg transition-colors group
                ${isActive 
                  ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                }
              `}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navigation */}
        <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-64 max-w-md hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Global Search..."
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 pl-9 border-none focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[340px] md:w-[400px] p-0 glass-card" align="end" forceMount>
                <div className="p-4 border-b border-border flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 font-bold">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-primary hover:bg-primary/10 px-2 py-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user?.role) markAllAsRead(user.role);
                        }}
                      >
                        Mark all as read
                      </Button>
                    )}
                    {roleNotifications.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 px-2 py-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user?.role) clearAll(user.role);
                        }}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto divide-y divide-border bg-white dark:bg-slate-900">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`flex items-start gap-3 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${!n.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getCategoryBg(n.category)}`}>
                          {getCategoryIcon(n.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-xs font-semibold text-slate-800 dark:text-slate-100 ${!n.read ? 'font-bold' : ''}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
                              {formatTimeAgo(n.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {!n.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                              }}
                              title="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No notifications found for {user?.role}.
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-border text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                  <Button
                    variant="ghost"
                    className="w-full text-xs font-semibold text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/notifications');
                    }}
                  >
                    View Notification History
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <div className="hidden sm:flex items-center gap-3 border-l border-border pl-4 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{user?.role}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <Badge variant="secondary" className="mt-2 w-fit text-xs">{user?.role}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
