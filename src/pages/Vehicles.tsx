import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { Vehicle, VehicleStatus } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

export default function Vehicles() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    status: 'Available',
    type: 'Truck'
  });

  const filteredVehicles = vehicles.filter(v => 
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      updateVehicle(formData.id, formData);
    } else {
      addVehicle(formData as Omit<Vehicle, 'id'>);
    }
    setIsAddOpen(false);
    setFormData({ status: 'Available', type: 'Truck' });
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
          <p className="text-muted-foreground">Manage your fleet, track status, and view history.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => setFormData({ status: 'Available', type: 'Truck' })}>
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
              <div className="flex justify-end pt-4">
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
          {/* Add more filters here later */}
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Vehicle Info</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{vehicle.name}</span>
                      <span className="text-xs text-muted-foreground">{vehicle.model} • {vehicle.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.maxLoadCapacity.toLocaleString()} kg</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
              ))}
              {filteredVehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No vehicles found.
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
