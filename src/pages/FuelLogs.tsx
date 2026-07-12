import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { FuelLog } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, MapPin, Truck, Fuel, Edit2, Trash2, Eye, Calendar, Gauge, Info, DollarSign, Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function FuelLogs() {
  const { fuelLogs, vehicles, addFuelLog, updateFuelLog, deleteFuelLog } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicleId, setFilterVehicleId] = useState('all');
  const [filterFuelType, setFilterFuelType] = useState('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FuelLog | null>(null);
  
  const [formData, setFormData] = useState<Partial<FuelLog>>({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    cost: 0,
    fuelStation: '',
    fuelType: 'Diesel',
    notes: '',
    odometer: 0
  });

  const [validationError, setValidationError] = useState('');

  // Get active vehicles only for vehicle dropdown (status !== 'Retired' or if it is the current vehicle being edited)
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired' || (isEditMode && v.id === formData.vehicleId));

  // Filter fuel logs based on search term, vehicle, and fuel type
  const filteredLogs = fuelLogs.filter(log => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    const matchesSearch = 
      (log.fuelStation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle?.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVehicle = filterVehicleId === 'all' || log.vehicleId === filterVehicleId;
    const matchesFuelType = filterFuelType === 'all' || log.fuelType === filterFuelType;
    
    return matchesSearch && matchesVehicle && matchesFuelType;
  });

  // Odometer reading validator
  const validateOdometer = (vehicleId: string, inputOdometer: number, dateStr: string, currentLogId?: string) => {
    if (!vehicleId || !inputOdometer || !dateStr) return '';
    const inputDate = new Date(dateStr);

    const otherLogs = fuelLogs.filter(log => log.vehicleId === vehicleId && log.id !== currentLogId);

    // Ensure odometer does not decrease compared to earlier logs
    const earlierLogWithHigherOdo = otherLogs.find(log => {
      const logDate = new Date(log.date);
      return logDate <= inputDate && log.odometer > inputOdometer;
    });

    if (earlierLogWithHigherOdo) {
      return `Odometer cannot be less than a previous reading (${earlierLogWithHigherOdo.odometer} km on ${new Date(earlierLogWithHigherOdo.date).toLocaleDateString()}).`;
    }

    // Ensure odometer does not exceed subsequent logs
    const laterLogWithLowerOdo = otherLogs.find(log => {
      const logDate = new Date(log.date);
      return logDate > inputDate && log.odometer < inputOdometer;
    });

    if (laterLogWithLowerOdo) {
      return `Odometer cannot be greater than a subsequent reading (${laterLogWithLowerOdo.odometer} km on ${new Date(laterLogWithLowerOdo.date).toLocaleDateString()}).`;
    }

    return '';
  };

  const handleOpenAdd = () => {
    setFormData({
      vehicleId: activeVehicles[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      quantity: 0,
      cost: 0,
      fuelStation: '',
      fuelType: 'Diesel',
      notes: '',
      odometer: 0
    });
    setValidationError('');
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (log: FuelLog) => {
    setFormData({
      vehicleId: log.vehicleId,
      date: new Date(log.date).toISOString().split('T')[0],
      quantity: log.quantity,
      cost: log.cost,
      fuelStation: log.fuelStation || '',
      fuelType: log.fuelType,
      notes: log.notes || '',
      odometer: log.odometer
    });
    setSelectedLog(log);
    setValidationError('');
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleOpenView = (log: FuelLog) => {
    setSelectedLog(log);
    setIsViewOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const vehicleId = formData.vehicleId || '';
    const quantity = Number(formData.quantity);
    const cost = Number(formData.cost);
    const odometer = Number(formData.odometer);
    const dateStr = formData.date || '';

    // Validation checks
    if (quantity <= 0) {
      setValidationError('Fuel Quantity must be greater than zero.');
      return;
    }
    if (cost < 0) {
      setValidationError('Fuel Cost cannot be negative.');
      return;
    }

    const odoError = validateOdometer(vehicleId, odometer, dateStr, selectedLog?.id);
    if (odoError) {
      setValidationError(odoError);
      return;
    }

    const logPayload = {
      vehicleId,
      date: new Date(dateStr).toISOString(),
      quantity,
      cost,
      fuelStation: formData.fuelStation || '',
      fuelType: formData.fuelType as FuelLog['fuelType'],
      notes: formData.notes || '',
      odometer
    };

    if (isEditMode && selectedLog) {
      updateFuelLog(selectedLog.id, logPayload);
      toast.success('Fuel log updated successfully');
    } else {
      addFuelLog(logPayload);
      // Automatically update vehicle's odometer if new odometer is larger
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle && odometer > vehicle.currentOdometer) {
        useDataStore.getState().updateVehicle(vehicleId, { currentOdometer: odometer });
      }
      toast.success('Fuel purchase logged successfully');
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this fuel log? This will also remove the corresponding expense entry.')) {
      deleteFuelLog(id);
      toast.success('Fuel log deleted');
    }
  };

  const fuelTypeColor = (type: FuelLog['fuelType']) => {
    switch (type) {
      case 'Diesel': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Petrol': return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
      case 'CNG': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Electric': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Management</h1>
          <p className="text-muted-foreground">Log fuel purchases, validate odometer logs, and synchronize expenses.</p>
        </div>
        
        <Button className="shadow-md" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2"/> Log Fuel Purchase
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search station or registration..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
              <Filter className="w-4 h-4" /> Filter by:
            </div>
            
            <select 
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={filterVehicleId}
              onChange={e => setFilterVehicleId(e.target.value)}
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
              ))}
            </select>

            <select 
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={filterFuelType}
              onChange={e => setFilterFuelType(e.target.value)}
            >
              <option value="all">All Fuel Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Date & Station</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{new Date(log.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground"/> {log.fuelStation || 'Not Specified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-primary"/> {vehicle?.registrationNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">{vehicle?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={fuelTypeColor(log.fuelType)}>
                        {log.fuelType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.quantity.toLocaleString(undefined, {minimumFractionDigits: 1})} L
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Gauge className="w-3.5 h-3.5"/> {log.odometer.toLocaleString()} km
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-destructive">
                      ${log.cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenView(log)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(log)} title="Edit Fuel Log">
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(log.id)} title="Delete Fuel Log">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No fuel logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit' : 'Log'} Fuel Purchase</DialogTitle>
            <DialogDescription>
              Record fuel refills. Odometer reading checks will ensure sequence validation.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {validationError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle</label>
              <select 
                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
                value={formData.vehicleId || ''} 
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
              >
                <option value="" disabled>Select active vehicle</option>
                {activeVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input 
                  type="date" 
                  required 
                  value={formData.date || ''} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Type</label>
                <select 
                  className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  value={formData.fuelType || 'Diesel'} 
                  onChange={e => setFormData({...formData, fuelType: e.target.value as FuelLog['fuelType']})}
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity (Liters)</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  required 
                  min="0.01"
                  placeholder="Liters"
                  value={formData.quantity || ''} 
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Cost ($)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  required 
                  min="0"
                  placeholder="Cost"
                  value={formData.cost || ''} 
                  onChange={e => setFormData({...formData, cost: Number(e.target.value)})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Odometer (km)</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  placeholder="Current Reading"
                  value={formData.odometer || ''} 
                  onChange={e => setFormData({...formData, odometer: Number(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Station (Optional)</label>
                <Input 
                  placeholder="e.g. Shell, Exxon" 
                  value={formData.fuelStation || ''} 
                  onChange={e => setFormData({...formData, fuelStation: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea 
                className="w-full flex min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Log notes about fuel efficiency or refueling details..."
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{isEditMode ? 'Update' : 'Submit'} Fuel Log</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Read-Only Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-primary" /> Fuel Purchase Receipt
            </DialogTitle>
            <DialogDescription>
              Receipt details and auto-generated transaction keys.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 pt-4 border-t text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Fuel Log ID:</span>
                <span className="font-mono font-medium">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Expense Record ID:</span>
                <span className="font-mono font-medium">{selectedLog.expenseId}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">
                  {vehicles.find(v => v.id === selectedLog.vehicleId)?.registrationNumber || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Refueling Date:</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(selectedLog.date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Fuel Station:</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {selectedLog.fuelStation || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Fuel Type:</span>
                <Badge variant="outline" className={fuelTypeColor(selectedLog.fuelType)}>
                  {selectedLog.fuelType}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Odometer:</span>
                <span className="font-medium flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                  {selectedLog.odometer.toLocaleString()} km
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{selectedLog.quantity.toLocaleString()} Liters</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium text-destructive flex items-center gap-0.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  {selectedLog.cost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Unit Cost:</span>
                <span className="font-medium text-emerald-600">
                  ${(selectedLog.cost / selectedLog.quantity).toFixed(3)} / Liter
                </span>
              </div>

              {selectedLog.notes && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-muted-foreground block">Notes:</span>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {selectedLog.notes}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setIsViewOpen(false)}>Close Details</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
