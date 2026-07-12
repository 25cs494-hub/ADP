import { useState, useMemo } from 'react';
import { useNotificationStore, formatTimeAgo } from '../store/notifications';
import { useAuthStore } from '../store/auth';
import type { NotificationCategory, Priority } from '../store/notifications';
import type { Role } from '../store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bell, Search, Check, Trash2, CheckCircle2, AlertTriangle, 
  AlertCircle, Info, Shield, Trash, FilterX, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const { user } = useAuthStore();
  const { 
    notifications, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAll 
  } = useNotificationStore();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, read, unread
  const [selectedDate, setSelectedDate] = useState<string>('all'); // all, today, yesterday, week
  const [selectedTargetRole, setSelectedTargetRole] = useState<string>('all'); // all, or specific roles (only managers filter this)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. Filter notifications based on role access (security constraint)
  const roleFilteredNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.roles.includes(user.role));
  }, [notifications, user]);

  // 2. Apply UI-specified filters
  const processedNotifications = useMemo(() => {
    return roleFilteredNotifications.filter(n => {
      // Search text filter
      const matchesSearch = 
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;

      // Priority filter
      const matchesPriority = selectedPriority === 'all' || n.priority === selectedPriority;

      // Read status filter
      const matchesStatus = 
        selectedStatus === 'all' || 
        (selectedStatus === 'read' && n.read) || 
        (selectedStatus === 'unread' && !n.read);

      // Target role filter (Only for Fleet Managers to view what other roles see)
      const matchesTargetRole = 
        selectedTargetRole === 'all' || 
        n.roles.includes(selectedTargetRole as Role);

      // Date range filter
      let matchesDate = true;
      if (selectedDate !== 'all') {
        const date = new Date(n.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (selectedDate === 'today') {
          // Calendar today
          matchesDate = date.toDateString() === now.toDateString();
        } else if (selectedDate === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          matchesDate = date.toDateString() === yesterday.toDateString();
        } else if (selectedDate === 'week') {
          matchesDate = diffDays <= 7;
        }
      }

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesTargetRole && matchesDate;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [roleFilteredNotifications, search, selectedCategory, selectedPriority, selectedStatus, selectedTargetRole, selectedDate]);

  // Handle selection toggles
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === processedNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedNotifications.map(n => n.id));
    }
  };

  // Bulk Actions
  const handleBulkMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteNotification(id));
    setSelectedIds([]);
  };

  const handleMarkAllRead = () => {
    if (user?.role) {
      markAllAsRead(user.role);
    }
  };

  const handleClearAll = () => {
    if (user?.role) {
      clearAll(user.role);
    }
  };

  // Icon / color helpers
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryColorStyles = (category: NotificationCategory) => {
    switch (category) {
      case 'success': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'warning': return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
      case 'error': return 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedDate('all');
    setSelectedTargetRole('all');
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary animate-pulse" />
            Notification Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse, filter, and audit alerts generated across your transit infrastructure.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {roleFilteredNotifications.some(n => !n.read) && (
            <Button variant="outline" className="shadow-sm font-semibold" onClick={handleMarkAllRead}>
              <Check className="w-4 h-4 mr-2" /> Mark All Read
            </Button>
          )}
          {roleFilteredNotifications.length > 0 && (
            <Button variant="destructive" className="shadow-sm font-semibold" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-bold text-sm tracking-tight">Filter Alerts</span>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-8 text-muted-foreground hover:text-primary">
                <FilterX className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
            </div>
            <CardContent className="p-4 space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full flex h-9 items-center justify-between rounded-lg border border-input bg-slate-50/50 dark:bg-slate-900/50 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <option value="all">All Categories</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Information</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                  className="w-full flex h-9 items-center justify-between rounded-lg border border-input bg-slate-50/50 dark:bg-slate-900/50 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full flex h-9 items-center justify-between rounded-lg border border-input bg-slate-50/50 dark:bg-slate-900/50 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <option value="all">Read & Unread</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Date Range</label>
                <select
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full flex h-9 items-center justify-between rounded-lg border border-input bg-slate-50/50 dark:bg-slate-900/50 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>

              {/* Target Role (Only visible to Fleet Managers) */}
              {user?.role === 'Fleet Manager' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target User Role</label>
                  <select
                    value={selectedTargetRole}
                    onChange={e => setSelectedTargetRole(e.target.value)}
                    className="w-full flex h-9 items-center justify-between rounded-lg border border-input bg-slate-50/50 dark:bg-slate-900/50 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <option value="all">All User Roles</option>
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications History List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search alert title or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
              />
            </div>
            
            {/* Bulk Selection Operations */}
            {processedNotifications.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll} 
                  className="text-xs font-semibold"
                >
                  {selectedIds.length === processedNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                {selectedIds.length > 0 && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkMarkRead} 
                      className="text-xs text-primary font-semibold hover:bg-primary/10 border-primary/20"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark Read ({selectedIds.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkDelete} 
                      className="text-xs text-rose-600 font-semibold hover:bg-rose-500/10 border-rose-500/20"
                    >
                      <Trash className="w-3.5 h-3.5 mr-1" /> Delete ({selectedIds.length})
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* List display */}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {processedNotifications.length > 0 ? (
                processedNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all relative overflow-hidden ${
                      !n.read 
                        ? 'bg-white dark:bg-slate-900 shadow-md border-l-4 border-l-primary border-slate-200 dark:border-slate-800' 
                        : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50'
                    }`}
                  >
                    {/* Checkbox select */}
                    <div className="flex items-center h-6 flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(n.id)}
                        onChange={() => handleToggleSelect(n.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>

                    {/* Category Icon */}
                    <div className={`p-2.5 rounded-lg flex-shrink-0 mt-0.5 ${getCategoryColorStyles(n.category)}`}>
                      {getCategoryIcon(n.category)}
                    </div>

                    {/* Notification Info */}
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 ${!n.read ? 'font-bold text-slate-900 dark:text-white' : ''}`}>
                          {n.title}
                        </h3>
                        <Badge className={`text-[10px] uppercase font-bold px-1.5 py-0.5 ${getPriorityColor(n.priority)}`} variant="outline">
                          {n.priority}
                        </Badge>
                        {!n.read && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold px-1.5 py-0 animate-pulse">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {n.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeAgo(n.timestamp)} ({new Date(n.timestamp).toLocaleString()})
                        </span>
                        <span className="flex items-center gap-1 uppercase tracking-wider text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          <Shield className="w-3 h-3 text-slate-400" />
                          {n.roles.join(' | ')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-3 top-3 flex items-center gap-1.5">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white"
                          onClick={() => markAsRead(n.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600"
                        onClick={() => deleteNotification(n.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-24 text-center glass-card border-dashed">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">No alerts found</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                    Try adjusting your filters or search query to find specific system notifications.
                  </p>
                  <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
