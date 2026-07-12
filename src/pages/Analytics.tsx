import { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../store/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Activity, Calendar, RefreshCw, Download, Printer, Search, 
  ArrowUpDown, SlidersHorizontal, Map, Fuel, Wrench, CreditCard, ChevronLeft, 
  ChevronRight, Ban, DollarSign, Milestone, Zap, PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Chart color palettes
const STATUS_COLORS: Record<string, string> = {
  'Available': '#10b981', // Emerald
  'On Trip': '#3b82f6',   // Blue
  'In Shop': '#f59e0b',   // Amber
  'Retired': '#64748b'    // Slate
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface FilterState {
  dateFrom: string;
  dateTo: string;
  vehicleId: string;
  driverId: string;
  vehicleType: string;
  region: string;
  tripStatus: string;
}

const initialFilters: FilterState = {
  dateFrom: '',
  dateTo: '',
  vehicleId: '',
  driverId: '',
  vehicleType: '',
  region: '',
  tripStatus: ''
};

export default function Analytics() {
  const { vehicles, drivers, trips, fuelLogs, maintenanceLogs, expenses } = useDataStore();

  // Filters State
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilters);
  
  // Sorting State
  const [sortColumn, setSortColumn] = useState<string>('roi');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Trigger loading effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 700);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Apply Filters
  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  // Filtered Datasets
  const filteredData = useMemo(() => {
    let fTrips = [...trips];
    let fFuelLogs = [...fuelLogs];
    let fMaintenanceLogs = [...maintenanceLogs];
    let fExpenses = [...expenses];
    let fVehicles = [...vehicles];

    // Filter by Date Range
    if (activeFilters.dateFrom) {
      const fromDate = new Date(activeFilters.dateFrom);
      fTrips = fTrips.filter(t => new Date(t.date) >= fromDate);
      fFuelLogs = fFuelLogs.filter(f => new Date(f.date) >= fromDate);
      fMaintenanceLogs = fMaintenanceLogs.filter(m => new Date(m.date) >= fromDate);
      fExpenses = fExpenses.filter(e => new Date(e.date) >= fromDate);
    }
    if (activeFilters.dateTo) {
      const toDate = new Date(activeFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      fTrips = fTrips.filter(t => new Date(t.date) <= toDate);
      fFuelLogs = fFuelLogs.filter(f => new Date(f.date) <= toDate);
      fMaintenanceLogs = fMaintenanceLogs.filter(m => new Date(m.date) <= toDate);
      fExpenses = fExpenses.filter(e => new Date(e.date) <= toDate);
    }

    // Filter by Vehicle
    if (activeFilters.vehicleId) {
      fVehicles = fVehicles.filter(v => v.id === activeFilters.vehicleId);
      fTrips = fTrips.filter(t => t.vehicleId === activeFilters.vehicleId);
      fFuelLogs = fFuelLogs.filter(f => f.vehicleId === activeFilters.vehicleId);
      fMaintenanceLogs = fMaintenanceLogs.filter(m => m.vehicleId === activeFilters.vehicleId);
      fExpenses = fExpenses.filter(e => e.vehicleId === activeFilters.vehicleId);
    }

    // Filter by Driver
    if (activeFilters.driverId) {
      fTrips = fTrips.filter(t => t.driverId === activeFilters.driverId);
      fFuelLogs = fFuelLogs.filter(f => f.driverId === activeFilters.driverId);
      fExpenses = fExpenses.filter(e => e.driverId === activeFilters.driverId);
      const vehicleIds = new Set(fTrips.map(t => t.vehicleId));
      fVehicles = fVehicles.filter(v => vehicleIds.has(v.id));
    }

    // Filter by Vehicle Type
    if (activeFilters.vehicleType) {
      fVehicles = fVehicles.filter(v => v.type === activeFilters.vehicleType);
      const vehicleIds = new Set(fVehicles.map(v => v.id));
      fTrips = fTrips.filter(t => vehicleIds.has(t.vehicleId));
      fFuelLogs = fFuelLogs.filter(f => vehicleIds.has(f.vehicleId));
      fMaintenanceLogs = fMaintenanceLogs.filter(m => vehicleIds.has(m.vehicleId));
      fExpenses = fExpenses.filter(e => e.vehicleId && vehicleIds.has(e.vehicleId));
    }

    // Filter by Region
    if (activeFilters.region) {
      fTrips = fTrips.filter(t => t.region === activeFilters.region);
      const vehicleIds = new Set(fTrips.map(t => t.vehicleId));
      fVehicles = fVehicles.filter(v => vehicleIds.has(v.id));
      fFuelLogs = fFuelLogs.filter(f => vehicleIds.has(f.vehicleId));
      fMaintenanceLogs = fMaintenanceLogs.filter(m => vehicleIds.has(m.vehicleId));
      fExpenses = fExpenses.filter(e => e.vehicleId && vehicleIds.has(e.vehicleId));
    }

    // Filter by Trip Status
    if (activeFilters.tripStatus) {
      fTrips = fTrips.filter(t => t.status === activeFilters.tripStatus);
      const vehicleIds = new Set(fTrips.map(t => t.vehicleId));
      fVehicles = fVehicles.filter(v => vehicleIds.has(v.id));
      fFuelLogs = fFuelLogs.filter(f => vehicleIds.has(f.vehicleId));
      fMaintenanceLogs = fMaintenanceLogs.filter(m => vehicleIds.has(m.vehicleId));
      fExpenses = fExpenses.filter(e => e.vehicleId && vehicleIds.has(e.vehicleId));
    }

    return {
      trips: fTrips,
      fuelLogs: fFuelLogs,
      maintenanceLogs: fMaintenanceLogs,
      expenses: fExpenses,
      vehicles: fVehicles
    };
  }, [activeFilters, trips, fuelLogs, maintenanceLogs, expenses, vehicles]);

  // Unique options for dropdowns
  const vehicleTypes = useMemo(() => Array.from(new Set(vehicles.map(v => v.type))), [vehicles]);
  const regions = useMemo(() => Array.from(new Set(trips.filter(t => t.region).map(t => t.region))) as string[], [trips]);

  // Perform operational metrics calculations for vehicles list
  const vehicleReports = useMemo(() => {
    return filteredData.vehicles.map(vehicle => {
      // Trips for this vehicle in filtered trips list
      const vTrips = filteredData.trips.filter(t => t.vehicleId === vehicle.id && (t.status === 'Completed' || t.status === 'Dispatched'));
      const distance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);

      // Fuel logs for this vehicle in filtered fuel logs
      const vFuelLogs = filteredData.fuelLogs.filter(f => f.vehicleId === vehicle.id);
      const fuelConsumed = vFuelLogs.reduce((sum, f) => sum + f.gallons, 0);
      const fuelCost = vFuelLogs.reduce((sum, f) => sum + f.cost, 0);

      // Fuel Efficiency = Distance / Fuel Consumed
      const fuelEfficiency = fuelConsumed > 0 ? (distance / fuelConsumed) : 0;

      // Maintenance logs for this vehicle in filtered logs
      const vMaintenance = filteredData.maintenanceLogs.filter(m => m.vehicleId === vehicle.id);
      const maintenanceCost = vMaintenance.reduce((sum, m) => sum + (m.actualCost ?? m.estimatedCost ?? 0), 0);

      // Operational Cost = Fuel Cost + Maintenance Cost
      const operationalCost = fuelCost + maintenanceCost;

      // Revenue: (Distance * 3.5) + (Weight * 0.06) for dispatched or completed trips
      const revenue = vTrips.reduce((sum, t) => {
        const tripRev = (t.plannedDistance * 3.50) + (t.cargoWeight * 0.06);
        return sum + tripRev;
      }, 0);

      // Vehicle ROI = (Revenue - Operational Cost) / Acquisition Cost
      const acqCost = vehicle.acquisitionCost || 120000; // default fallback
      const roi = acqCost > 0 ? ((revenue - operationalCost) / acqCost) * 100 : 0;

      // Current Driver
      let driverName = 'Unassigned';
      if (vTrips.length > 0) {
        const sortedTrips = [...vTrips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastDriverId = sortedTrips[0].driverId;
        const driver = drivers.find(d => d.id === lastDriverId);
        if (driver) driverName = driver.name;
      }

      return {
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        driver: driverName,
        totalDistance: distance,
        fuelConsumed,
        fuelEfficiency,
        fuelCost,
        maintenanceCost,
        operationalCost,
        revenue,
        roi,
        status: vehicle.status
      };
    });
  }, [filteredData, drivers]);

  // Aggregate KPI summary stats
  const kpiStats = useMemo(() => {
    const totalTrips = filteredData.trips.length;
    const totalDistance = filteredData.trips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const totalFuelConsumed = filteredData.fuelLogs.reduce((sum, f) => sum + f.gallons, 0);
    const totalFuelCost = filteredData.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    
    // Sum maintenance cost
    const totalMaintenanceCost = filteredData.maintenanceLogs.reduce((sum, m) => sum + (m.actualCost ?? m.estimatedCost ?? 0), 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

    // Fleet utilization = (On Trip vehicles / total active vehicles) * 100
    const activeVehicles = filteredData.vehicles.length;
    const vehiclesOnTrip = filteredData.vehicles.filter(v => v.status === 'On Trip').length;
    const fleetUtilization = activeVehicles > 0 ? Math.round((vehiclesOnTrip / activeVehicles) * 100) : 0;

    // Avg fuel efficiency
    const avgFuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed) : 0;

    // ROI
    const totalRevenue = filteredData.trips.reduce((sum, t) => {
      if (t.status === 'Completed' || t.status === 'Dispatched') {
        return sum + (t.plannedDistance * 3.50) + (t.cargoWeight * 0.06);
      }
      return sum;
    }, 0);
    
    const totalAcquisitionCost = filteredData.vehicles.reduce((sum, v) => sum + (v.acquisitionCost || 120000), 0);
    const totalROI = totalAcquisitionCost > 0 ? ((totalRevenue - totalOperationalCost) / totalAcquisitionCost) * 100 : 0;

    return {
      totalTrips,
      totalDistance,
      totalFuelConsumed,
      totalFuelCost,
      totalMaintenanceCost,
      totalOperationalCost,
      fleetUtilization,
      avgFuelEfficiency,
      totalROI
    };
  }, [filteredData]);

  // Chart Data: Fleet Status counts
  const fleetUtilizationChartData = useMemo(() => {
    const statuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
    return statuses.map(status => ({
      name: status,
      value: filteredData.vehicles.filter(v => v.status === status).length
    })).filter(item => item.value > 0);
  }, [filteredData.vehicles]);

  // Chart Data: Fuel Efficiency per Vehicle
  const fuelEfficiencyChartData = useMemo(() => {
    return vehicleReports
      .map(r => ({
        name: r.name,
        efficiency: Number(r.fuelEfficiency.toFixed(2))
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [vehicleReports]);

  // Chart Data: Vehicle ROI Chart
  const vehicleROIChartData = useMemo(() => {
    return vehicleReports
      .map(r => ({
        name: r.name,
        roi: Number(r.roi.toFixed(2))
      }))
      .sort((a, b) => b.roi - a.roi);
  }, [vehicleReports]);

  // Chart Data: Operational Cost Over Time (grouped by month)
  const operationalCostChartData = useMemo(() => {
    const monthlyData: Record<string, { dateObj: Date; name: string; Fuel: number; Maintenance: number }> = {};
    
    // Group Fuel Logs
    filteredData.fuelLogs.forEach(f => {
      const date = new Date(f.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const name = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyData[key]) {
        monthlyData[key] = { dateObj: date, name, Fuel: 0, Maintenance: 0 };
      }
      monthlyData[key].Fuel += f.cost;
    });

    // Group Maintenance Logs
    filteredData.maintenanceLogs.forEach(m => {
      const date = new Date(m.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const name = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyData[key]) {
        monthlyData[key] = { dateObj: date, name, Fuel: 0, Maintenance: 0 };
      }
      monthlyData[key].Maintenance += (m.actualCost ?? m.estimatedCost ?? 0);
    });

    // Sort by key chronologically
    return Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
  }, [filteredData.fuelLogs, filteredData.maintenanceLogs]);

  // Chart Data: Monthly Expense Trend
  const monthlyExpenseTrendData = useMemo(() => {
    const monthlyData: Record<string, { dateObj: Date; name: string; Fuel: number; Maintenance: number; Other: number }> = {};

    filteredData.expenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const name = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[key]) {
        monthlyData[key] = { dateObj: date, name, Fuel: 0, Maintenance: 0, Other: 0 };
      }

      if (e.category === 'Fuel') {
        monthlyData[key].Fuel += e.amount;
      } else if (e.category === 'Maintenance') {
        monthlyData[key].Maintenance += e.amount;
      } else {
        // Tolls, Salaries, Insurance, Other
        monthlyData[key].Other += e.amount;
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
  }, [filteredData.expenses]);

  // Sorting Handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Process sorting & searching on the table dataset
  const processedReports = useMemo(() => {
    let results = [...vehicleReports];

    // Apply Text Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      results = results.filter(r => 
        r.registrationNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.driver.toLowerCase().includes(q)
      );
    }

    // Sort Results
    results.sort((a: any, b: any) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
    });

    return results;
  }, [vehicleReports, searchTerm, sortColumn, sortDirection]);

  // Paginated Table Data
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedReports.slice(startIndex, startIndex + itemsPerPage);
  }, [processedReports, currentPage]);

  const totalPages = Math.max(1, Math.ceil(processedReports.length / itemsPerPage));

  // Export CSV
  const handleExportCSV = () => {
    if (processedReports.length === 0) return;
    const headers = [
      'Registration Number', 'Vehicle Name', 'Driver Assigned', 
      'Total Distance (mi)', 'Fuel Consumed (gal)', 'Fuel Efficiency (mi/gal)',
      'Fuel Cost ($)', 'Maintenance Cost ($)', 'Operational Cost ($)', 
      'Estimated Revenue ($)', 'ROI (%)', 'Vehicle Status'
    ];
    
    const rows = processedReports.map(r => [
      r.registrationNumber,
      r.name,
      r.driver,
      r.totalDistance,
      r.fuelConsumed,
      r.fuelEfficiency.toFixed(2),
      r.fuelCost,
      r.maintenanceCost,
      r.operationalCost,
      r.revenue.toFixed(2),
      r.roi.toFixed(2),
      r.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TransitOps_Reports_Export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Dynamic style tag for CSS Print styles */}
      <style>{`
        @media print {
          aside, header, nav, .no-print, button, .filters-section, .pagination-controls {
            display: none !important;
          }
          main, .main-content, .page-content {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .kpi-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            break-inside: avoid;
            background: white !important;
            color: black !important;
          }
          .chart-grid {
            display: none !important;
          }
          .table-container {
            width: 100% !important;
            overflow: visible !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
            font-size: 10px !important;
          }
          .badge {
            border: none !important;
            background: transparent !important;
            color: black !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5 print:pb-3 print:border-b-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 print:text-2xl">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1 print:text-xs">Monitor fleet performance, operational costs, and business insights.</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-muted-foreground px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={handleRefresh} className="h-9 w-9 shadow-sm" title="Refresh Analytics">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="glass-card border border-border/60 shadow-md no-print filters-section">
        <CardHeader className="py-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            Operational Filter Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date inputs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Date Range (From)</label>
              <Input 
                type="date" 
                value={filters.dateFrom} 
                onChange={e => setFilters({...filters, dateFrom: e.target.value})} 
                className="w-full text-xs h-9 bg-background focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Date Range (To)</label>
              <Input 
                type="date" 
                value={filters.dateTo} 
                onChange={e => setFilters({...filters, dateTo: e.target.value})} 
                className="w-full text-xs h-9 bg-background focus:ring-primary"
              />
            </div>

            {/* Vehicle Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Vehicle</label>
              <select 
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-slate-700 dark:text-slate-200"
                value={filters.vehicleId}
                onChange={e => setFilters({...filters, vehicleId: e.target.value})}
              >
                <option value="">All Vehicles</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
                ))}
              </select>
            </div>

            {/* Driver Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Driver</label>
              <select 
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-slate-700 dark:text-slate-200"
                value={filters.driverId}
                onChange={e => setFilters({...filters, driverId: e.target.value})}
              >
                <option value="">All Drivers</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Vehicle Type Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Vehicle Type</label>
              <select 
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-slate-700 dark:text-slate-200"
                value={filters.vehicleType}
                onChange={e => setFilters({...filters, vehicleType: e.target.value})}
              >
                <option value="">All Types</option>
                {vehicleTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Region Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Region</label>
              <select 
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-slate-700 dark:text-slate-200"
                value={filters.region}
                onChange={e => setFilters({...filters, region: e.target.value})}
              >
                <option value="">All Regions</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Trip Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Trip Status</label>
              <select 
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-slate-700 dark:text-slate-200"
                value={filters.tripStatus}
                onChange={e => setFilters({...filters, tripStatus: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100">
              Reset Filters
            </Button>
            <Button size="sm" onClick={handleApplyFilters} className="text-xs px-4 shadow-sm">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Area */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* SKELETON LOADER SCREEN */
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* KPI Cards Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="col-span-1 lg:col-span-3 h-28 bg-white dark:bg-slate-900 border border-border rounded-xl animate-pulse p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Skeletons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-white dark:bg-slate-900 border border-border rounded-xl animate-pulse p-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-56 mb-8"></div>
                <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded w-full"></div>
              </div>
              <div className="h-80 bg-white dark:bg-slate-900 border border-border rounded-xl animate-pulse p-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-56 mb-8"></div>
                <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded w-full"></div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="h-96 bg-white dark:bg-slate-900 border border-border rounded-xl animate-pulse p-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded w-full"></div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ACTUAL DASHBOARD CONTENT */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* 1. KPI CARDS SECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-9 gap-4 kpi-grid">
              
              {/* Total Trips */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Trips</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpiStats.totalTrips}</h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 rounded-xl">
                    <Map className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">+5.2%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </Card>

              {/* Total Distance Covered */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distance Covered</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpiStats.totalDistance.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">mi</span></h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 rounded-xl">
                    <Milestone className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">+8.1%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </Card>

              {/* Total Fuel Consumed */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fuel Consumed</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpiStats.totalFuelConsumed.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">gal</span></h3>
                  </div>
                  <div className="p-2 bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 rounded-xl">
                    <Fuel className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">+2.4%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </Card>

              {/* Total Fuel Cost */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fuel Cost</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">${kpiStats.totalFuelCost.toLocaleString()}</h3>
                  </div>
                  <div className="p-2 bg-red-500/10 text-red-500 dark:bg-red-500/20 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-amber-500 font-semibold flex items-center">+4.1%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </Card>

              {/* Total Maintenance Cost */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maintenance Cost</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">${kpiStats.totalMaintenanceCost.toLocaleString()}</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 rounded-xl">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">-14.2%</span>
                  <span className="text-muted-foreground">decreased spend</span>
                </div>
              </Card>

              {/* Total Operational Cost */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Cost</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">${kpiStats.totalOperationalCost.toLocaleString()}</h3>
                  </div>
                  <div className="p-2 bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">-6.4%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </Card>

              {/* Fleet Utilization */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fleet Utilization</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpiStats.fleetUtilization}%</h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">+2.1%</span>
                  <span className="text-muted-foreground">active operations</span>
                </div>
              </Card>

              {/* Average Fuel Efficiency */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg. Efficiency</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpiStats.avgFuelEfficiency.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">mpg</span></h3>
                  </div>
                  <div className="p-2 bg-teal-500/10 text-teal-500 dark:bg-teal-500/20 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">+3.5%</span>
                  <span className="text-muted-foreground">fuel optimization</span>
                </div>
              </Card>

              {/* Vehicle ROI */}
              <Card className="xl:col-span-3 border border-border/80 shadow-sm glass-card flex flex-col justify-between p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Fleet ROI</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpiStats.totalROI.toFixed(2)}%</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center">+1.8%</span>
                  <span className="text-muted-foreground">returns on fleet capital</span>
                </div>
              </Card>

            </div>

            {/* 2. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 chart-grid">
              
              {/* Fuel Efficiency Chart */}
              <Card className="border border-border/80 shadow-sm glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-500" />
                    Fuel Efficiency per Vehicle
                  </CardTitle>
                  <CardDescription>Average miles covered per gallon of diesel consumed.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] pt-4">
                  {fuelEfficiencyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelEfficiencyChartData} margin={{ left: -15, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                        <YAxis fontSize={11} stroke="#64748b" tickLine={false} label={{ value: 'mi/gal', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
                        <RechartsTooltip 
                          formatter={(value) => value !== undefined && value !== null ? [`${value} mi/gal`, 'Efficiency'] : ['', '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        />
                        <Bar dataKey="efficiency" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                      <Ban className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">No efficiency data available</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fleet Utilization Chart */}
              <Card className="border border-border/80 shadow-sm glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-blue-500" />
                    Fleet Status Distribution
                  </CardTitle>
                  <CardDescription>Current operational breakdown of all fleet vehicles.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] flex items-center justify-center">
                  {fleetUtilizationChartData.length > 0 ? (
                    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6">
                      <div className="w-1/2 h-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={fleetUtilizationChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {fleetUtilizationChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value) => value !== undefined && value !== null ? [`${value} Vehicles`, 'Count'] : ['', '']}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        {fleetUtilizationChartData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length] }}></span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                      <Ban className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">No status data available</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operational Cost Chart */}
              <Card className="border border-border/80 shadow-sm glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-500" />
                    Operational Costs Over Time
                  </CardTitle>
                  <CardDescription>Comparison between fuel costs and maintenance expenditures.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] pt-4">
                  {operationalCostChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={operationalCostChartData} margin={{ left: -15, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                        <YAxis fontSize={11} stroke="#64748b" tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <RechartsTooltip 
                          formatter={(value) => value !== undefined && value !== null ? [`$${Number(value).toLocaleString()}`, 'Cost'] : ['', '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="Fuel" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Maintenance" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                      <Ban className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">No historical operational data available</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle ROI Chart */}
              <Card className="border border-border/80 shadow-sm glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Vehicle ROI Performance
                  </CardTitle>
                  <CardDescription>Return on investment percentage per vehicle based on operations.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] pt-4">
                  {vehicleROIChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vehicleROIChartData} margin={{ left: -15, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                        <YAxis fontSize={11} stroke="#64748b" tickLine={false} label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
                        <RechartsTooltip 
                          formatter={(value) => value !== undefined && value !== null ? [`${value}%`, 'ROI'] : ['', '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        />
                        <Bar dataKey="roi" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45}>
                          {vehicleROIChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                      <Ban className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">No ROI data available</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Expense Trend */}
              <Card className="border border-border/80 shadow-sm glass-card overflow-hidden lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Monthly Expense Breakdown Trend
                  </CardTitle>
                  <CardDescription>Breakdown comparing Fuel expenses, Maintenance expenses, and Other corporate operational overheads.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  {monthlyExpenseTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyExpenseTrendData} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                        <YAxis fontSize={11} stroke="#64748b" tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <RechartsTooltip 
                          formatter={(value) => value !== undefined && value !== null ? [`$${Number(value).toLocaleString()}`, 'Spent'] : ['', '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="Fuel" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Maintenance" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Other" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                      <Ban className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">No historical expense data available</span>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* 3. REPORTS TABLE SECTION */}
            <Card className="border border-border/80 shadow-sm glass-card overflow-hidden">
              <CardHeader className="py-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base">Operational Reports Ledger</CardTitle>
                  <CardDescription className="text-xs">Granular analysis on distance, efficiency, costs, revenue, and ROI per vehicle.</CardDescription>
                </div>
                
                {/* Search and Exports */}
                <div className="flex items-center gap-2 w-full sm:w-auto no-print">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="Search reports..." 
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="pl-8 text-xs h-9 bg-background focus:ring-1"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs h-9 flex items-center gap-1.5 shadow-sm">
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs h-9 flex items-center gap-1.5 shadow-sm">
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    Print PDF
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 table-container">
                {processedReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-border/60">
                        <tr>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer" onClick={() => handleSort('registrationNumber')}>
                            <div className="flex items-center gap-1.5">
                              Registration
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer" onClick={() => handleSort('name')}>
                            <div className="flex items-center gap-1.5">
                              Vehicle Name
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer" onClick={() => handleSort('driver')}>
                            <div className="flex items-center gap-1.5">
                              Driver
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('totalDistance')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Distance
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('fuelConsumed')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Fuel
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('fuelEfficiency')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Efficiency
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('fuelCost')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Fuel Cost
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('maintenanceCost')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Maint. Cost
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('operationalCost')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Op. Cost
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('revenue')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Revenue
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right cursor-pointer" onClick={() => handleSort('roi')}>
                            <div className="flex items-center justify-end gap-1.5">
                              ROI
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                          <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer" onClick={() => handleSort('status')}>
                            <div className="flex items-center gap-1.5">
                              Status
                              <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {paginatedReports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                            <td className="p-4 text-xs font-semibold text-slate-800 dark:text-slate-200">{report.registrationNumber}</td>
                            <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300">{report.name}</td>
                            <td className="p-4 text-xs text-muted-foreground">{report.driver}</td>
                            <td className="p-4 text-xs text-right font-medium">{report.totalDistance.toLocaleString()} mi</td>
                            <td className="p-4 text-xs text-right font-medium">{report.fuelConsumed.toLocaleString()} gal</td>
                            <td className="p-4 text-xs text-right font-semibold text-teal-600 dark:text-teal-400">{report.fuelEfficiency.toFixed(2)} mpg</td>
                            <td className="p-4 text-xs text-right font-medium">${report.fuelCost.toLocaleString()}</td>
                            <td className="p-4 text-xs text-right font-medium">${report.maintenanceCost.toLocaleString()}</td>
                            <td className="p-4 text-xs text-right font-semibold text-slate-800 dark:text-slate-200">${report.operationalCost.toLocaleString()}</td>
                            <td className="p-4 text-xs text-right font-semibold text-blue-600 dark:text-blue-400">${report.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className={`p-4 text-xs text-right font-bold ${report.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {report.roi >= 0 ? '+' : ''}{report.roi.toFixed(2)}%
                            </td>
                            <td className="p-4 text-xs">
                              <Badge 
                                variant="outline" 
                                className="badge text-[10px] px-2 py-0.5"
                                style={{
                                  backgroundColor: `${STATUS_COLORS[report.status]}10`,
                                  color: STATUS_COLORS[report.status],
                                  borderColor: `${STATUS_COLORS[report.status]}30`
                                }}
                              >
                                {report.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                    <Ban className="w-10 h-10 text-slate-300" />
                    <p className="text-sm font-semibold">No operational reports available matching active filters.</p>
                    <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs mt-2 no-print">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>

              {/* Pagination controls */}
              {processedReports.length > 0 && (
                <div className="py-3.5 px-4 border-t border-border/50 bg-slate-50/50 dark:bg-slate-800/10 flex justify-between items-center no-print pagination-controls">
                  <span className="text-xs text-muted-foreground">
                    Showing <strong className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(processedReports.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to <strong className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(processedReports.length, currentPage * itemsPerPage)}</strong> of <strong className="font-semibold text-slate-700 dark:text-slate-300">{processedReports.length}</strong> vehicles
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <span className="text-xs font-semibold px-3 text-slate-700 dark:text-slate-300">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
