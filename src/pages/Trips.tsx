import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { Trip, TripStatus } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MapPin, Truck, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function Trips() {
  const { trips, vehicles, drivers, createTrip, updateTripStatus } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<Partial<Trip>>({
    source: '',
    destination: '',
    cargoWeight: 0,
    plannedDistance: 0,
    vehicleId: '',
    driverId: '',
  });

  const filteredTrips = trips.filter(t => 
    t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: TripStatus) => {
    switch (status) {
      case 'Dispatched': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Draft': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return '';
    }
  };

  const isLicenseExpiring = (dateString: string) => {
    const expiryDate = new Date(dateString);
    return expiryDate < new Date();
  };

  const availableVehicles = vehicles.filter(v => 
    v.status === 'Available' && 
    (formData.cargoWeight ? v.maxLoadCapacity >= formData.cargoWeight : true)
  );

  const availableDrivers = drivers.filter(d => 
    d.status === 'Available' && !isLicenseExpiring(d.licenseExpiry)
  );

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.source || !formData.destination || !formData.cargoWeight || !formData.plannedDistance) {
        setError('Please fill in all route details.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.vehicleId || !formData.driverId) {
        setError('Please select a vehicle and driver.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleDispatch = () => {
    createTrip({
      ...formData as Omit<Trip, 'id' | 'status'>,
      date: new Date().toISOString()
    });
    // Find the latest trip to dispatch it automatically, but createTrip doesn't return the ID.
    // We will just create it as Draft, then update it to Dispatched immediately?
    // Wait, let's just close the modal for now, and the user can dispatch it from the list, or we modify store to allow creating directly as dispatched.
    // Actually, I can just create it. In data.ts, it creates as 'Draft'. Let's add a timeout to dispatch it, or just let user click Dispatch in the table.
    setIsAddOpen(false);
    setStep(1);
    setFormData({ source: '', destination: '', cargoWeight: 0, plannedDistance: 0, vehicleId: '', driverId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground">Dispatch and track active routes.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if(!open) {
            setStep(1);
            setError('');
          }
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="w-4 h-4 mr-2"/> Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Trip - Step {step} of 3</DialogTitle>
            </DialogHeader>
            <div className="pt-4 space-y-4">
              {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
              
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Route Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Source</label>
                      <Input placeholder="e.g. New York, NY" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destination</label>
                      <Input placeholder="e.g. Boston, MA" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cargo Weight (kg)</label>
                      <Input type="number" placeholder="e.g. 5000" value={formData.cargoWeight || ''} onChange={e => setFormData({...formData, cargoWeight: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Planned Distance (km)</label>
                      <Input type="number" placeholder="e.g. 350" value={formData.plannedDistance || ''} onChange={e => setFormData({...formData, plannedDistance: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Assignment</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                      <span>Vehicle</span>
                      <span className="text-muted-foreground text-xs">{availableVehicles.length} available</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1">
                      {availableVehicles.length === 0 ? (
                        <p className="text-sm text-destructive">No available vehicles with sufficient capacity.</p>
                      ) : (
                        availableVehicles.map(v => (
                          <div 
                            key={v.id} 
                            onClick={() => setFormData({...formData, vehicleId: v.id})}
                            className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-colors ${formData.vehicleId === v.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <Truck className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{v.registrationNumber}</p>
                                <p className="text-xs text-muted-foreground">{v.name} (Cap: {v.maxLoadCapacity}kg)</p>
                              </div>
                            </div>
                            {formData.vehicleId === v.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                      <span>Driver</span>
                      <span className="text-muted-foreground text-xs">{availableDrivers.length} available</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1">
                      {availableDrivers.length === 0 ? (
                        <p className="text-sm text-destructive">No available drivers with valid licenses.</p>
                      ) : (
                        availableDrivers.map(d => (
                          <div 
                            key={d.id} 
                            onClick={() => setFormData({...formData, driverId: d.id})}
                            className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-colors ${formData.driverId === d.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <UserIcon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{d.name}</p>
                                <p className="text-xs text-muted-foreground">Score: {d.safetyScore}</p>
                              </div>
                            </div>
                            {formData.driverId === d.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Review & Dispatch</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-4 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4"/>
                        <span className="text-sm">Route</span>
                      </div>
                      <span className="font-medium">{formData.source} → {formData.destination}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="w-4 h-4"/>
                        <span className="text-sm">Vehicle</span>
                      </div>
                      <span className="font-medium">{vehicles.find(v => v.id === formData.vehicleId)?.registrationNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserIcon className="w-4 h-4"/>
                        <span className="text-sm">Driver</span>
                      </div>
                      <span className="font-medium">{drivers.find(d => d.id === formData.driverId)?.name}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Creating this trip will save it as a Draft. You can dispatch it from the table.</p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t mt-6">
                <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : setIsAddOpen(false)}>
                  {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                {step < 3 ? (
                  <Button onClick={handleNextStep}>Next</Button>
                ) : (
                  <Button onClick={handleDispatch} className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirm & Create</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trips..."
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
                <TableHead>Route</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);
                return (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{trip.source} → {trip.destination}</span>
                        <span className="text-xs text-muted-foreground">{trip.plannedDistance} km • {trip.cargoWeight} kg</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm"><Truck className="inline w-3 h-3 mr-1"/> {vehicle?.registrationNumber || 'Unknown'}</span>
                        <span className="text-sm text-muted-foreground"><UserIcon className="inline w-3 h-3 mr-1"/> {driver?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(trip.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {trip.status === 'Draft' && (
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => updateTripStatus(trip.id, 'Dispatched')}>
                          Dispatch
                        </Button>
                      )}
                      {trip.status === 'Dispatched' && (
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => updateTripStatus(trip.id, 'Completed')}>
                          Complete
                        </Button>
                      )}
                      {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => updateTripStatus(trip.id, 'Cancelled')}>
                          <XCircle className="w-4 h-4"/>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredTrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No trips found.
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
