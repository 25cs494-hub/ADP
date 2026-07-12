import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { Driver, DriverStatus } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Driver>>({
    status: 'Available',
    safetyScore: 100
  });

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      updateDriver(formData.id, formData);
    } else {
      addDriver(formData as Omit<Driver, 'id'>);
    }
    setIsAddOpen(false);
    setFormData({ status: 'Available', safetyScore: 100 });
  };

  const statusColor = (status: DriverStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'On Trip': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Off Duty': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'Suspended': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  const isLicenseExpiring = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your driving staff and licenses.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => setFormData({ status: 'Available', safetyScore: 100 })}>
              <Plus className="w-4 h-4 mr-2"/> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Edit' : 'Add'} Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Number</label>
                  <Input required value={formData.licenseNumber || ''} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input required value={formData.licenseCategory || ''} onChange={e => setFormData({...formData, licenseCategory: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Expiry</label>
                <Input type="date" required value={formData.licenseExpiry || ''} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input required value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">{formData.id ? 'Save Changes' : 'Add Driver'}</Button>
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
              placeholder="Search by name or license..."
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
                <TableHead>Driver Info</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{driver.name}</span>
                        <span className="text-xs text-muted-foreground">{driver.phoneNumber}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{driver.licenseNumber} <span className="text-muted-foreground font-normal">({driver.licenseCategory})</span></span>
                      <span className={`text-xs flex items-center gap-1 ${isLicenseExpiring(driver.licenseExpiry) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {isLicenseExpiring(driver.licenseExpiry) && <ShieldAlert className="w-3 h-3" />}
                        Exp: {driver.licenseExpiry}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${driver.safetyScore > 80 ? 'bg-emerald-500' : driver.safetyScore > 60 ? 'bg-amber-500' : 'bg-destructive'}`} 
                          style={{ width: `${driver.safetyScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{driver.safetyScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(driver.status)}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        setFormData(driver);
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
                        if(confirm('Are you sure you want to delete this driver?')) {
                          deleteDriver(driver.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No drivers found.
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
