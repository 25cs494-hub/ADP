import { useState, useMemo } from 'react';
import { useNotificationStore } from '../../store/notifications';
import type { NotificationCategory, NotificationPriority } from '../../store/notifications';
import { formatTimeAgo } from '../../store/notifications';
import { 
  X, Check, Trash2, Search, ArrowUpDown, Truck, Users, Map, 
  Wrench, Fuel, Shield, Info, BellRing, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationDrawer() {
  const { 
    notifications, 
    isDrawerOpen, 
    toggleDrawer, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    spawnMockNotification
  } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Close helper
  const handleClose = () => toggleDrawer(false);

  // Clear all helper with double-click confirm
  const handleClearAll = () => {
    if (confirmClear) {
      clearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  // Get total counts per category tab
  const getFilterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: notifications.length,
      Unread: notifications.filter(n => !n.read).length,
      'High Priority': notifications.filter(n => n.priority === 'High' || n.priority === 'Critical').length,
      Vehicle: notifications.filter(n => n.category === 'Vehicle').length,
      Driver: notifications.filter(n => n.category === 'Driver').length,
      Trip: notifications.filter(n => n.category === 'Trip').length,
      Maintenance: notifications.filter(n => n.category === 'Maintenance').length,
      Fuel: notifications.filter(n => n.category === 'Fuel & Expenses').length,
      System: notifications.filter(n => n.category === 'System').length,
    };
    return counts;
  }, [notifications]);

  // Filtering and Sorting logic
  const processedNotifications = useMemo(() => {
    let result = [...notifications];

    // Category Filter
    if (activeCategory === 'Unread') {
      result = result.filter(n => !n.read);
    } else if (activeCategory === 'High Priority') {
      result = result.filter(n => n.priority === 'High' || n.priority === 'Critical');
    } else if (activeCategory === 'Fuel') {
      result = result.filter(n => n.category === 'Fuel & Expenses');
    } else if (activeCategory !== 'All') {
      result = result.filter(n => n.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }

    // Sort order
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [notifications, activeCategory, searchQuery, sortOrder]);

  const totalUnreadCount = notifications.filter(n => !n.read).length;

  // Category Icon Resolver
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Vehicle': return <Truck className="w-4 h-4" />;
      case 'Driver': return <Users className="w-4 h-4" />;
      case 'Trip': return <Map className="w-4 h-4" />;
      case 'Maintenance': return <Wrench className="w-4 h-4" />;
      case 'Fuel & Expenses': return <Fuel className="w-4 h-4" />;
      case 'System': return <Shield className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Category Colors
  const getCategoryStyles = (category: NotificationCategory) => {
    switch (category) {
      case 'Vehicle': return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
      case 'Driver': return 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20';
      case 'Trip': return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20';
      case 'Maintenance': return 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20';
      case 'Fuel & Expenses': return 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20';
      case 'System': return 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/20';
    }
  };

  // Priority Colors
  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/15 text-red-600 border-red-500/25 dark:text-red-400 dark:border-red-500/15';
      case 'High': return 'bg-orange-500/15 text-orange-600 border-orange-500/25 dark:text-orange-400 dark:border-orange-500/15';
      case 'Medium': return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25 dark:text-yellow-400 dark:border-yellow-500/15';
      case 'Low': return 'bg-blue-500/15 text-blue-600 border-blue-500/25 dark:text-blue-400 dark:border-blue-500/15';
      default: return 'bg-slate-500/15 text-slate-600 border-slate-500/25';
    }
  };

  const categories = ['All', 'Unread', 'High Priority', 'Vehicle', 'Driver', 'Trip', 'Maintenance', 'Fuel', 'System'];

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop wrapper */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-0">
            {/* Drawer layout */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md h-full flex flex-col bg-white dark:bg-slate-900 border-l border-border shadow-2xl relative"
            >
              {/* Sticky Header */}
              <div className="p-4 border-b border-border/80 bg-white dark:bg-slate-900 sticky top-0 z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight">Notification Center</h2>
                    {totalUnreadCount > 0 && (
                      <Badge variant="destructive" className="animate-pulse py-0.5 px-2 font-mono text-xs rounded-full">
                        {totalUnreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {totalUnreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Mark all as read" 
                        onClick={markAllAsRead} 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleClose} 
                      className="h-8 w-8 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Search & Sort Panel */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search notifications..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'}`}
                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                    className="h-9 w-9 border-border text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Horizontal scrolling filters */}
                <div className="flex overflow-x-auto gap-1.5 pb-1 -mx-2 px-2 scrollbar-none select-none">
                  {categories.map((cat) => {
                    const isSelected = activeCategory === cat;
                    const count = getFilterCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setExpandedCardId(null);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                            : 'bg-slate-50 dark:bg-slate-950 border-border text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono
                          ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-muted-foreground'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                <AnimatePresence initial={false}>
                  {processedNotifications.length === 0 ? (
                    // Empty State View
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <BellRing className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">No new notifications</h3>
                        <p className="text-xs text-muted-foreground max-w-[260px] mt-1 mx-auto">
                          You are completely up to date! Tap below to spawn dummy alerts.
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={spawnMockNotification}
                        className="text-xs font-semibold shadow-md shadow-primary/10"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Spawn Notification
                      </Button>
                    </motion.div>
                  ) : (
                    processedNotifications.map((noti) => {
                      const isExpanded = expandedCardId === noti.id;
                      return (
                        <motion.div
                          key={noti.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`border rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all duration-200
                            ${noti.read ? 'border-border' : 'border-primary/20 bg-primary/[0.01]'}`}
                        >
                          <div className="p-3.5 flex gap-3 relative">
                            {/* Unread circle dot */}
                            {!noti.read && (
                              <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                            )}

                            {/* Left Side: Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                              ${getCategoryStyles(noti.category)}`}>
                              {getCategoryIcon(noti.category)}
                            </div>

                            {/* Center Section: Details */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold truncate max-w-[170px] text-foreground">{noti.title}</span>
                                <Badge variant="outline" className={`text-[10px] scale-90 px-1.5 py-0 rounded font-semibold border ${getPriorityBadge(noti.priority)}`}>
                                  {noti.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                {noti.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono">
                                <span className="font-semibold text-primary/80 uppercase tracking-wider">{noti.category}</span>
                                <span>&bull;</span>
                                <span>{formatTimeAgo(noti.timestamp)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Expansion Drawer Section */}
                          {isExpanded && (
                            <div className="px-3.5 pb-3 pt-1 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-muted-foreground leading-relaxed space-y-2 animate-in slide-in-from-top-1 duration-200">
                              <p className="text-foreground">{noti.description}</p>
                              <div className="flex justify-between items-center pt-1.5 font-mono text-[10px] text-muted-foreground">
                                <span>ID: {noti.id}</span>
                                <span>Created: {new Date(noti.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Bar */}
                          <div className="px-3.5 py-2 border-t border-border/50 bg-slate-50/20 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                            <Button 
                              variant="ghost" 
                              onClick={() => setExpandedCardId(isExpanded ? null : noti.id)}
                              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground h-6 px-1.5"
                            >
                              {isExpanded ? (
                                <span className="flex items-center">Hide Details <ChevronUp className="w-3 h-3 ml-0.5" /></span>
                              ) : (
                                <span className="flex items-center">View Details <ChevronDown className="w-3 h-3 ml-0.5" /></span>
                              )}
                            </Button>
                            <div className="flex items-center gap-1">
                              {!noti.read && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Mark as Read"
                                  onClick={() => markAsRead(noti.id)}
                                  className="h-6 w-6 text-muted-foreground hover:text-emerald-500"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Delete Alert"
                                onClick={() => deleteNotification(noti.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t border-border bg-white dark:bg-slate-900 sticky bottom-0 z-10 flex gap-3">
                <Button 
                  onClick={handleClose} 
                  variant="outline" 
                  className="flex-1 text-xs font-semibold border-border hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </Button>
                {notifications.length > 0 && (
                  <Button 
                    onClick={handleClearAll} 
                    variant={confirmClear ? 'destructive' : 'outline'}
                    className={`flex-1 text-xs font-semibold ${!confirmClear && 'text-destructive border-destructive/20 hover:bg-destructive/10'}`}
                  >
                    {confirmClear ? 'Confirm Clear All' : 'Clear All'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
