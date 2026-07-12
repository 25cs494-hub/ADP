import { create } from 'zustand';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  model: string;
  type: string;
  maxLoadCapacity: number;
  currentOdometer: number;
  acquisitionCost?: number;
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  phoneNumber: string;
  email: string;
  safetyScore: number;
  status: DriverStatus;
  photo?: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  status: TripStatus;
  date: string;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  issue: string;
  serviceType: string;
  mechanic: string;
  estimatedCost: number;
  actualCost?: number;
  date: string;
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  gallons: number;
  cost: number;
  location: string;
  odometer: number;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: 'Maintenance' | 'Fuel' | 'Tolls' | 'Insurance' | 'Salary' | 'Other';
  description: string;
  vehicleId?: string;
  driverId?: string;
}

interface DataState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: Maintenance[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  
  createTrip: (trip: Omit<Trip, 'id' | 'status'>) => void;
  updateTripStatus: (id: string, status: TripStatus) => void;
  
  createMaintenance: (log: Omit<Maintenance, 'id' | 'status'>) => void;
  updateMaintenanceStatus: (id: string, status: Maintenance['status'], actualCost?: number) => void;
  
  addFuelLog: (log: Omit<FuelLog, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
}

const mockVehicles: Vehicle[] = [
  { id: 'v1', registrationNumber: 'TR-1001', name: 'Volvo FH16', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 40000, currentOdometer: 15000, status: 'Available' },
  { id: 'v2', registrationNumber: 'TR-1002', name: 'Scania R500', model: '2022', type: 'Heavy Truck', maxLoadCapacity: 35000, currentOdometer: 45000, status: 'On Trip' },
  { id: 'v3', registrationNumber: 'VN-2001', name: 'Mercedes Sprinter', model: '2023', type: 'Van', maxLoadCapacity: 3500, currentOdometer: 8000, status: 'In Shop' },
];

const mockDrivers: Driver[] = [
  { id: 'd1', name: 'John Doe', licenseNumber: 'DL-12345', licenseCategory: 'CE', licenseExpiry: '2028-12-31', phoneNumber: '555-0101', email: 'john@example.com', safetyScore: 95, status: 'Available' },
  { id: 'd2', name: 'Jane Smith', licenseNumber: 'DL-67890', licenseCategory: 'CE', licenseExpiry: '2027-05-15', phoneNumber: '555-0102', email: 'jane@example.com', safetyScore: 88, status: 'On Trip' },
  { id: 'd3', name: 'Mike Johnson', licenseNumber: 'DL-34567', licenseCategory: 'B', licenseExpiry: '2025-01-10', phoneNumber: '555-0103', email: 'mike@example.com', safetyScore: 72, status: 'Suspended' },
];

const mockTrips: Trip[] = [
  { id: 't1', source: 'New York, NY', destination: 'Boston, MA', vehicleId: 'v2', driverId: 'd2', cargoWeight: 25000, plannedDistance: 215, status: 'Dispatched', date: new Date().toISOString() }
];

const mockMaintenance: Maintenance[] = [
  { id: 'm1', vehicleId: 'v3', issue: 'Engine light ON', serviceType: 'Diagnostics', mechanic: 'Bob', estimatedCost: 150, date: new Date().toISOString(), status: 'Open' }
];

const mockFuelLogs: FuelLog[] = [
  { id: 'f1', vehicleId: 'v1', driverId: 'd1', date: new Date().toISOString(), gallons: 50, cost: 180, location: 'Pilot Station', odometer: 15000 }
];

const mockExpenses: Expense[] = [
  { id: 'e1', date: new Date().toISOString(), amount: 150, category: 'Maintenance', description: 'Diagnostics fee', vehicleId: 'v3' },
  { id: 'e2', date: new Date().toISOString(), amount: 180, category: 'Fuel', description: 'Diesel refill', vehicleId: 'v1', driverId: 'd1' }
];

export const useDataStore = create<DataState>((set) => ({
  vehicles: mockVehicles,
  drivers: mockDrivers,
  trips: mockTrips,
  maintenanceLogs: mockMaintenance,
  fuelLogs: mockFuelLogs,
  expenses: mockExpenses,

  addVehicle: (vehicle) => set((state) => ({ 
    vehicles: [...state.vehicles, { ...vehicle, id: `v${Date.now()}` }] 
  })),
  updateVehicle: (id, vehicle) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...vehicle } : v)
  })),
  deleteVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.id !== id)
  })),

  addDriver: (driver) => set((state) => ({ 
    drivers: [...state.drivers, { ...driver, id: `d${Date.now()}` }] 
  })),
  updateDriver: (id, driver) => set((state) => ({
    drivers: state.drivers.map(d => d.id === id ? { ...d, ...driver } : d)
  })),
  deleteDriver: (id) => set((state) => ({
    drivers: state.drivers.filter(d => d.id !== id)
  })),

  createTrip: (trip) => set((state) => ({
    trips: [...state.trips, { ...trip, id: `t${Date.now()}`, status: 'Draft' }]
  })),
  updateTripStatus: (id, status) => set((state) => {
    const trip = state.trips.find(t => t.id === id);
    if (!trip) return state;

    let { vehicles, drivers } = state;

    if (status === 'Dispatched') {
      vehicles = vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' as VehicleStatus } : v);
      drivers = drivers.map(d => d.id === trip.driverId ? { ...d, status: 'On Trip' as DriverStatus } : d);
    } else if (status === 'Completed' || status === 'Cancelled') {
      vehicles = vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' as VehicleStatus } : v);
      drivers = drivers.map(d => d.id === trip.driverId ? { ...d, status: 'Available' as DriverStatus } : d);
    }

    return {
      trips: state.trips.map(t => t.id === id ? { ...t, status } : t),
      vehicles,
      drivers
    };
  }),

  createMaintenance: (log) => set((state) => {
    const newLog: Maintenance = { ...log, id: `m${Date.now()}`, status: 'Open' };
    const vehicles = state.vehicles.map(v => v.id === log.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v);
    return { maintenanceLogs: [...state.maintenanceLogs, newLog], vehicles };
  }),

  updateMaintenanceStatus: (id, status, actualCost) => set((state) => {
    const log = state.maintenanceLogs.find(m => m.id === id);
    if (!log) return state;

    let { vehicles } = state;
    
    if (status === 'Completed') {
      vehicles = vehicles.map(v => v.id === log.vehicleId ? { ...v, status: 'Available' as VehicleStatus } : v);
    }

    const expenses = [...state.expenses];
    if (status === 'Completed' && actualCost) {
      expenses.push({
        id: `e${Date.now()}`,
        date: new Date().toISOString(),
        amount: actualCost,
        category: 'Maintenance',
        description: `Maintenance: ${log.serviceType} - ${log.issue}`,
        vehicleId: log.vehicleId
      });
    }

    return {
      maintenanceLogs: state.maintenanceLogs.map(m => m.id === id ? { ...m, status, actualCost: actualCost ?? m.actualCost } : m),
      vehicles,
      expenses
    };
  }),

  addFuelLog: (log) => set((state) => {
    const newLog = { ...log, id: `f${Date.now()}` };
    const newExpense: Expense = {
      id: `e${Date.now()}`,
      date: log.date,
      amount: log.cost,
      category: 'Fuel',
      description: `Fuel: ${log.gallons} gal at ${log.location}`,
      vehicleId: log.vehicleId,
      driverId: log.driverId
    };
    return {
      fuelLogs: [...state.fuelLogs, newLog],
      expenses: [...state.expenses, newExpense]
    };
  }),

  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, { ...expense, id: `e${Date.now()}` }]
  }))
}));
