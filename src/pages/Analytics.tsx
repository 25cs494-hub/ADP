import { useDataStore } from '../store/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function Analytics() {
  const { expenses, vehicles } = useDataStore();

  // Aggregate expenses by category
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Aggregate expenses by date
  const expensesByDate = expenses.reduce((acc, curr) => {
    const date = new Date(curr.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(expensesByDate).map(date => ({
    date,
    amount: expensesByDate[date]
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">Deep dive into operational metrics and financial health.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Total Spend
            </CardTitle>
            <CardDescription>Lifetime operational costs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Fleet Efficiency
            </CardTitle>
            <CardDescription>Vehicles actively on trip</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              {Math.round((vehicles.filter(v => v.status === 'On Trip').length / Math.max(1, vehicles.length)) * 100)}%
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-500" /> Avg. Expense
            </CardTitle>
            <CardDescription>Per recorded transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              ${expenses.length > 0 ? Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toLocaleString() : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Breakdown by expense category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Daily Expense Trend</CardTitle>
            <CardDescription>Total expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
