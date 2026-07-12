import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { Maintenance } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Wrench, CheckCircle2, Truck } from 'lucide-react';

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles, createMaintenance, updateMaintenanceStatus } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closingLog, setClosingLog] = useState<Maintenance | null>(null);
  const [actualCost, setActualCost] = useState<number>(0);
  
  const [formData, setFormData] = useState<Partial<Maintenance>>({
    issue: '',
    serviceType: '',
    mechanic: '',
    estimatedCost: 0,
    vehicleId: '',
  });

  const filteredLogs = maintenanceLogs.filter(m => 
    m.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    createMaintenance({
      ...formData as Omit<Maintenance, 'id' | 'status'>,
      date: new Date().toISOString()
    });
    setIsAddOpen(false);
    setFormData({ issue: '', serviceType: '', mechanic: '', estimatedCost: 0, vehicleId: '' });
  };

  const handleCloseMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if(closingLog) {
      updateMaintenanceStatus(closingLog.id, 'Completed', actualCost);
    }
    setIsCloseOpen(false);
    setClosingLog(null);
    setActualCost(0);
  };

  const statusColor = (status: Maintenance['status']) => {
    switch (status) {
      case 'Open': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return '';
    }
  };

  const availableVehicles = vehicles.filter(v => v.status !== 'In Shop' && v.status !== 'Retired');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Track repairs and scheduled service for vehicles.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => setFormData({ issue: '', serviceType: '', mechanic: '', estimatedCost: 0, vehicleId: '' })}>
              <Plus className="w-4 h-4 mr-2"/> Log Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log Maintenance Issue</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Vehicle</span>
                  <span className="text-muted-foreground text-xs">{availableVehicles.length} available</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-1 border rounded-md">
                  {availableVehicles.length === 0 ? (
                    <p className="text-sm text-destructive p-2">No available vehicles to service.</p>
                  ) : (
                    availableVehicles.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => setFormData({...formData, vehicleId: v.id})}
                        className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${formData.vehicleId === v.id ? 'bg-primary/10 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span>{v.registrationNumber} ({v.name})</span>
                        {formData.vehicleId === v.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Description</label>
                <Input required value={formData.issue || ''} onChange={e => setFormData({...formData, issue: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <Input required placeholder="e.g. Oil Change, Repair" value={formData.serviceType || ''} onChange={e => setFormData({...formData, serviceType: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mechanic</label>
                  <Input required value={formData.mechanic || ''} onChange={e => setFormData({...formData, mechanic: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Est. Cost ($)</label>
                  <Input type="number" required value={formData.estimatedCost || ''} onChange={e => setFormData({...formData, estimatedCost: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={!formData.vehicleId}>Submit to Shop</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for Closing Maintenance */}
        <Dialog open={isCloseOpen} onOpenChange={setIsCloseOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Complete Maintenance</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCloseMaintenance} className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">Please confirm the actual cost of the repair before completing this service.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Cost ($)</label>
                <Input type="number" required value={actualCost || ''} onChange={e => setActualCost(Number(e.target.value))} />
              </div>
              <div className="flex justify-end pt-4 border-t gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCloseOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Complete & Release Vehicle</Button>
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
              placeholder="Search issues or type..."
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
                <TableHead>Issue & Vehicle</TableHead>
                <TableHead>Service Info</TableHead>
                <TableHead>Date Logged</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
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
                        <span className="font-medium text-destructive">{log.issue}</span>
                        <span className="text-xs text-muted-foreground"><Truck className="inline w-3 h-3 mr-1"/> {vehicle?.registrationNumber || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{log.serviceType}</span>
                        <span className="text-xs text-muted-foreground">Mech: {log.mechanic}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(log.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">${log.actualCost || log.estimatedCost}</span>
                        <span className="text-[10px] text-muted-foreground">{log.actualCost ? 'Actual' : 'Est.'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {log.status === 'Open' && (
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20" onClick={() => updateMaintenanceStatus(log.id, 'In Progress')}>
                          Start Work
                        </Button>
                      )}
                      {log.status === 'In Progress' && (
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => {
                          setClosingLog(log);
                          setActualCost(log.estimatedCost);
                          setIsCloseOpen(true);
                        }}>
                          <Wrench className="w-4 h-4 mr-1"/> Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No maintenance logs found.
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
