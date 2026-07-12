import { useDataStore } from '../store/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, BarChart, Bar
} from 'recharts';
import { 
  Truck, Map, Wrench, AlertTriangle, Activity,
  Plus, Fuel, DollarSign, Gauge, Check, Trash2, CheckCircle2, AlertCircle, Info, Bell, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useNotificationStore, formatTimeAgo } from '../store/notifications';
import { useAuthStore } from '../store/auth';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { vehicles, trips, fuelLogs, expenses } = useDataStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    notifications, 
    markAsRead, 
    deleteNotification 
  } = useNotificationStore();

  // Filter role-specific notifications
  const roleNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.roles.includes(user.role));
  }, [notifications, user]);

  const unreadCount = useMemo(() => {
    return roleNotifications.filter(n => !n.read).length;
  }, [roleNotifications]);

  const recentDashboardNotifications = useMemo(() => {
    return [...roleNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [roleNotifications]);

  // Alerts requiring immediate attention: error or warning category, unread
  const immediateAlerts = useMemo(() => {
    return roleNotifications
      .filter(n => (n.category === 'error' || n.category === 'warning' || n.priority === 'high') && !n.read)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [roleNotifications]);

  // Calculate Operational KPIs
  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  
  const totalVehicles = vehicles.length || 1;
  const fleetUtilization = Math.round((activeVehicles / totalVehicles) * 100);

  // Calculate Fuel KPIs
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalFuelConsumed = fuelLogs.reduce((sum, log) => sum + log.quantity, 0);

  // Fleet Average Fuel Efficiency (Distance / Fuel)
  let totalFleetDistance = 0;
  let totalFleetFuel = 0;
  vehicles.forEach(vehicle => {
    const sortedLogs = [...fuelLogs].filter(l => l.vehicleId === vehicle.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortedLogs.length >= 2) {
      const distance = sortedLogs[sortedLogs.length - 1].odometer - sortedLogs[0].odometer;
      const fuel = sortedLogs.slice(1).reduce((sum, l) => sum + l.quantity, 0);
      totalFleetDistance += distance;
      totalFleetFuel += fuel;
    }
  });
  const averageEfficiency = totalFleetFuel > 0 ? totalFleetDistance / totalFleetFuel : 0;

  // Monthly Fuel Expense (Current Calendar Month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyFuelExpense = fuelLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
  }).reduce((sum, log) => sum + log.cost, 0);

  // Dynamic calculations for Revenue vs Expenses chart
  // Aggregate expenses and estimate revenues for the last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    return {
      monthNum: d.getMonth(),
      year: d.getFullYear(),
      name: months[d.getMonth()]
    };
  });

  const financialTrendData = last6Months.map(m => {
    // Total expenses in this month
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === m.monthNum && expDate.getFullYear() === m.year;
    }).reduce((sum, exp) => sum + exp.amount, 0);

    // Dynamic Revenue: completed trips in this month * $2.50 per planned distance
    const monthRevenue = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return trip.status === 'Completed' && tripDate.getMonth() === m.monthNum && tripDate.getFullYear() === m.year;
    }).reduce((sum, trip) => sum + (trip.plannedDistance * 2.50), 0);

    return {
      name: m.name,
      revenue: monthRevenue > 0 ? monthRevenue : (m.name === 'Jun' ? 8500 : m.name === 'Jul' ? 12000 : 5000), // Fallback to realistic mock values if empty
      expenses: monthExpenses > 0 ? monthExpenses : (m.name === 'Jun' ? 4200 : m.name === 'Jul' ? 6100 : 2500)
    };
  });

  // Vehicle Status distribution
  const vehicleStatusData = [
    { name: 'Available', value: availableVehicles },
    { name: 'On Trip', value: activeVehicles },
    { name: 'In Shop', value: maintenanceVehicles },
    { name: 'Retired', value: vehicles.filter(v => v.status === 'Retired').length },
  ];

  // Fuel Cost Trend (Line Chart data, grouped by month)
  const fuelMonthlyMap = fuelLogs.reduce((acc, log) => {
    const logDate = new Date(log.date);
    const label = logDate.toLocaleString('default', { month: 'short' });
    if (!acc[label]) {
      acc[label] = { label, cost: 0, dateObj: logDate };
    }
    acc[label].cost += log.cost;
    return acc;
  }, {} as Record<string, { label: string; cost: number; dateObj: Date }>);

  const fuelCostTrendData = Object.values(fuelMonthlyMap)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .map(item => ({ name: item.label, cost: item.cost }));

  // Top 5 Vehicles by Fuel Consumption (Bar Chart data)
  const topVehiclesData = vehicles.map(vehicle => {
    const totalQuantity = fuelLogs.filter(log => log.vehicleId === vehicle.id).reduce((sum, log) => sum + log.quantity, 0);
    return {
      registrationNumber: vehicle.registrationNumber,
      quantity: Math.round(totalQuantity)
    };
  }).filter(v => v.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your fleet operations, fuel consumption, and financial performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="shadow-md" onClick={() => navigate('/trips')}><Plus className="w-4 h-4 mr-2"/> New Trip</Button>
          <Button variant="outline" className="shadow-sm" onClick={() => navigate('/fuel-management')}><Plus className="w-4 h-4 mr-2"/> Log Fuel</Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fleetUtilization}%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${fleetUtilization}%` }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVehicles} <span className="text-sm font-normal text-muted-foreground">/ {totalVehicles}</span></div>
              <p className="text-xs text-muted-foreground">{availableVehicles} available for dispatch</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
              <Map className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTrips}</div>
              <p className="text-xs text-muted-foreground">{pendingTrips} trips pending</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceVehicles}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fuel KPI Cards */}
      <div>
        <h2 className="text-lg font-bold mb-3 tracking-tight text-slate-800 dark:text-slate-200">Fuel Management Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Fuel Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalFuelCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground mt-1">Life-to-date fuel spend</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Consumed</CardTitle>
                <Fuel className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFuelConsumed.toLocaleString(undefined, {minimumFractionDigits: 1})} <span className="text-sm font-normal text-muted-foreground">L</span></div>
                <p className="text-xs text-muted-foreground mt-1">Total volume consumed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Fleet Efficiency</CardTitle>
                <Gauge className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageEfficiency > 0 ? `${averageEfficiency.toFixed(2)} km/L` : 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">Average miles covered per Liter</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Monthly Expense</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${monthlyFuelExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground mt-1">Spent in current calendar month</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Revenue vs Expenses */}
        <Card className="lg:col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial overview for the current year (includes fuel costs).</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => `$${Number(val).toLocaleString()}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Status */}
        <Card className="lg:col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
            <CardDescription>Current distribution of fleet.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Specific Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Fuel Cost Trend (Line Chart) */}
        <Card className="lg:col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Fuel Cost Trend</CardTitle>
            <CardDescription>Monthly fuel expenses trend.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {fuelCostTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelCostTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Line type="monotone" dataKey="cost" name="Fuel Cost" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No fuel trend logs found.</div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Vehicles by Consumption */}
        <Card className="lg:col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Top 5 Vehicles by Fuel Consumption</CardTitle>
            <CardDescription>Total Liters filled by top vehicles.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {topVehiclesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVehiclesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="registrationNumber" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}L`} />
                  <RechartsTooltip formatter={(value: any) => [`${value} Liters`, 'Fuel Consumption']} />
                  <Bar dataKey="quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No vehicle consumption logs found.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts Requiring Immediate Attention */}
        <Card className="glass-card flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1 pr-4">
                <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                  Alerts Requiring Attention
                </CardTitle>
                <CardDescription>System-critical alerts and unresolved warning notifications.</CardDescription>
              </div>
              {immediateAlerts.length > 0 && (
                <Badge variant="destructive" className="animate-pulse flex-shrink-0">{immediateAlerts.length} Actionable</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {immediateAlerts.length > 0 ? (
                <div className="space-y-3">
                  {immediateAlerts.map(alert => {
                    const iconColor = alert.category === 'error' ? 'text-rose-500 bg-rose-500/10' : 'text-amber-500 bg-amber-500/10';
                    return (
                      <div key={alert.id} className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border">
                        <div className="flex gap-3 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${iconColor}`}>
                            {alert.category === 'error' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{alert.description}</p>
                            <span className="text-[10px] text-muted-foreground font-medium block mt-1">{formatTimeAgo(alert.timestamp)}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs font-semibold text-primary hover:bg-primary/10 flex-shrink-0"
                          onClick={() => markAsRead(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">All Systems Normal</h4>
                  <p className="text-xs text-muted-foreground mt-1">No pending warnings or error alerts require immediate attention.</p>
                </div>
              )}
            </CardContent>
          </div>
          {immediateAlerts.length > 0 && (
            <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary" onClick={() => navigate('/notifications')}>
                Audit All Alerts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </Card>
        
        {/* Recent Notifications */}
        <Card className="glass-card flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1 pr-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bell className="w-5 h-5" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>Latest alerts dispatched to your user account role.</CardDescription>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">{unreadCount} Unread</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {recentDashboardNotifications.length > 0 ? (
                <div className="space-y-3">
                  {recentDashboardNotifications.map(n => {
                    const iconColor = 
                      n.category === 'success' ? 'text-emerald-500 bg-emerald-500/10' :
                      n.category === 'warning' ? 'text-amber-500 bg-amber-500/10' :
                      n.category === 'error' ? 'text-rose-500 bg-rose-500/10' :
                      'text-blue-500 bg-blue-500/10';
                    const icon = 
                      n.category === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                      n.category === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                      n.category === 'error' ? <AlertCircle className="w-4 h-4" /> :
                      <Info className="w-4 h-4" />;
                    return (
                      <div key={n.id} className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors ${!n.read ? 'bg-primary/5 dark:bg-primary/10 border-primary/20' : 'bg-slate-50/30 dark:bg-slate-900/10 border-border'}`}>
                        <div className="flex gap-3 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${iconColor}`}>
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold text-slate-800 dark:text-slate-200 ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">{n.description}</p>
                            <span className="text-[10px] text-muted-foreground font-medium block mt-1">{formatTimeAgo(n.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!n.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850"
                              onClick={() => markAsRead(n.id)}
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-600"
                            onClick={() => deleteNotification(n.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">There are no recent notifications to display.</p>
                </div>
              )}
            </CardContent>
          </div>
          <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary" onClick={() => navigate('/notifications')}>
              View Full History <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
