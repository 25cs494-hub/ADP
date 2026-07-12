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
  driverId?: string;
  date: string;
  quantity: number; // Liters
  cost: number;
  fuelStation?: string;
  fuelType: 'Diesel' | 'Petrol' | 'CNG' | 'Electric';
  notes?: string;
  odometer: number;
  expenseId: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: 'Maintenance' | 'Fuel' | 'Tolls' | 'Insurance' | 'Salary' | 'Other';
  description: string;
  vehicleId?: string;
  driverId?: string;
  fuelLogId?: string;
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
  
  addFuelLog: (log: Omit<FuelLog, 'id' | 'expenseId'>) => void;
  updateFuelLog: (id: string, log: Partial<FuelLog>) => void;
  deleteFuelLog: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
}

const mockVehicles: Vehicle[] = [
  { id: 'v1', registrationNumber: 'TR-1001', name: 'Volvo FH16', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 40000, currentOdometer: 17000, status: 'Available', acquisitionCost: 150000 },
  { id: 'v2', registrationNumber: 'TR-1002', name: 'Scania R500', model: '2022', type: 'Heavy Truck', maxLoadCapacity: 35000, currentOdometer: 46600, status: 'On Trip', acquisitionCost: 135000 },
  { id: 'v3', registrationNumber: 'VN-2001', name: 'Mercedes Sprinter', model: '2023', type: 'Van', maxLoadCapacity: 3500, currentOdometer: 9200, status: 'In Shop', acquisitionCost: 45000 },
];

const mockDrivers: Driver[] = [
  { id: 'd1', name: 'John Doe', licenseNumber: 'DL-12345', licenseCategory: 'CE', licenseExpiry: '2028-12-31', phoneNumber: '555-0101', email: 'john@example.com', safetyScore: 95, status: 'Available' },
  { id: 'd2', name: 'Jane Smith', licenseNumber: 'DL-67890', licenseCategory: 'CE', licenseExpiry: '2027-05-15', phoneNumber: '555-0102', email: 'jane@example.com', safetyScore: 88, status: 'On Trip' },
  { id: 'd3', name: 'Mike Johnson', licenseNumber: 'DL-34567', licenseCategory: 'B', licenseExpiry: '2025-01-10', phoneNumber: '555-0103', email: 'mike@example.com', safetyScore: 72, status: 'Suspended' },
];

const mockTrips: Trip[] = [
  { id: 't1', source: 'New York, NY', destination: 'Boston, MA', vehicleId: 'v2', driverId: 'd2', cargoWeight: 25000, plannedDistance: 215, status: 'Completed', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
];

const mockMaintenance: Maintenance[] = [
  { id: 'm1', vehicleId: 'v3', issue: 'Engine light ON', serviceType: 'Diagnostics', mechanic: 'Bob', estimatedCost: 150, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'Completed', actualCost: 180 }
];

const mockFuelLogs: FuelLog[] = [
  { id: 'f1', vehicleId: 'v1', driverId: 'd1', date: '2026-06-01T08:00:00.000Z', quantity: 200, cost: 360, fuelStation: 'Shell Station', fuelType: 'Diesel', odometer: 15000, expenseId: 'e_f1', notes: 'Initial fuel fill-up.' },
  { id: 'f2', vehicleId: 'v1', driverId: 'd1', date: '2026-06-15T12:30:00.000Z', quantity: 220, cost: 396, fuelStation: 'Shell Station', fuelType: 'Diesel', odometer: 16000, expenseId: 'e_f2' },
  { id: 'f3', vehicleId: 'v1', driverId: 'd1', date: '2026-07-01T10:15:00.000Z', quantity: 210, cost: 378, fuelStation: 'BP Station', fuelType: 'Diesel', odometer: 17000, expenseId: 'e_f3' },
  
  { id: 'f4', vehicleId: 'v2', driverId: 'd2', date: '2026-06-05T09:00:00.000Z', quantity: 180, cost: 324, fuelStation: 'Pilot Station', fuelType: 'Diesel', odometer: 45000, expenseId: 'e_f4' },
  { id: 'f5', vehicleId: 'v2', driverId: 'd2', date: '2026-06-20T14:45:00.000Z', quantity: 190, cost: 342, fuelStation: 'Pilot Station', fuelType: 'Diesel', odometer: 45800, expenseId: 'e_f5' },
  { id: 'f6', vehicleId: 'v2', driverId: 'd2', date: '2026-07-05T11:00:00.000Z', quantity: 185, cost: 333, fuelStation: 'Shell Station', fuelType: 'Diesel', odometer: 46600, expenseId: 'e_f6' },
  
  { id: 'f7', vehicleId: 'v3', driverId: 'd1', date: '2026-06-10T16:20:00.000Z', quantity: 60, cost: 108, fuelStation: 'Exxon Station', fuelType: 'Petrol', odometer: 8000, expenseId: 'e_f7' },
  { id: 'f8', vehicleId: 'v3', driverId: 'd2', date: '2026-06-25T10:00:00.000Z', quantity: 65, cost: 117, fuelStation: 'Exxon Station', fuelType: 'Petrol', odometer: 8600, expenseId: 'e_f8' },
  { id: 'f9', vehicleId: 'v3', driverId: 'd1', date: '2026-07-10T15:30:00.000Z', quantity: 62, cost: 111.6, fuelStation: 'Chevron Station', fuelType: 'Petrol', odometer: 9200, expenseId: 'e_f9' }
];

const mockExpenses: Expense[] = [
  { id: 'e1', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), amount: 180, category: 'Maintenance', description: 'Maintenance: Diagnostics - Engine light ON', vehicleId: 'v3' },
  { id: 'e_f1', date: '2026-06-01T08:00:00.000Z', amount: 360, category: 'Fuel', description: 'Fuel: 200 L (Diesel) at Shell Station', vehicleId: 'v1', driverId: 'd1', fuelLogId: 'f1' },
  { id: 'e_f2', date: '2026-06-15T12:30:00.000Z', amount: 396, category: 'Fuel', description: 'Fuel: 220 L (Diesel) at Shell Station', vehicleId: 'v1', driverId: 'd1', fuelLogId: 'f2' },
  { id: 'e_f3', date: '2026-07-01T10:15:00.000Z', amount: 378, category: 'Fuel', description: 'Fuel: 210 L (Diesel) at BP Station', vehicleId: 'v1', driverId: 'd1', fuelLogId: 'f3' },
  { id: 'e_f4', date: '2026-06-05T09:00:00.000Z', amount: 324, category: 'Fuel', description: 'Fuel: 180 L (Diesel) at Pilot Station', vehicleId: 'v2', driverId: 'd2', fuelLogId: 'f4' },
  { id: 'e_f5', date: '2026-06-20T14:45:00.000Z', amount: 342, category: 'Fuel', description: 'Fuel: 190 L (Diesel) at Pilot Station', vehicleId: 'v2', driverId: 'd2', fuelLogId: 'f5' },
  { id: 'e_f6', date: '2026-07-05T11:00:00.000Z', amount: 333, category: 'Fuel', description: 'Fuel: 185 L (Diesel) at Shell Station', vehicleId: 'v2', driverId: 'd2', fuelLogId: 'f6' },
  { id: 'e_f7', date: '2026-06-10T16:20:00.000Z', amount: 108, category: 'Fuel', description: 'Fuel: 60 L (Petrol) at Exxon Station', vehicleId: 'v3', driverId: 'd1', fuelLogId: 'f7' },
  { id: 'e_f8', date: '2026-06-25T10:00:00.000Z', amount: 117, category: 'Fuel', description: 'Fuel: 65 L (Petrol) at Exxon Station', vehicleId: 'v3', driverId: 'd2', fuelLogId: 'f8' },
  { id: 'e_f9', date: '2026-07-10T15:30:00.000Z', amount: 111.6, category: 'Fuel', description: 'Fuel: 62 L (Petrol) at Chevron Station', vehicleId: 'v3', driverId: 'd1', fuelLogId: 'f9' }
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
    const fuelLogId = `f${Date.now()}`;
    const expenseId = `e${Date.now()}`;
    const newLog: FuelLog = { ...log, id: fuelLogId, expenseId };
    const newExpense: Expense = {
      id: expenseId,
      date: log.date,
      amount: log.cost,
      category: 'Fuel',
      description: `Fuel: ${log.quantity} L (${log.fuelType}) at ${log.fuelStation || 'Station'}`,
      vehicleId: log.vehicleId,
      driverId: log.driverId,
      fuelLogId: fuelLogId
    };
    return {
      fuelLogs: [...state.fuelLogs, newLog],
      expenses: [...state.expenses, newExpense]
    };
  }),

  updateFuelLog: (id, updatedLog) => set((state) => {
    const fuelLogs = state.fuelLogs.map((log) => {
      if (log.id === id) {
        return { ...log, ...updatedLog } as FuelLog;
      }
      return log;
    });

    const log = state.fuelLogs.find(l => l.id === id);
    if (!log) return { fuelLogs };

    const expenses = state.expenses.map((exp) => {
      if (exp.id === log.expenseId) {
        return {
          ...exp,
          date: updatedLog.date ?? exp.date,
          amount: updatedLog.cost ?? exp.amount,
          description: `Fuel: ${updatedLog.quantity ?? log.quantity} L (${updatedLog.fuelType ?? log.fuelType}) at ${(updatedLog.fuelStation ?? log.fuelStation) || 'Station'}`,
          vehicleId: updatedLog.vehicleId ?? exp.vehicleId,
          driverId: updatedLog.driverId ?? exp.driverId
        };
      }
      return exp;
    });

    return { fuelLogs, expenses };
  }),

  deleteFuelLog: (id) => set((state) => {
    const log = state.fuelLogs.find(l => l.id === id);
    if (!log) return state;

    return {
      fuelLogs: state.fuelLogs.filter(l => l.id !== id),
      expenses: state.expenses.filter(e => e.id !== log.expenseId)
    };
  }),

  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, { ...expense, id: `e${Date.now()}` }]
  }))
}));
