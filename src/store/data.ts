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
  region?: 'East' | 'West' | 'Midwest' | 'South';
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
  { id: 'v1', registrationNumber: 'TR-1001', name: 'Volvo FH16', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 40000, currentOdometer: 15000, acquisitionCost: 150000, status: 'Available' },
  { id: 'v2', registrationNumber: 'TR-1002', name: 'Scania R500', model: '2022', type: 'Heavy Truck', maxLoadCapacity: 35000, currentOdometer: 45000, acquisitionCost: 140000, status: 'On Trip' },
  { id: 'v3', registrationNumber: 'VN-2001', name: 'Mercedes Sprinter', model: '2023', type: 'Van', maxLoadCapacity: 3500, currentOdometer: 8000, acquisitionCost: 55000, status: 'In Shop' },
  { id: 'v4', registrationNumber: 'TR-1003', name: 'Ford F-550', model: '2021', type: 'Medium Truck', maxLoadCapacity: 15000, currentOdometer: 62000, acquisitionCost: 85000, status: 'Available' },
  { id: 'v5', registrationNumber: 'TR-1004', name: 'Isuzu NRR', model: '2022', type: 'Medium Truck', maxLoadCapacity: 12000, currentOdometer: 38000, acquisitionCost: 75000, status: 'Available' },
  { id: 'v6', registrationNumber: 'TR-1005', name: 'Kenworth T680', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 42000, currentOdometer: 12000, acquisitionCost: 165000, status: 'On Trip' },
  { id: 'v7', registrationNumber: 'VN-2002', name: 'Ram ProMaster', model: '2022', type: 'Van', maxLoadCapacity: 4000, currentOdometer: 29000, acquisitionCost: 48000, status: 'Available' },
  { id: 'v8', registrationNumber: 'VN-2003', name: 'Chevrolet Express', model: '2020', type: 'Van', maxLoadCapacity: 3800, currentOdometer: 95000, acquisitionCost: 42000, status: 'Retired' }
];

const mockDrivers: Driver[] = [
  { id: 'd1', name: 'John Doe', licenseNumber: 'DL-12345', licenseCategory: 'CE', licenseExpiry: '2028-12-31', phoneNumber: '555-0101', email: 'john@example.com', safetyScore: 95, status: 'Available' },
  { id: 'd2', name: 'Jane Smith', licenseNumber: 'DL-67890', licenseCategory: 'CE', licenseExpiry: '2027-05-15', phoneNumber: '555-0102', email: 'jane@example.com', safetyScore: 88, status: 'On Trip' },
  { id: 'd3', name: 'Mike Johnson', licenseNumber: 'DL-34567', licenseCategory: 'B', licenseExpiry: '2025-01-10', phoneNumber: '555-0103', email: 'mike@example.com', safetyScore: 72, status: 'Suspended' },
  { id: 'd4', name: 'Sarah Conner', licenseNumber: 'DL-98765', licenseCategory: 'C', licenseExpiry: '2029-08-20', phoneNumber: '555-0104', email: 'sarah@example.com', safetyScore: 92, status: 'Available' },
  { id: 'd5', name: 'David Miller', licenseNumber: 'DL-45612', licenseCategory: 'CE', licenseExpiry: '2026-08-15', phoneNumber: '555-0105', email: 'david@example.com', safetyScore: 85, status: 'Available' },
  { id: 'd6', name: 'Robert Chen', licenseNumber: 'DL-78923', licenseCategory: 'C', licenseExpiry: '2027-11-04', phoneNumber: '555-0106', email: 'robert@example.com', safetyScore: 90, status: 'On Trip' },
  { id: 'd7', name: 'Emily Davis', licenseNumber: 'DL-32145', licenseCategory: 'B', licenseExpiry: '2028-03-25', phoneNumber: '555-0107', email: 'emily@example.com', safetyScore: 96, status: 'Available' },
  { id: 'd8', name: 'James Wilson', licenseNumber: 'DL-65478', licenseCategory: 'CE', licenseExpiry: '2024-06-12', phoneNumber: '555-0108', email: 'james@example.com', safetyScore: 68, status: 'Off Duty' }
];

const mockTrips: Trip[] = [
  { id: 't1', source: 'New York, NY', destination: 'Boston, MA', vehicleId: 'v2', driverId: 'd2', cargoWeight: 25000, plannedDistance: 215, status: 'Dispatched', date: '2026-07-11T10:00:00.000Z', region: 'East' },
  { id: 't2', source: 'Chicago, IL', destination: 'Detroit, MI', vehicleId: 'v1', driverId: 'd1', cargoWeight: 32000, plannedDistance: 280, status: 'Completed', date: '2026-06-15T08:00:00.000Z', region: 'Midwest' },
  { id: 't3', source: 'Los Angeles, CA', destination: 'Las Vegas, NV', vehicleId: 'v6', driverId: 'd6', cargoWeight: 18000, plannedDistance: 270, status: 'Dispatched', date: '2026-07-12T09:00:00.000Z', region: 'West' },
  { id: 't4', source: 'Houston, TX', destination: 'Dallas, TX', vehicleId: 'v4', driverId: 'd4', cargoWeight: 12000, plannedDistance: 240, status: 'Completed', date: '2026-05-20T14:30:00.000Z', region: 'South' },
  { id: 't5', source: 'Atlanta, GA', destination: 'Orlando, FL', vehicleId: 'v5', driverId: 'd5', cargoWeight: 8000, plannedDistance: 440, status: 'Completed', date: '2026-06-05T07:15:00.000Z', region: 'South' },
  { id: 't6', source: 'Philadelphia, PA', destination: 'New York, NY', vehicleId: 'v3', driverId: 'd7', cargoWeight: 2500, plannedDistance: 95, status: 'Completed', date: '2026-06-28T11:00:00.000Z', region: 'East' },
  { id: 't7', source: 'San Francisco, CA', destination: 'Seattle, WA', vehicleId: 'v2', driverId: 'd2', cargoWeight: 28000, plannedDistance: 800, status: 'Completed', date: '2026-05-10T06:00:00.000Z', region: 'West' },
  { id: 't8', source: 'Denver, CO', destination: 'Salt Lake City, UT', vehicleId: 'v1', driverId: 'd1', cargoWeight: 35000, plannedDistance: 520, status: 'Completed', date: '2026-06-20T10:00:00.000Z', region: 'West' },
  { id: 't9', source: 'Boston, MA', destination: 'New York, NY', vehicleId: 'v7', driverId: 'd7', cargoWeight: 3000, plannedDistance: 215, status: 'Completed', date: '2026-07-02T13:00:00.000Z', region: 'East' },
  { id: 't10', source: 'Chicago, IL', destination: 'Minneapolis, MN', vehicleId: 'v4', driverId: 'd4', cargoWeight: 14000, plannedDistance: 410, status: 'Completed', date: '2026-07-08T08:00:00.000Z', region: 'Midwest' },
  { id: 't11', source: 'Miami, FL', destination: 'Tampa, FL', vehicleId: 'v8', driverId: 'd8', cargoWeight: 3100, plannedDistance: 280, status: 'Completed', date: '2026-05-02T09:00:00.000Z', region: 'South' },
  { id: 't12', source: 'New York, NY', destination: 'Washington, DC', vehicleId: 'v3', driverId: 'd5', cargoWeight: 2800, plannedDistance: 225, status: 'Cancelled', date: '2026-06-12T15:00:00.000Z', region: 'East' }
];

const mockMaintenance: Maintenance[] = [
  { id: 'm1', vehicleId: 'v3', issue: 'Engine light ON', serviceType: 'Diagnostics', mechanic: 'Bob', estimatedCost: 150, actualCost: 180, date: '2026-06-12T10:00:00.000Z', status: 'Completed' },
  { id: 'm2', vehicleId: 'v2', issue: 'Brake pads replacement', serviceType: 'Brakes', mechanic: 'Bob', estimatedCost: 400, actualCost: 450, date: '2026-05-12T08:00:00.000Z', status: 'Completed' },
  { id: 'm3', vehicleId: 'v1', issue: 'Scheduled oil change', serviceType: 'Oil Change', mechanic: 'Alice', estimatedCost: 200, actualCost: 200, date: '2026-06-18T09:00:00.000Z', status: 'Completed' },
  { id: 'm4', vehicleId: 'v3', issue: 'AC cooling issue', serviceType: 'HVAC', mechanic: 'Alice', estimatedCost: 300, date: '2026-07-12T09:30:00.000Z', status: 'Open' },
  { id: 'm5', vehicleId: 'v5', issue: 'Tire replacement', serviceType: 'Tires', mechanic: 'Bob', estimatedCost: 600, actualCost: 580, date: '2026-05-28T11:00:00.000Z', status: 'Completed' },
  { id: 'm6', vehicleId: 'v8', issue: 'Transmission noise', serviceType: 'Transmission', mechanic: 'Bob', estimatedCost: 1200, actualCost: 1400, date: '2026-05-04T10:00:00.000Z', status: 'Completed' }
];

const mockFuelLogs: FuelLog[] = [
  { id: 'f1', vehicleId: 'v1', driverId: 'd1', date: '2026-05-10T09:30:00.000Z', quantity: 227, cost: 210, fuelStation: 'Pilot Station #12', fuelType: 'Diesel', odometer: 13000, expenseId: 'e6' },
  { id: 'f2', vehicleId: 'v2', driverId: 'd2', date: '2026-05-11T12:00:00.000Z', quantity: 322, cost: 300, fuelStation: 'Loves Travel Stop', fuelType: 'Diesel', odometer: 41000, expenseId: 'e7' },
  { id: 'f3', vehicleId: 'v4', driverId: 'd4', date: '2026-05-20T17:00:00.000Z', quantity: 151, cost: 145, fuelStation: 'Pilot Station #15', fuelType: 'Diesel', odometer: 61000, expenseId: 'e8' },
  { id: 'f4', vehicleId: 'v5', driverId: 'd5', date: '2026-06-05T12:00:00.000Z', quantity: 189, cost: 175, fuelStation: 'TA Express', fuelType: 'Diesel', odometer: 36000, expenseId: 'e9' },
  { id: 'f5', vehicleId: 'v1', driverId: 'd1', date: '2026-06-16T11:30:00.000Z', quantity: 246, cost: 230, fuelStation: 'Pilot Station #12', fuelType: 'Diesel', odometer: 14000, expenseId: 'e10' },
  { id: 'f6', vehicleId: 'v6', driverId: 'd6', date: '2026-07-12T14:00:00.000Z', quantity: 284, cost: 270, fuelStation: 'Loves Travel Stop', fuelType: 'Diesel', odometer: 12000, expenseId: 'e11' },
  { id: 'f7', vehicleId: 'v2', driverId: 'd2', date: '2026-07-11T16:00:00.000Z', quantity: 303, cost: 290, fuelStation: 'Speedway', fuelType: 'Diesel', odometer: 44500, expenseId: 'e12' },
  { id: 'f8', vehicleId: 'v3', driverId: 'd7', date: '2026-06-28T14:00:00.000Z', quantity: 57, cost: 55, fuelStation: 'Shell Townsville', fuelType: 'Petrol', odometer: 7900, expenseId: 'e13' },
  { id: 'f9', vehicleId: 'v7', driverId: 'd7', date: '2026-07-02T16:30:00.000Z', quantity: 68, cost: 65, fuelStation: 'BP Travel Center', fuelType: 'Diesel', odometer: 28500, expenseId: 'e14' },
  { id: 'f10', vehicleId: 'v4', driverId: 'd4', date: '2026-07-08T11:00:00.000Z', quantity: 170, cost: 165, fuelStation: 'Pilot Station #12', fuelType: 'Diesel', odometer: 61800, expenseId: 'e15' },
  { id: 'f11', vehicleId: 'v8', driverId: 'd8', date: '2026-05-02T12:00:00.000Z', quantity: 76, cost: 72, fuelStation: 'Shell Miami', fuelType: 'Diesel', odometer: 94800, expenseId: 'e16' }
];

const mockExpenses: Expense[] = [
  { id: 'e1', date: '2026-06-12T10:00:00.000Z', amount: 180, category: 'Maintenance', description: 'Maintenance: Diagnostics - Engine light ON', vehicleId: 'v3' },
  { id: 'e2', date: '2026-05-12T08:00:00.000Z', amount: 450, category: 'Maintenance', description: 'Maintenance: Brakes - Brake pads replacement', vehicleId: 'v2' },
  { id: 'e3', date: '2026-06-18T09:00:00.000Z', amount: 200, category: 'Maintenance', description: 'Maintenance: Oil Change - Scheduled oil change', vehicleId: 'v1' },
  { id: 'e4', date: '2026-05-28T11:00:00.000Z', amount: 580, category: 'Maintenance', description: 'Maintenance: Tires - Tire replacement', vehicleId: 'v5' },
  { id: 'e5', date: '2026-05-04T10:00:00.000Z', amount: 1400, category: 'Maintenance', description: 'Maintenance: Transmission - Transmission noise', vehicleId: 'v8' },
  { id: 'e6', date: '2026-05-10T09:30:00.000Z', amount: 210, category: 'Fuel', description: 'Fuel: 227 L (Diesel) at Pilot Station #12', vehicleId: 'v1', driverId: 'd1' },
  { id: 'e7', date: '2026-05-11T12:00:00.000Z', amount: 300, category: 'Fuel', description: 'Fuel: 322 L (Diesel) at Loves Travel Stop', vehicleId: 'v2', driverId: 'd2' },
  { id: 'e8', date: '2026-05-20T17:00:00.000Z', amount: 145, category: 'Fuel', description: 'Fuel: 151 L (Diesel) at Pilot Station #15', vehicleId: 'v4', driverId: 'd4' },
  { id: 'e9', date: '2026-06-05T12:00:00.000Z', amount: 175, category: 'Fuel', description: 'Fuel: 189 L (Diesel) at TA Express', vehicleId: 'v5', driverId: 'd5' },
  { id: 'e10', date: '2026-06-16T11:30:00.000Z', amount: 230, category: 'Fuel', description: 'Fuel: 246 L (Diesel) at Pilot Station #12', vehicleId: 'v1', driverId: 'd1' },
  { id: 'e11', date: '2026-07-12T14:00:00.000Z', amount: 270, category: 'Fuel', description: 'Fuel: 284 L (Diesel) at Loves Travel Stop', vehicleId: 'v6', driverId: 'd6' },
  { id: 'e12', date: '2026-07-11T16:00:00.000Z', amount: 290, category: 'Fuel', description: 'Fuel: 303 L (Diesel) at Speedway', vehicleId: 'v2', driverId: 'd2' },
  { id: 'e13', date: '2026-06-28T14:00:00.000Z', amount: 55, category: 'Fuel', description: 'Fuel: 57 L (Petrol) at Shell Townsville', vehicleId: 'v3', driverId: 'd7' },
  { id: 'e14', date: '2026-07-02T16:30:00.000Z', amount: 65, category: 'Fuel', description: 'Fuel: 68 L (Diesel) at BP Travel Center', vehicleId: 'v7', driverId: 'd7' },
  { id: 'e15', date: '2026-07-08T11:00:00.000Z', amount: 165, category: 'Fuel', description: 'Fuel: 170 L (Diesel) at Pilot Station #12', vehicleId: 'v4', driverId: 'd4' },
  { id: 'e16', date: '2026-05-02T12:00:00.000Z', amount: 72, category: 'Fuel', description: 'Fuel: 76 L (Diesel) at Shell Miami', vehicleId: 'v8', driverId: 'd8' },
  { id: 'e17', date: '2026-05-30T17:00:00.000Z', amount: 3500, category: 'Salary', description: 'Driver Salaries: May 2026', driverId: 'd1' },
  { id: 'e18', date: '2026-06-30T17:00:00.000Z', amount: 3700, category: 'Salary', description: 'Driver Salaries: June 2026', driverId: 'd2' },
  { id: 'e19', date: '2026-05-01T08:00:00.000Z', amount: 1200, category: 'Insurance', description: 'Fleet Insurance Q2', vehicleId: 'v1' },
  { id: 'e20', date: '2026-06-01T08:00:00.000Z', amount: 1200, category: 'Insurance', description: 'Fleet Insurance Q2 Refill', vehicleId: 'v2' },
  { id: 'e21', date: '2026-05-15T12:00:00.000Z', amount: 45, category: 'Tolls', description: 'NY/NJ EZ-Pass Monthly Bill', vehicleId: 'v2' },
  { id: 'e22', date: '2026-06-15T12:00:00.000Z', amount: 55, category: 'Tolls', description: 'NY/NJ EZ-Pass Monthly Bill', vehicleId: 'v2' },
  { id: 'e23', date: '2026-07-05T12:00:00.000Z', amount: 65, category: 'Tolls', description: 'EZ-Pass Toll Charge', vehicleId: 'v6' },
  { id: 'e24', date: '2026-05-18T10:00:00.000Z', amount: 90, category: 'Other', description: 'Office supplies & cleaning' },
  { id: 'e25', date: '2026-06-20T14:00:00.000Z', amount: 120, category: 'Other', description: 'Dispatch software licensing fee' }
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
