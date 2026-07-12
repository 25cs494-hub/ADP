import { useState } from 'react';
import { useDataStore } from '../store/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Truck, Fuel, FileSpreadsheet, Printer, DollarSign, Gauge 
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function Reports() {
  const { fuelLogs, vehicles } = useDataStore();
  const [filterVehicleId, setFilterVehicleId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logs based on date range and selected vehicle
  const filteredLogs = fuelLogs.filter(log => {
    const logDate = new Date(log.date);
    const matchesVehicle = filterVehicleId === 'all' || log.vehicleId === filterVehicleId;
    
    // Convert YYYY-MM-DD input to comparable date objects (set to boundary times)
    const matchesStartDate = !startDate || logDate >= new Date(startDate + 'T00:00:00');
    const matchesEndDate = !endDate || logDate <= new Date(endDate + 'T23:59:59');
    
    return matchesVehicle && matchesStartDate && matchesEndDate;
  });

  // Calculate Fuel KPIs
  const totalCost = filteredLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalQuantity = filteredLogs.reduce((sum, log) => sum + log.quantity, 0);

  // Aggregate Fuel Usage and Efficiency by Vehicle
  const usageByVehicle = vehicles.map(vehicle => {
    const vehicleLogs = filteredLogs.filter(log => log.vehicleId === vehicle.id);
    const vehicleTotalQuantity = vehicleLogs.reduce((sum, log) => sum + log.quantity, 0);
    const vehicleTotalCost = vehicleLogs.reduce((sum, log) => sum + log.cost, 0);
    
    // Sort fuel logs for this vehicle to compute distance
    let efficiency = 0;
    const sortedLogs = [...fuelLogs].filter(l => l.vehicleId === vehicle.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const rangeLogs = sortedLogs.filter(log => {
      const logDate = new Date(log.date);
      const matchesStartDate = !startDate || logDate >= new Date(startDate + 'T00:00:00');
      const matchesEndDate = !endDate || logDate <= new Date(endDate + 'T23:59:59');
      return matchesStartDate && matchesEndDate;
    });

    if (rangeLogs.length >= 2) {
      const distance = rangeLogs[rangeLogs.length - 1].odometer - rangeLogs[0].odometer;
      const fuelConsumed = rangeLogs.slice(1).reduce((sum, l) => sum + l.quantity, 0);
      if (fuelConsumed > 0) {
        efficiency = distance / fuelConsumed; // km / L
      }
    }

    return {
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      quantity: vehicleTotalQuantity,
      cost: vehicleTotalCost,
      efficiency
    };
  }).filter(item => item.quantity > 0 || item.cost > 0);

  // Fleet Average Efficiency
  const vehiclesWithEfficiency = usageByVehicle.filter(v => v.efficiency > 0);
  const averageEfficiency = vehiclesWithEfficiency.length > 0
    ? vehiclesWithEfficiency.reduce((sum, v) => sum + v.efficiency, 0) / vehiclesWithEfficiency.length
    : 0;

  // Monthly Expenses (Group logs by month)
  const monthlyExpensesMap = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.date);
    const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[monthStr]) {
      acc[monthStr] = { monthStr, cost: 0, quantity: 0, dateObj: date };
    }
    acc[monthStr].cost += log.cost;
    acc[monthStr].quantity += log.quantity;
    return acc;
  }, {} as Record<string, { monthStr: string; cost: number; quantity: number; dateObj: Date }>);

  const monthlyExpenses = Object.values(monthlyExpensesMap).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Fuel Type Distribution
  const fuelTypeMap = filteredLogs.reduce((acc, log) => {
    acc[log.fuelType] = (acc[log.fuelType] || 0) + log.cost;
    return acc;
  }, {} as Record<string, number>);

  const fuelTypeData = Object.keys(fuelTypeMap).map(type => ({
    name: type,
    value: fuelTypeMap[type]
  }));

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Vehicle Registration', 'Vehicle Name', 'Date', 'Fuel Station', 'Fuel Type', 'Quantity (L)', 'Cost ($)', 'Odometer (km)', 'Notes'];
    const rows = filteredLogs.map(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      return [
        log.id,
        vehicle?.registrationNumber || '',
        vehicle?.name || '',
        new Date(log.date).toLocaleDateString(),
        log.fuelStation || '',
        log.fuelType,
        log.quantity,
        log.cost,
        log.odometer,
        log.notes || ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `TransitOps_Fuel_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report exported');
  };

  // Export to PDF (Print Window)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const rowsHtml = filteredLogs.map(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      return `
        <tr>
          <td>${new Date(log.date).toLocaleDateString()}</td>
          <td>${vehicle?.registrationNumber || 'N/A'}</td>
          <td>${log.fuelType}</td>
          <td>${log.quantity.toFixed(1)} L</td>
          <td>$${log.cost.toFixed(2)}</td>
          <td>${log.odometer.toLocaleString()} km</td>
          <td>${log.fuelStation || 'N/A'}</td>
        </tr>
      `;
    }).join('');

    const vehiclesHtml = usageByVehicle.map(v => `
      <tr>
        <td>${v.registrationNumber}</td>
        <td>${v.name}</td>
        <td>${v.quantity.toFixed(1)} L</td>
        <td>$${v.cost.toFixed(2)}</td>
        <td>${v.efficiency > 0 ? v.efficiency.toFixed(2) + ' km/L' : 'N/A'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>TransitOps Fuel Management Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-bottom: 25px; }
            .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background-color: #f8fafc; }
            .kpi-title { font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; }
            h2 { font-size: 16px; font-weight: 600; margin: 25px 0 10px 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; color: #475569; }
            .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
           <h1>TransitOps Fuel Management Report</h1>
           <div class="subtitle">Generated on ${new Date().toLocaleString()} ${filterVehicleId !== 'all' ? `| Filtered by Vehicle` : ''}</div>
           
           <div class="kpis">
             <div class="kpi-card">
               <div class="kpi-title">Total Fuel Cost</div>
               <div class="kpi-value">$${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
             </div>
             <div class="kpi-card">
               <div class="kpi-title">Total Fuel Consumed</div>
               <div class="kpi-value">${totalQuantity.toLocaleString(undefined, {minimumFractionDigits: 1})} Liters</div>
             </div>
             <div class="kpi-card">
               <div class="kpi-title">Avg. Efficiency</div>
               <div class="kpi-value">${averageEfficiency > 0 ? averageEfficiency.toFixed(2) + ' km/L' : 'N/A'}</div>
             </div>
           </div>

           <h2>Fuel Consumption & Efficiency by Vehicle</h2>
           <table>
             <thead>
               <tr>
                 <th>Registration</th>
                 <th>Vehicle Name</th>
                 <th>Fuel Consumed (L)</th>
                 <th>Fuel Cost ($)</th>
                 <th>Avg. Fuel Efficiency</th>
               </tr>
             </thead>
             <tbody>
               ${vehiclesHtml || '<tr><td colspan="5" style="text-align: center;">No vehicle data found</td></tr>'}
             </tbody>
           </table>

           <h2>Vehicle-wise Fuel History</h2>
           <table>
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Vehicle</th>
                 <th>Fuel Type</th>
                 <th>Quantity (L)</th>
                 <th>Cost ($)</th>
                 <th>Odometer (km)</th>
                 <th>Fuel Station</th>
               </tr>
             </thead>
             <tbody>
               ${rowsHtml || '<tr><td colspan="7" style="text-align: center;">No logs found</td></tr>'}
             </tbody>
           </table>

           <div class="footer">
             TransitOps Smart Transport Operations Platform &copy; ${new Date().getFullYear()}
           </div>
           
           <script>
             window.onload = function() { window.print(); window.close(); }
           </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('PDF Report generated');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Reports & Analytics</h1>
          <p className="text-muted-foreground">Deep dive into vehicle fuel consumption, monthly spend trends, and fuel efficiency rates.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button variant="outline" className="shadow-sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" /> Export CSV
          </Button>
          <Button variant="outline" className="shadow-sm" onClick={handleExportPDF}>
            <Printer className="w-4 h-4 mr-2 text-primary" /> Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-1.5 w-full md:w-64">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Truck className="w-3.5 h-3.5"/> Vehicle Filter</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={filterVehicleId}
              onChange={e => setFilterVehicleId(e.target.value)}
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 w-full md:w-48">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Start Date</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>

          <div className="space-y-1.5 w-full md:w-48">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> End Date</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>

          {(startDate || endDate || filterVehicleId !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-1 text-xs text-destructive hover:bg-destructive/10"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilterVehicleId('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Spend (Selected)</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated cost of filtered entries</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Consumption</CardTitle>
            <Fuel className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuantity.toLocaleString(undefined, {minimumFractionDigits: 1})} <span className="text-sm font-normal text-muted-foreground">Liters</span></div>
            <p className="text-xs text-muted-foreground mt-1">Total volume filled in timeframe</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Avg. Efficiency</CardTitle>
            <Gauge className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageEfficiency > 0 ? averageEfficiency.toFixed(2) : 'N/A'}
              {averageEfficiency > 0 && <span className="text-sm font-normal text-muted-foreground"> km/L</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on sequential odometer readings</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Fuel Cost (Line Chart) */}
        <Card className="lg:col-span-2 glass-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Fuel Expenses</CardTitle>
            <CardDescription>Line chart showing total fuel spending trend over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {monthlyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="monthStr" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Line type="monotone" dataKey="cost" name="Spend" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No spend data in selection.</div>
            )}
          </CardContent>
        </Card>

        {/* Fuel Type Distribution (Pie Chart) */}
        <Card className="glass-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Fuel Type Distribution</CardTitle>
            <CardDescription>Breakdown of total cost by fuel category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center relative">
            {fuelTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelTypeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fuelTypeData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No type distribution data.</div>
            )}
          </CardContent>
        </Card>

        {/* Fuel Consumption by Vehicle (Bar Chart) */}
        <Card className="lg:col-span-3 glass-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Fuel Consumption by Vehicle</CardTitle>
            <CardDescription>Total Liters consumed per vehicle inside selection window.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {usageByVehicle.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageByVehicle} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="registrationNumber" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} L`} />
                  <RechartsTooltip formatter={(value: any) => [`${Number(value).toFixed(1)} Liters`, 'Fuel Consumed']} />
                  <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No consumption records.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fuel Consumption & Efficiency Summary Table */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-lg">Fuel Consumption & Efficiency Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Vehicle Name</TableHead>
                <TableHead>Total Consumed</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Fuel Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageByVehicle.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-semibold text-sm">{v.registrationNumber}</TableCell>
                  <TableCell className="text-sm">{v.name}</TableCell>
                  <TableCell className="font-medium">{v.quantity.toLocaleString(undefined, {minimumFractionDigits: 1})} L</TableCell>
                  <TableCell className="font-medium text-destructive">${v.cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    {v.efficiency > 0 ? `${v.efficiency.toFixed(2)} km/L` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {usageByVehicle.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No consumption statistics found in timeframe.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detailed Vehicle-wise Fuel History Table */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-lg">Vehicle-wise Fuel History</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Station</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm font-semibold">{vehicle?.registrationNumber} ({vehicle?.name})</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.fuelType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.quantity.toLocaleString(undefined, {minimumFractionDigits: 1})} L</TableCell>
                    <TableCell className="text-sm font-semibold text-destructive">${log.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.odometer.toLocaleString()} km</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.fuelStation || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No historical logs found for the selected range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
