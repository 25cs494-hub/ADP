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
<<<<<<< HEAD
  { id: 'v1', registrationNumber: 'TR-1001', name: 'Volvo FH16', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 40000, currentOdometer: 17000, status: 'Available', acquisitionCost: 150000 },
  { id: 'v2', registrationNumber: 'TR-1002', name: 'Scania R500', model: '2022', type: 'Heavy Truck', maxLoadCapacity: 35000, currentOdometer: 46600, status: 'On Trip', acquisitionCost: 135000 },
  { id: 'v3', registrationNumber: 'VN-2001', name: 'Mercedes Sprinter', model: '2023', type: 'Van', maxLoadCapacity: 3500, currentOdometer: 9200, status: 'In Shop', acquisitionCost: 45000 },
=======
  { id: 'v1', registrationNumber: 'TR-1001', name: 'Volvo FH16', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 40000, currentOdometer: 15000, acquisitionCost: 150000, status: 'Available' },
  { id: 'v2', registrationNumber: 'TR-1002', name: 'Scania R500', model: '2022', type: 'Heavy Truck', maxLoadCapacity: 35000, currentOdometer: 45000, acquisitionCost: 140000, status: 'On Trip' },
  { id: 'v3', registrationNumber: 'VN-2001', name: 'Mercedes Sprinter', model: '2023', type: 'Van', maxLoadCapacity: 3500, currentOdometer: 8000, acquisitionCost: 55000, status: 'In Shop' },
  { id: 'v4', registrationNumber: 'TR-1003', name: 'Ford F-550', model: '2021', type: 'Medium Truck', maxLoadCapacity: 15000, currentOdometer: 62000, acquisitionCost: 85000, status: 'Available' },
  { id: 'v5', registrationNumber: 'TR-1004', name: 'Isuzu NRR', model: '2022', type: 'Medium Truck', maxLoadCapacity: 12000, currentOdometer: 38000, acquisitionCost: 75000, status: 'Available' },
  { id: 'v6', registrationNumber: 'TR-1005', name: 'Kenworth T680', model: '2023', type: 'Heavy Truck', maxLoadCapacity: 42000, currentOdometer: 12000, acquisitionCost: 165000, status: 'On Trip' },
  { id: 'v7', registrationNumber: 'VN-2002', name: 'Ram ProMaster', model: '2022', type: 'Van', maxLoadCapacity: 4000, currentOdometer: 29000, acquisitionCost: 48000, status: 'Available' },
  { id: 'v8', registrationNumber: 'VN-2003', name: 'Chevrolet Express', model: '2020', type: 'Van', maxLoadCapacity: 3800, currentOdometer: 95000, acquisitionCost: 42000, status: 'Retired' }
>>>>>>> 73f7124 (updated report)
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
<<<<<<< HEAD
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
=======
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
  { id: 'f1', vehicleId: 'v1', driverId: 'd1', date: '2026-05-10T09:30:00.000Z', gallons: 60, cost: 210, location: 'Pilot Station #12', odometer: 13000 },
  { id: 'f2', vehicleId: 'v2', driverId: 'd2', date: '2026-05-11T12:00:00.000Z', gallons: 85, cost: 300, location: 'Loves Travel Stop', odometer: 41000 },
  { id: 'f3', vehicleId: 'v4', driverId: 'd4', date: '2026-05-20T17:00:00.000Z', gallons: 40, cost: 145, location: 'Pilot Station #15', odometer: 61000 },
  { id: 'f4', vehicleId: 'v5', driverId: 'd5', date: '2026-06-05T12:00:00.000Z', gallons: 50, cost: 175, location: 'TA Express', odometer: 36000 },
  { id: 'f5', vehicleId: 'v1', driverId: 'd1', date: '2026-06-16T11:30:00.000Z', gallons: 65, cost: 230, location: 'Pilot Station #12', odometer: 14000 },
  { id: 'f6', vehicleId: 'v6', driverId: 'd6', date: '2026-07-12T14:00:00.000Z', gallons: 75, cost: 270, location: 'Loves Travel Stop', odometer: 12000 },
  { id: 'f7', vehicleId: 'v2', driverId: 'd2', date: '2026-07-11T16:00:00.000Z', gallons: 80, cost: 290, location: 'Speedway', odometer: 44500 },
  { id: 'f8', vehicleId: 'v3', driverId: 'd7', date: '2026-06-28T14:00:00.000Z', gallons: 15, cost: 55, location: 'Shell Townsville', odometer: 7900 },
  { id: 'f9', vehicleId: 'v7', driverId: 'd7', date: '2026-07-02T16:30:00.000Z', gallons: 18, cost: 65, location: 'BP Travel Center', odometer: 28500 },
  { id: 'f10', vehicleId: 'v4', driverId: 'd4', date: '2026-07-08T11:00:00.000Z', gallons: 45, cost: 165, location: 'Pilot Station #12', odometer: 61800 },
  { id: 'f11', vehicleId: 'v8', driverId: 'd8', date: '2026-05-02T12:00:00.000Z', gallons: 20, cost: 72, location: 'Shell Miami', odometer: 94800 }
];

const mockExpenses: Expense[] = [
  { id: 'e1', date: '2026-06-12T10:00:00.000Z', amount: 180, category: 'Maintenance', description: 'Maintenance: Diagnostics - Engine light ON', vehicleId: 'v3' },
  { id: 'e2', date: '2026-05-12T08:00:00.000Z', amount: 450, category: 'Maintenance', description: 'Maintenance: Brakes - Brake pads replacement', vehicleId: 'v2' },
  { id: 'e3', date: '2026-06-18T09:00:00.000Z', amount: 200, category: 'Maintenance', description: 'Maintenance: Oil Change - Scheduled oil change', vehicleId: 'v1' },
  { id: 'e4', date: '2026-05-28T11:00:00.000Z', amount: 580, category: 'Maintenance', description: 'Maintenance: Tires - Tire replacement', vehicleId: 'v5' },
  { id: 'e5', date: '2026-05-04T10:00:00.000Z', amount: 1400, category: 'Maintenance', description: 'Maintenance: Transmission - Transmission noise', vehicleId: 'v8' },
  { id: 'e6', date: '2026-05-10T09:30:00.000Z', amount: 210, category: 'Fuel', description: 'Fuel: 60 gal at Pilot Station #12', vehicleId: 'v1', driverId: 'd1' },
  { id: 'e7', date: '2026-05-11T12:00:00.000Z', amount: 300, category: 'Fuel', description: 'Fuel: 85 gal at Loves Travel Stop', vehicleId: 'v2', driverId: 'd2' },
  { id: 'e8', date: '2026-05-20T17:00:00.000Z', amount: 145, category: 'Fuel', description: 'Fuel: 40 gal at Pilot Station #15', vehicleId: 'v4', driverId: 'd4' },
  { id: 'e9', date: '2026-06-05T12:00:00.000Z', amount: 175, category: 'Fuel', description: 'Fuel: 50 gal at TA Express', vehicleId: 'v5', driverId: 'd5' },
  { id: 'e10', date: '2026-06-16T11:30:00.000Z', amount: 230, category: 'Fuel', description: 'Fuel: 65 gal at Pilot Station #12', vehicleId: 'v1', driverId: 'd1' },
  { id: 'e11', date: '2026-07-12T14:00:00.000Z', amount: 270, category: 'Fuel', description: 'Fuel: 75 gal at Loves Travel Stop', vehicleId: 'v6', driverId: 'd6' },
  { id: 'e12', date: '2026-07-11T16:00:00.000Z', amount: 290, category: 'Fuel', description: 'Fuel: 80 gal at Speedway', vehicleId: 'v2', driverId: 'd2' },
  { id: 'e13', date: '2026-06-28T14:00:00.000Z', amount: 55, category: 'Fuel', description: 'Fuel: 15 gal at Shell Townsville', vehicleId: 'v3', driverId: 'd7' },
  { id: 'e14', date: '2026-07-02T16:30:00.000Z', amount: 65, category: 'Fuel', description: 'Fuel: 18 gal at BP Travel Center', vehicleId: 'v7', driverId: 'd7' },
  { id: 'e15', date: '2026-07-08T11:00:00.000Z', amount: 165, category: 'Fuel', description: 'Fuel: 45 gal at Pilot Station #12', vehicleId: 'v4', driverId: 'd4' },
  { id: 'e16', date: '2026-05-02T12:00:00.000Z', amount: 72, category: 'Fuel', description: 'Fuel: 20 gal at Shell Miami', vehicleId: 'v8', driverId: 'd8' },
  { id: 'e17', date: '2026-05-30T17:00:00.000Z', amount: 3500, category: 'Salary', description: 'Driver Salaries: May 2026', driverId: 'd1' },
  { id: 'e18', date: '2026-06-30T17:00:00.000Z', amount: 3700, category: 'Salary', description: 'Driver Salaries: June 2026', driverId: 'd2' },
  { id: 'e19', date: '2026-05-01T08:00:00.000Z', amount: 1200, category: 'Insurance', description: 'Fleet Insurance Q2', vehicleId: 'v1' },
  { id: 'e20', date: '2026-06-01T08:00:00.000Z', amount: 1200, category: 'Insurance', description: 'Fleet Insurance Q2 Refill', vehicleId: 'v2' },
  { id: 'e21', date: '2026-05-15T12:00:00.000Z', amount: 45, category: 'Tolls', description: 'NY/NJ EZ-Pass Monthly Bill', vehicleId: 'v2' },
  { id: 'e22', date: '2026-06-15T12:00:00.000Z', amount: 55, category: 'Tolls', description: 'NY/NJ EZ-Pass Monthly Bill', vehicleId: 'v2' },
  { id: 'e23', date: '2026-07-05T12:00:00.000Z', amount: 65, category: 'Tolls', description: 'EZ-Pass Toll Charge', vehicleId: 'v6' },
  { id: 'e24', date: '2026-05-18T10:00:00.000Z', amount: 90, category: 'Other', description: 'Office supplies & cleaning' },
  { id: 'e25', date: '2026-06-20T14:00:00.000Z', amount: 120, category: 'Other', description: 'Dispatch software licensing fee' }
>>>>>>> 73f7124 (updated report)
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
