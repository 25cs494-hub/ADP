import { useState } from 'react';
import { useDataStore } from '../store/data';
import type { Expense } from '../store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Receipt } from 'lucide-react';

export default function Expenses() {
  const { expenses, addExpense } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'Other',
    description: '',
  });

  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      ...formData as Omit<Expense, 'id'>,
      date: new Date(formData.date!).toISOString()
    });
    setIsAddOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: 'Other',
      description: '',
    });
  };

  const categoryColor = (category: string) => {
    switch (category) {
      case 'Fuel': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Maintenance': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Salary': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Tolls': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Insurance': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Manage operating costs and financial records.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="w-4 h-4 mr-2"/> Log Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log Manual Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" required value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                    value={formData.category || ''} 
                    onChange={e => setFormData({...formData, category: e.target.value as Expense['category']})}
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Salary">Salary</option>
                    <option value="Tolls">Tolls</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ($)</label>
                <Input type="number" step="0.01" required value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input required placeholder="Brief detail about the expense" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button type="submit">Save Expense</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Receipt className="w-4 h-4"/> <span className="text-sm font-medium">Total Expenses (30d)</span>
          </div>
          <p className="text-3xl font-bold">${expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description or category..."
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
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium text-sm">
                    {new Date(exp.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryColor(exp.category)}>
                      {exp.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exp.description}
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    ${exp.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No expenses found.
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
