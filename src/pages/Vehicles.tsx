import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { Vehicle, VehicleStatus } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Eye, Truck, Gauge, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Vehicles() {
  const { vehicles, fuelLogs, trips, maintenanceLogs, addVehicle, updateVehicle, deleteVehicle } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    status: 'Available',
    type: 'Truck',
    acquisitionCost: 0
  });

  const filteredVehicles = vehicles.filter(v => 
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      updateVehicle(formData.id, formData);
      toast.success('Vehicle updated successfully');
    } else {
      addVehicle(formData as Omit<Vehicle, 'id'>);
      toast.success('Vehicle added successfully');
    }
    setIsAddOpen(false);
    setFormData({ status: 'Available', type: 'Truck', acquisitionCost: 0 });
  };

  const statusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'On Trip': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Shop': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Retired': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">Manage your fleet, track status, record acquisition costs, and analyze ROI.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => setFormData({ status: 'Available', type: 'Truck', acquisitionCost: 0 })}>
              <Plus className="w-4 h-4 mr-2"/> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Edit' : 'Add'} Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Number</label>
                <Input required value={formData.registrationNumber || ''} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name / Alias</label>
                <Input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Year</label>
                  <Input required value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Input required value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity (kg)</label>
                  <Input type="number" required value={formData.maxLoadCapacity || ''} onChange={e => setFormData({...formData, maxLoadCapacity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Odometer</label>
                  <Input type="number" required value={formData.currentOdometer || ''} onChange={e => setFormData({...formData, currentOdometer: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Acquisition Cost ($)</label>
                <Input type="number" required min="1" placeholder="e.g. 120000" value={formData.acquisitionCost || ''} onChange={e => setFormData({...formData, acquisitionCost: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit">{formData.id ? 'Save Changes' : 'Add Vehicle'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by registration or name..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Vehicle Info</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                // Calculate dynamic metrics for ROI cell
                const vehicleFuelLogs = fuelLogs.filter(log => log.vehicleId === vehicle.id);
                const totalFuelCost = vehicleFuelLogs.reduce((sum, log) => sum + log.cost, 0);
                
                const vehicleMaintenance = maintenanceLogs.filter(m => m.vehicleId === vehicle.id);
                const maintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + (m.actualCost ?? m.estimatedCost ?? 0), 0);
                
                const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
                const totalDistance = vehicleTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
                const revenue = totalDistance * 2.50;
                
                const acqCost = vehicle.acquisitionCost || 0;
                const roiValue = acqCost > 0 ? (revenue - (totalFuelCost + maintenanceCost)) / acqCost : 0;
                const roiPercentage = roiValue * 100;

                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{vehicle.name}</span>
                        <span className="text-xs text-muted-foreground">{vehicle.model} • {vehicle.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.maxLoadCapacity.toLocaleString()} kg</TableCell>
                    <TableCell className="font-semibold text-sm">
                      {acqCost > 0 ? (
                        <span className={roiPercentage >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                          {roiPercentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setIsViewOpen(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setFormData(vehicle);
                          setIsAddOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          if(confirm('Are you sure you want to delete this vehicle?')) {
                            deleteVehicle(vehicle.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredVehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Vehicle Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Truck className="w-5 h-5 text-primary" /> Vehicle Details – {selectedVehicle?.registrationNumber}
            </DialogTitle>
            <DialogDescription>
              Performance stats, fuel management metrics, and calculated ROI.
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (() => {
            const v = selectedVehicle;
            const vehicleFuelLogs = fuelLogs.filter(log => log.vehicleId === v.id);
            const totalFuelConsumed = vehicleFuelLogs.reduce((sum, log) => sum + log.quantity, 0);
            const totalFuelCost = vehicleFuelLogs.reduce((sum, log) => sum + log.cost, 0);
            
            const vehicleMaintenance = maintenanceLogs.filter(m => m.vehicleId === v.id);
            const maintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + (m.actualCost ?? m.estimatedCost ?? 0), 0);
            
            const vehicleTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
            const totalDistance = vehicleTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
            const revenue = totalDistance * 2.50;
            
            const acqCost = v.acquisitionCost || 0;
            const roiVal = acqCost > 0 ? (revenue - (totalFuelCost + maintenanceCost)) / acqCost : 0;
            const roiPct = roiVal * 100;
            
            const chronSorted = [...vehicleFuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const latestFuelEntry = chronSorted[chronSorted.length - 1];
            
            let eff = 0;
            if (chronSorted.length >= 2) {
              const dist = chronSorted[chronSorted.length - 1].odometer - chronSorted[0].odometer;
              const fuel = chronSorted.slice(1).reduce((sum, l) => sum + l.quantity, 0);
              if (fuel > 0) eff = dist / fuel;
            }

            return (
              <div className="space-y-4 pt-4 border-t text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <span className="text-xs text-muted-foreground font-semibold block uppercase">Registration</span>
                    <span className="font-bold text-base mt-1 block">{v.registrationNumber}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <span className="text-xs text-muted-foreground font-semibold block uppercase">Model & Type</span>
                    <span className="font-bold text-base mt-1 block truncate">{v.model} • {v.type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <span className="text-xs text-muted-foreground font-semibold block uppercase">Current Odometer</span>
                    <span className="font-bold text-base mt-1 block flex items-center gap-1">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      {v.currentOdometer.toLocaleString()} km
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <span className="text-xs text-muted-foreground font-semibold block uppercase">Acquisition Cost</span>
                    <span className="font-bold text-base mt-1 block">
                      {acqCost > 0 ? `$${acqCost.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2 border-b pb-1 text-sm uppercase tracking-wider">Financial & ROI Metrics</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-md border text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Est. Revenue</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-md border text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Operating Cost</span>
                    <span className="font-semibold text-destructive text-sm mt-0.5 block">${(totalFuelCost + maintenanceCost).toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-md border text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Calculated ROI</span>
                    <span className={`font-bold text-sm mt-0.5 block ${roiPct >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      {acqCost > 0 ? `${roiPct.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2 border-b pb-1 text-sm uppercase tracking-wider">Fuel Statistics</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Total Fuel Consumed:</span>
                    <span className="font-semibold">{totalFuelConsumed.toLocaleString(undefined, {minimumFractionDigits: 1})} Liters</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Total Fuel Cost:</span>
                    <span className="font-semibold text-destructive">${totalFuelCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Average Fuel Efficiency:</span>
                    <span className="font-semibold text-emerald-600">{eff > 0 ? `${eff.toFixed(2)} km/L` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Info className="w-3.5 h-3.5"/> Latest Fuel Entry:</span>
                    <span className="font-semibold">
                      {latestFuelEntry 
                        ? `${new Date(latestFuelEntry.date).toLocaleDateString()} ($${latestFuelEntry.cost})`
                        : 'No fuel entries recorded'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setIsViewOpen(false)}>Close Details</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
