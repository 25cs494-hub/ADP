import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from '@/pages/Vehicles';
import Drivers from '@/pages/Drivers';
import Trips from '@/pages/Trips';
import Maintenance from '@/pages/Maintenance';
import FuelLogs from '@/pages/FuelLogs';
import Reports from '@/pages/Reports';
import Expenses from '@/pages/Expenses';
import Analytics from '@/pages/Analytics';
<<<<<<< HEAD
import Profile from '@/pages/Profile';
=======
import Notifications from '@/pages/Notifications';
>>>>>>> 158dacc (Updated notifications)
import AppLayout from '@/components/layout/AppLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="trips" element={<Trips />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="fuel-management" element={<FuelLogs />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
<<<<<<< HEAD
          <Route path="profile" element={<Profile />} />
=======
          <Route path="notifications" element={<Notifications />} />
>>>>>>> 158dacc (Updated notifications)
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
