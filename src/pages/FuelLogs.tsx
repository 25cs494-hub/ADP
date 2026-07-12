import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { FuelLog } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Search, MapPin, Truck, User as UserIcon } from 'lucide-react';

export default function FuelLogs() {
  const { fuelLogs, vehicles, drivers, addFuelLog } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FuelLog>>({
    vehicleId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    gallons: 0,
    cost: 0,
    location: '',
    odometer: 0
  });

  const filteredLogs = fuelLogs.filter(log => 
    log.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addFuelLog({
      ...formData as Omit<FuelLog, 'id'>,
      date: new Date(formData.date!).toISOString()
    });
    setIsAddOpen(false);
    setFormData({
      vehicleId: '',
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      gallons: 0,
      cost: 0,
      location: '',
      odometer: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Logs</h1>
          <p className="text-muted-foreground">Track fuel consumption and automate expense entry.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="w-4 h-4 mr-2"/> Log Fuel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log Fuel Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle</label>
                  <select 
                    className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                    value={formData.vehicleId || ''} 
                    onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                  >
                    <option value="" disabled>Select Vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Driver</label>
                  <select 
                    className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                    value={formData.driverId || ''} 
                    onChange={e => setFormData({...formData, driverId: e.target.value})}
                  >
                    <option value="" disabled>Select Driver</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" required value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input required placeholder="Station Name" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gallons</label>
                  <Input type="number" step="0.1" required value={formData.gallons || ''} onChange={e => setFormData({...formData, gallons: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Cost ($)</label>
                  <Input type="number" step="0.01" required value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Odometer</label>
                <Input type="number" required value={formData.odometer || ''} onChange={e => setFormData({...formData, odometer: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button type="submit">Submit Fuel Log</Button>
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
              placeholder="Search by location..."
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
                <TableHead>Date & Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                const driver = drivers.find(d => d.id === log.driverId);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{new Date(log.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {log.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm flex items-center gap-1"><Truck className="w-3 h-3"/> {vehicle?.registrationNumber}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><UserIcon className="w-3 h-3"/> {driver?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.gallons} gal
                    </TableCell>
                    <TableCell className="text-destructive font-medium">
                      ${log.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">${(log.cost / log.gallons).toFixed(2)} / gal</span>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No fuel logs found.
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
