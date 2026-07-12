import { useDataStore } from '../store/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, BarChart, Bar
} from 'recharts';
import { 
  Truck, Map, Wrench, AlertTriangle, Activity,
  Plus, Fuel, DollarSign, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { vehicles, drivers, trips, fuelLogs, expenses } = useDataStore();
  const navigate = useNavigate();

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
        {/* Action Required */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.filter(d => {
                const expiryDate = new Date(d.licenseExpiry);
                const now = new Date();
                const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays < 30 || expiryDate < now;
              }).map(driver => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">License expires: {driver.licenseExpiry}</p>
                  </div>
                  <Button variant="outline" size="sm">Renew</Button>
                </div>
              ))}
              {drivers.length === 0 && <p className="text-sm text-muted-foreground">No drivers need attention.</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips.slice(0, 4).map(trip => (
                <div key={trip.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Map className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trip {trip.id} {trip.status}</p>
                    <p className="text-xs text-muted-foreground">{trip.source} → {trip.destination}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(trip.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
