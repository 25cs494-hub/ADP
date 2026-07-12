import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import type { Role } from '../store/auth';
import { useDataStore } from '../store/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, Shield, Bell, FileCheck2, Clock, 
  Upload, Trash2, KeyRound, AlertTriangle, ToggleLeft, 
  ToggleRight, Laptop, CheckCircle2, XCircle, Info, Calendar, Phone, Mail, Globe, MapPinIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    toggle2FA, 
    logoutAllDevices, 
    updateNotificationPreferences, 
    updateSettings 
  } = useAuthStore();
  
  const { vehicles, drivers, trips, maintenanceLogs, expenses } = useDataStore();
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Local form state
  const [personalForm, setPersonalForm] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');

  // Trigger loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Update time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize local form when user loads
  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactNumber: user.emergencyContactNumber || ''
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
        <h2 className="text-xl font-semibold">User session not found</h2>
        <Button onClick={() => navigate('/login')}>Back to Login</Button>
      </div>
    );
  }

  // Calculate Password Strength
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return 'Weak';
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return 'Weak';
    if (score === 3) return 'Medium';
    return 'Strong';
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };

  // Avatar Photo Actions
  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size allowed is 5 MB.');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Unsupported file format. Please upload JPG, PNG, or JPEG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ avatar: reader.result });
        toast.success('Profile avatar updated successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('Error reading the image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateProfile({ avatar: undefined });
    toast.success('Profile avatar removed.');
  };

  // Profile Save Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Phone validation
    const phoneDigitsOnly = personalForm.phoneNumber.replace(/\D/g, '');
    if (phoneDigitsOnly.length < 7) {
      toast.error('Please enter a valid phone number with digits.');
      return;
    }

    // Emergency number validation
    if (personalForm.emergencyContactNumber) {
      const emergencyDigits = personalForm.emergencyContactNumber.replace(/\D/g, '');
      if (emergencyDigits.length < 7) {
        toast.error('Please enter a valid emergency contact number.');
        return;
      }
    }

    updateProfile(personalForm);
    toast.success('Personal information saved successfully.');
  };

  const handleCancelProfile = () => {
    setPersonalForm({
      name: user.name || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      postalCode: user.postalCode || '',
      emergencyContactName: user.emergencyContactName || '',
      emergencyContactNumber: user.emergencyContactNumber || ''
    });
    toast.info('Changes discarded.');
  };

  // Change Password Submission
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      toast.success('Password updated successfully.');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordChangeOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    }
  };

  // Auto-Save Setting preference
  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
    toast.success(`Setting '${key}' updated and saved.`);
  };

  // Auto-Save Notification preferences
  const handleNotificationChange = (key: string, value: boolean) => {
    updateNotificationPreferences({ [key]: value });
    toast.success('Notification preferences updated.');
  };

  // Map role to specific statistics
  const getQuickStatistics = (role: Role) => {
    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const totalVehicles = vehicles.length || 1;
    const fleetUtilization = Math.round((activeVehicles / totalVehicles) * 100);

    switch (role) {
      case 'Fleet Manager':
        return [
          { title: 'Vehicles Managed', value: vehicles.length, desc: 'Total fleet vehicles', icon: 'truck' },
          { title: 'Trips Supervised', value: trips.length, desc: 'Overall operations logs', icon: 'map' },
          { title: 'Maintenance Requests', value: maintenanceLogs.length, desc: 'Logs registered in system', icon: 'wrench' },
          { title: 'Fleet Utilization', value: `${fleetUtilization}%`, desc: 'Vehicles active on trips', icon: 'gauge' }
        ];
      case 'Dispatcher':
        return [
          { title: 'Trips Dispatched', value: trips.filter(t => t.status === 'Dispatched').length, desc: 'Currently active trips', icon: 'map' },
          { title: 'Active Drivers', value: drivers.filter(d => d.status === 'On Trip').length, desc: 'Drivers currently driving', icon: 'users' },
          { title: 'Assigned Vehicles', value: vehicles.filter(v => v.status === 'On Trip').length, desc: 'Vehicles out in field', icon: 'truck' },
          { title: 'Pending Trips', value: trips.filter(t => t.status === 'Draft').length, desc: 'Draft trips in backlog', icon: 'clock' }
        ];
      case 'Safety Officer':
        const avgSafety = drivers.length 
          ? Math.round(drivers.reduce((acc, d) => acc + d.safetyScore, 0) / drivers.length)
          : 0;
        const expiredLicenses = drivers.filter(d => {
          const diff = new Date(d.licenseExpiry).getTime() - new Date().getTime();
          return diff < 30 * 24 * 60 * 60 * 1000;
        }).length;
        return [
          { title: 'Drivers Monitored', value: drivers.length, desc: 'Active operator accounts', icon: 'users' },
          { title: 'License Expiry Alerts', value: expiredLicenses, desc: 'Expiring in under 30 days', icon: 'alert' },
          { title: 'Safety Compliance Score', value: `${avgSafety}/100`, desc: 'Average score of all drivers', icon: 'shield' }
        ];
      case 'Financial Analyst':
        const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
        return [
          { title: 'Reports Generated', value: 12, desc: 'Analytic summaries compiled', icon: 'file' },
          { title: 'Operational Cost Reviewed', value: `$${totalExp.toLocaleString()}`, desc: 'Total recorded expenses', icon: 'dollar' },
          { title: 'Expense Records', value: expenses.length, desc: 'Transactions registered', icon: 'receipt' }
        ];
      case 'Driver':
        const matchingDriver = drivers.find(d => d.name === user.name);
        return [
          { title: 'Trips Completed', value: trips.filter(t => t.driverId === matchingDriver?.id && t.status === 'Completed').length || 18, desc: 'Completed transport runs', icon: 'check' },
          { title: 'Total Distance Driven', value: '8,420 mi', desc: 'Recorded odometer distance', icon: 'map' },
          { title: 'Fuel Efficiency', value: '6.4 mpg', desc: 'Average fleet MPG calculation', icon: 'gauge' },
          { title: 'Safety Score', value: `${matchingDriver?.safetyScore || 95}/100`, desc: 'Your operator safety rating', icon: 'shield' }
        ];
      case 'Admin':
        return [
          { title: 'Total System Users', value: 6, desc: 'Registered user profiles', icon: 'users' },
          { title: 'Active Sessions', value: user.security.activeSessions.length, desc: 'Current active connections', icon: 'laptop' },
          { title: 'System Health', value: '99.9%', desc: 'Services normal and healthy', icon: 'check' },
          { title: 'Database Backups', value: 'Secured', desc: 'Daily automated backup clean', icon: 'shield' }
        ];
      default:
        return [];
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Fleet Manager': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Dispatcher': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Safety Officer': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Financial Analyst': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'Driver': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  // Modules permission check
  const getModulesForRole = (role: Role) => {
    const list = [
      { name: 'Dashboard', enabled: true },
      { name: 'Vehicles', enabled: ['Fleet Manager', 'Dispatcher', 'Admin'].includes(role) },
      { name: 'Drivers', enabled: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Admin'].includes(role) },
      { name: 'Trips', enabled: ['Fleet Manager', 'Dispatcher', 'Driver', 'Admin'].includes(role) },
      { name: 'Maintenance', enabled: ['Fleet Manager', 'Safety Officer', 'Admin'].includes(role) },
      { name: 'Fuel & Expenses', enabled: ['Fleet Manager', 'Financial Analyst', 'Driver', 'Admin'].includes(role) },
      { name: 'Reports', enabled: ['Fleet Manager', 'Financial Analyst', 'Admin'].includes(role) },
      { name: 'Analytics', enabled: ['Fleet Manager', 'Financial Analyst', 'Admin'].includes(role) }
    ];
    return list;
  };

  const handleEditProfileClick = () => {
    // Navigate to personal tab
    const tabTrigger = document.querySelector('[data-value="personal"]') as HTMLButtonElement;
    if (tabTrigger) {
      tabTrigger.click();
    }
    // Scroll form into view if needed
    const formElement = document.getElementById('personal-info-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary hover:underline transition-colors">Dashboard</button>
            <span>&gt;</span>
            <span className="text-foreground font-medium">My Profile</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and security settings.</p>
        </div>
        <div className="text-right bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-border/60 shadow-sm backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current local date & time</p>
          <p className="text-sm font-semibold mt-0.5 tracking-tight font-mono text-primary">
            {currentTime.toLocaleDateString()} &bull; {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          // Professional Loading Skeletons
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-1 space-y-6">
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl group hover:shadow-lg transition-all duration-300">
                  <div className="h-24 bg-gradient-to-r from-primary/80 to-blue-600/80 relative" />
                  <CardContent className="pt-0 relative px-6 pb-6">
                    {/* Avatar upload */}
                    <div className="flex flex-col items-center -mt-12 mb-4">
                      <div className="relative group/avatar cursor-pointer">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary uppercase">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Hover Overlay Camera */}
                        <div 
                          onClick={handlePhotoUploadClick}
                          className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 border border-white/20"
                        >
                          <Upload className="w-5 h-5 text-white mb-1" />
                          <span className="text-[10px] text-white font-medium">Upload JPG/PNG</span>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/jpeg,image/png,image/jpg" 
                        className="hidden" 
                      />

                      {/* Remove photo */}
                      {user.avatar && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRemovePhoto}
                          className="text-destructive hover:bg-destructive/10 mt-2 h-7 px-2.5 rounded-lg text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove photo
                        </Button>
                      )}

                      <h3 className="text-xl font-bold text-center mt-3 tracking-tight">{user.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className={`border ${getRoleBadgeColor(user.role)} font-semibold px-2 py-0.5 rounded-full text-xs`}>
                          {user.role}
                        </Badge>
                        <Badge variant="outline" className={`${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'} font-medium px-2 py-0.5 rounded-full text-xs`}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="space-y-3.5 border-t border-border pt-4 text-sm">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Info className="w-4 h-4 text-muted-foreground/75" /> Employee ID</span>
                        <span className="font-semibold font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{user.employeeId}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="w-4 h-4 text-muted-foreground/75" /> Email Address</span>
                        <span className="font-medium text-foreground truncate max-w-[180px]">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-4 h-4 text-muted-foreground/75" /> Phone Number</span>
                        <span className="font-medium text-foreground">{user.phoneNumber || 'Not Set'}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="w-4 h-4 text-muted-foreground/75" /> Department</span>
                        <span className="font-medium text-foreground">{user.department}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4 text-muted-foreground/75" /> Joined Date</span>
                        <span className="font-medium text-foreground">{user.joinedDate}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4 text-muted-foreground/75" /> Last Login</span>
                        <span className="font-medium text-foreground text-xs">{user.lastLogin}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-5 pt-1">
                      <Button 
                        onClick={handleEditProfileClick} 
                        className="w-full text-xs font-semibold shadow-md shadow-primary/10"
                      >
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsPasswordChangeOpen(true)}
                        className="w-full text-xs font-semibold border-border hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Settings Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" /> Application Settings
                    </CardTitle>
                    <CardDescription>Configure local UI display preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dark mode */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                      <div>
                        <span className="font-medium text-sm block">Dark Mode</span>
                        <span className="text-xs text-muted-foreground">Toggle application theme</span>
                      </div>
                      <button 
                        onClick={() => handleSettingChange('darkMode', !user.settings.darkMode)}
                        className="text-primary hover:opacity-85 focus:outline-none transition-transform active:scale-95"
                      >
                        {user.settings.darkMode ? (
                          <ToggleRight className="w-10 h-10 text-primary" />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Language */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</label>
                      <select 
                        value={user.settings.language} 
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-border/80 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="fr">French (Français)</option>
                        <option value="de">German (Deutsch)</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Zone</label>
                      <select 
                        value={user.settings.timeZone} 
                        onChange={(e) => handleSettingChange('timeZone', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-border/80 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      >
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="America/New_York">Eastern Time (America/New_York)</option>
                        <option value="America/Chicago">Central Time (America/Chicago)</option>
                        <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                        <option value="Europe/London">Greenwich Mean Time (Europe/London)</option>
                        <option value="Asia/Tokyo">Japan Standard Time (Asia/Tokyo)</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Format</label>
                      <select 
                        value={user.settings.dateFormat} 
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-border/80 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-12)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 12/07/2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 07/12/2026)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Statistics Row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {getQuickStatistics(user.role).map((stat, idx) => (
                  <Card key={idx} className="border border-border/80 bg-white dark:bg-slate-900 shadow-sm p-4 rounded-xl hover:shadow hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs font-semibold text-muted-foreground block truncate">{stat.title}</span>
                    <span className="text-2xl font-bold text-foreground block mt-1 tracking-tight">{stat.value}</span>
                    <span className="text-[11px] text-muted-foreground block mt-1 truncate">{stat.desc}</span>
                  </Card>
                ))}
              </motion.div>

              {/* Main Tabs interface */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid grid-cols-5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 h-11 border border-border/40">
                    <TabsTrigger value="personal" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">Personal Info</TabsTrigger>
                    <TabsTrigger value="security" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">Security</TabsTrigger>
                    <TabsTrigger value="permissions" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">Permissions</TabsTrigger>
                    <TabsTrigger value="notifications" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                    <TabsTrigger value="activity" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">Activity Timeline</TabsTrigger>
                  </TabsList>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal" className="mt-4 focus-visible:ring-0">
                    <Card className="border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <UserIcon className="w-5 h-5 text-primary" /> Personal Information
                        </CardTitle>
                        <CardDescription>Update your contact and residential details.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form id="personal-info-form" onSubmit={handleSaveProfile} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Full Name</label>
                              <Input 
                                type="text" 
                                required
                                value={personalForm.name} 
                                onChange={e => setPersonalForm({...personalForm, name: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium flex items-center gap-1.5">
                                Email Address <Badge variant="secondary" className="px-1.5 py-0 rounded text-[10px] scale-90 font-medium">Read Only</Badge>
                              </label>
                              <Input 
                                type="email" 
                                disabled
                                value={user.email} 
                                className="bg-slate-100 dark:bg-slate-800 text-muted-foreground border-border cursor-not-allowed opacity-80"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Phone Number</label>
                              <Input 
                                type="tel" 
                                required
                                placeholder="e.g. 555-019-2834"
                                value={personalForm.phoneNumber} 
                                onChange={e => setPersonalForm({...personalForm, phoneNumber: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Street Address</label>
                              <Input 
                                type="text" 
                                value={personalForm.address} 
                                onChange={e => setPersonalForm({...personalForm, address: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                              <label className="text-sm font-medium">City</label>
                              <Input 
                                type="text" 
                                value={personalForm.city} 
                                onChange={e => setPersonalForm({...personalForm, city: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                            <div className="col-span-1 space-y-1.5">
                              <label className="text-sm font-medium">State / Province</label>
                              <Input 
                                type="text" 
                                value={personalForm.state} 
                                onChange={e => setPersonalForm({...personalForm, state: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                            <div className="col-span-1 space-y-1.5">
                              <label className="text-sm font-medium">Postal Code</label>
                              <Input 
                                type="text" 
                                value={personalForm.postalCode} 
                                onChange={e => setPersonalForm({...personalForm, postalCode: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                              <label className="text-sm font-medium">Country</label>
                              <Input 
                                type="text" 
                                value={personalForm.country} 
                                onChange={e => setPersonalForm({...personalForm, country: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/60 pt-4 mt-1">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Emergency Contact Name</label>
                              <Input 
                                type="text" 
                                value={personalForm.emergencyContactName} 
                                onChange={e => setPersonalForm({...personalForm, emergencyContactName: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Emergency Contact Number</label>
                              <Input 
                                type="tel" 
                                value={personalForm.emergencyContactNumber} 
                                onChange={e => setPersonalForm({...personalForm, emergencyContactNumber: e.target.value})} 
                                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
                              />
                            </div>
                          </div>

                          {/* Submit Actions */}
                          <div className="flex justify-end gap-3 pt-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleCancelProfile}
                              className="border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="text-sm font-semibold px-5 shadow-lg shadow-primary/10"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Account Security Tab */}
                  <TabsContent value="security" className="mt-4 focus-visible:ring-0">
                    <Card className="border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" /> Credentials & Security Preferences
                        </CardTitle>
                        <CardDescription>Manage passwords, active browser sessions, and security verification.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Summary details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-border/80 rounded-xl p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                            <div>
                              <span className="text-xs text-muted-foreground font-semibold block">PASSWORD SECURITY STATUS</span>
                              <span className="font-semibold block mt-0.5">Strength: {user.security.passwordStatus}</span>
                              <span className="text-xs text-muted-foreground mt-0.5 block">Last changed: {user.security.lastPasswordChanged}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsPasswordChangeOpen(true)}
                              className="text-xs border-border bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                              <KeyRound className="w-3.5 h-3.5 mr-1 text-primary" /> Update Password
                            </Button>
                          </div>

                          <div className="border border-border/80 rounded-xl p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                            <div>
                              <span className="text-xs text-muted-foreground font-semibold block">TWO-FACTOR AUTHENTICATION (2FA)</span>
                              <span className="font-semibold block mt-0.5">
                                Status: {user.security.twoFactorEnabled ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0 text-xs">Enabled</Badge>
                                ) : (
                                  <Badge variant="secondary" className="py-0 text-xs">Disabled</Badge>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5 block">Secure your login attempts</span>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={toggle2FA}
                              className={`text-xs ${user.security.twoFactorEnabled ? 'text-destructive border-destructive/20 hover:bg-destructive/10' : 'border-border'}`}
                            >
                              {user.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                            </Button>
                          </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-semibold flex items-center gap-1.5"><Laptop className="w-4 h-4 text-primary" /> Active Device Sessions</h4>
                              <p className="text-xs text-muted-foreground">Devices currently logged into your account.</p>
                            </div>
                            {user.security.activeSessions.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={logoutAllDevices}
                                className="text-destructive hover:bg-destructive/10 text-xs rounded-lg"
                              >
                                Logout other devices
                              </Button>
                            )}
                          </div>
                          
                          <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-slate-50/30 dark:bg-slate-950/5">
                            {user.security.activeSessions.map((session, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3.5 text-xs">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Laptop className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="font-semibold block text-foreground">{session.device}</span>
                                    <span className="text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <MapPinIcon className="w-3 h-3 text-muted-foreground/75" /> {session.location} &bull; IP: {session.ip}
                                    </span>
                                  </div>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0 scale-90">{session.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Login History */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Login Auditing (Last 5 attempts)</h4>
                            <p className="text-xs text-muted-foreground">Review login activities for compliance audits.</p>
                          </div>

                          <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-border text-muted-foreground font-semibold">
                                  <tr>
                                    <th className="p-3.5">Activity</th>
                                    <th className="p-3.5">Date & Time</th>
                                    <th className="p-3.5">Device</th>
                                    <th className="p-3.5">IP Address</th>
                                    <th className="p-3.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {user.security.loginHistory.map((history, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                      <td className="p-3.5 font-medium">{history.activity}</td>
                                      <td className="p-3.5 font-mono text-muted-foreground">{history.date} &bull; {history.time}</td>
                                      <td className="p-3.5 text-muted-foreground">{history.device}</td>
                                      <td className="p-3.5 font-mono text-muted-foreground">{history.ip}</td>
                                      <td className="p-3.5">
                                        {history.status === 'Success' ? (
                                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0 scale-95 font-medium">Success</Badge>
                                        ) : (
                                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 py-0 scale-95 font-medium">Failed</Badge>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Role & Permissions Tab */}
                  <TabsContent value="permissions" className="mt-4 focus-visible:ring-0">
                    <Card className="border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <FileCheck2 className="w-5 h-5 text-primary" /> Role & System Permissions
                        </CardTitle>
                        <CardDescription>Review accessibility grants and module clearance levels. This section is read-only.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Assigned Role */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border border-border/80 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-950/20">
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold block">CURRENT ACCESS ROLE</span>
                            <span className="text-lg font-bold block mt-0.5 text-primary">{user.role}</span>
                            <p className="text-xs text-muted-foreground mt-1 max-w-md">
                              Your access credentials and visible navigation items are dynamically customized according to this role policy.
                            </p>
                          </div>
                          <Badge variant="outline" className={`border ${getRoleBadgeColor(user.role)} font-bold px-3 py-1 rounded-full text-sm`}>
                            {user.role} Authorization
                          </Badge>
                        </div>

                        {/* Accessible Modules Checkbox grid */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold">Module Clearances</h4>
                            <p className="text-xs text-muted-foreground">Sections enabled in the platform sidebar navigation.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {getModulesForRole(user.role).map((module, idx) => (
                              <div 
                                key={idx} 
                                className={`border rounded-xl p-3.5 flex items-center justify-between gap-2 shadow-sm transition-all duration-200
                                  ${module.enabled 
                                    ? 'bg-emerald-500/[0.03] border-emerald-500/25 dark:border-emerald-500/15' 
                                    : 'bg-slate-100/40 border-border dark:bg-slate-950/20'
                                  }`}
                              >
                                <span className={`text-xs font-semibold ${module.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{module.name}</span>
                                {module.enabled ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Role Permissions policy text */}
                        <div className="space-y-3.5">
                          <h4 className="text-sm font-semibold">RBAC Permissions Matrix</h4>
                          <div className="border border-border rounded-xl overflow-hidden text-xs">
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-border font-semibold text-muted-foreground">
                              SYSTEM PERMISSIONS ASSIGNED
                            </div>
                            <div className="p-4 space-y-2.5 leading-relaxed text-muted-foreground">
                              {user.role === 'Admin' && (
                                <p className="text-foreground font-medium flex items-start gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Super-user privileges enabled. Full access to write configurations, manage user directories, create and edit vehicle nodes, assign routes, review auditing, and database integrations.
                                </p>
                              )}
                              {user.role === 'Fleet Manager' && (
                                <div className="space-y-2">
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Full operational control: Add/update/remove vehicles and drivers in directory.
                                  </p>
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Create, plan, and dispatch transport trips (Wizard clearance).
                                  </p>
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Register fuel logs, inspect maintenance issues, and review financial expenses.
                                  </p>
                                </div>
                              )}
                              {user.role === 'Dispatcher' && (
                                <div className="space-y-2">
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Edit driver schedules and vehicle availabilities in real-time.
                                  </p>
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Create, dispatch, and track trips on maps.
                                  </p>
                                </div>
                              )}
                              {user.role === 'Safety Officer' && (
                                <div className="space-y-2">
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Safety compliance audit level: Inspect driver safety ratings and license expiry states.
                                  </p>
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Open and edit vehicle maintenance orders to resolve compliance blocks.
                                  </p>
                                </div>
                              )}
                              {user.role === 'Financial Analyst' && (
                                <div className="space-y-2">
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Review operational costs, create and submit expense files.
                                  </p>
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Access deep financial analytics dashboards and compile weekly/monthly PDF summaries.
                                  </p>
                                </div>
                              )}
                              {user.role === 'Driver' && (
                                <div className="space-y-2">
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Access your trip schedule, logs, cargo specs, and routes.
                                  </p>
                                  <p className="text-foreground font-medium flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Log odometer readings and fuel logs from mobile endpoints.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Notifications Preferences Tab */}
                  <TabsContent value="notifications" className="mt-4 focus-visible:ring-0">
                    <Card className="border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary" /> Notification Toggles
                        </CardTitle>
                        <CardDescription>Decide how and when TransitOps alerts you about system activities.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Email Notifications */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                          <div>
                            <span className="font-semibold text-sm block">Email Notifications</span>
                            <span className="text-xs text-muted-foreground">Receive digest summaries and password changes by email.</span>
                          </div>
                          <button 
                            onClick={() => handleNotificationChange('emailNotifications', !user.notificationPreferences.emailNotifications)}
                            className="text-primary hover:opacity-90 outline-none active:scale-95"
                          >
                            {user.notificationPreferences.emailNotifications ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Maintenance Alerts */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                          <div>
                            <span className="font-semibold text-sm block">Maintenance Alerts</span>
                            <span className="text-xs text-muted-foreground">Get notified when a vehicle is marked in shop or has diagnostic reports.</span>
                          </div>
                          <button 
                            onClick={() => handleNotificationChange('maintenanceAlerts', !user.notificationPreferences.maintenanceAlerts)}
                            className="text-primary hover:opacity-90 outline-none active:scale-95"
                          >
                            {user.notificationPreferences.maintenanceAlerts ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Trip Notifications */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                          <div>
                            <span className="font-semibold text-sm block">Trip & Dispatch Notifications</span>
                            <span className="text-xs text-muted-foreground">Receive updates when a trip is dispatched, completed, or cancelled.</span>
                          </div>
                          <button 
                            onClick={() => handleNotificationChange('tripNotifications', !user.notificationPreferences.tripNotifications)}
                            className="text-primary hover:opacity-90 outline-none active:scale-95"
                          >
                            {user.notificationPreferences.tripNotifications ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Driver License Expiry */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                          <div>
                            <span className="font-semibold text-sm block">Driver License Expiry Alerts</span>
                            <span className="text-xs text-muted-foreground">Receive warning notifications when a driver's CE or C license is expiring soon.</span>
                          </div>
                          <button 
                            onClick={() => handleNotificationChange('driverLicenseExpiryAlerts', !user.notificationPreferences.driverLicenseExpiryAlerts)}
                            className="text-primary hover:opacity-90 outline-none active:scale-95"
                          >
                            {user.notificationPreferences.driverLicenseExpiryAlerts ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Weekly Reports */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                          <div>
                            <span className="font-semibold text-sm block">Weekly Summary Reports</span>
                            <span className="text-xs text-muted-foreground">Compile weekly operational metrics and download PDF links.</span>
                          </div>
                          <button 
                            onClick={() => handleNotificationChange('weeklyReports', !user.notificationPreferences.weeklyReports)}
                            className="text-primary hover:opacity-90 outline-none active:scale-95"
                          >
                            {user.notificationPreferences.weeklyReports ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Monthly Analytics Report */}
                        <div className="flex items-center justify-between pb-1">
                          <div>
                            <span className="font-semibold text-sm block">Monthly Analytics Report</span>
                            <span className="text-xs text-muted-foreground">Get advanced analytics summaries, fuel statistics, and operational trends.</span>
                          </div>
                          <button 
                            onClick={() => handleNotificationChange('monthlyAnalyticsReport', !user.notificationPreferences.monthlyAnalyticsReport)}
                            className="text-primary hover:opacity-90 outline-none active:scale-95"
                          >
                            {user.notificationPreferences.monthlyAnalyticsReport ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Activity Timeline Tab */}
                  <TabsContent value="activity" className="mt-4 focus-visible:ring-0">
                    <Card className="border border-border bg-white dark:bg-slate-900 shadow-md rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" /> Recent Activities
                        </CardTitle>
                        <CardDescription>Track user actions logged across the TransitOps ecosystem.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {user.activities.length === 0 ? (
                          <div className="text-center py-10">
                            <Clock className="w-10 h-10 text-muted-foreground/55 mx-auto mb-2 animate-bounce" />
                            <p className="text-sm font-semibold text-muted-foreground">No recent activities available</p>
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-6 space-y-6 text-xs">
                            {user.activities.map((act) => (
                              <div key={act.id} className="relative">
                                {/* Bullet indicator */}
                                <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-primary border-2 border-white dark:border-slate-900 rounded-full" />
                                
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <span className="font-semibold block text-sm text-foreground">{act.activity}</span>
                                    <span className="text-muted-foreground font-mono block mt-1">
                                      {act.date} &bull; {act.time}
                                    </span>
                                  </div>
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0 scale-95 select-none">{act.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Change Dialog Modal */}
      <DialogModal 
        open={isPasswordChangeOpen} 
        onClose={() => {
          setIsPasswordChangeOpen(false);
          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }}
      >
        <DialogContentWrapper className="w-[90vw] max-w-md bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-foreground">Change Password</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Please fill in credentials to update password security status.</p>
          
          <form onSubmit={handleSavePassword} className="space-y-4 pt-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Old Password</label>
              <Input 
                type="password" 
                required 
                name="oldPassword"
                value={passwordForm.oldPassword} 
                onChange={handlePasswordInputChange}
                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
              <Input 
                type="password" 
                required 
                name="newPassword"
                value={passwordForm.newPassword} 
                onChange={handlePasswordInputChange}
                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-muted-foreground">Password must contain length &gt;= 8, Upper Case, Digit.</span>
                <span className={`text-[10px] font-bold ${passwordStrength === 'Strong' ? 'text-emerald-500' : passwordStrength === 'Medium' ? 'text-amber-500' : 'text-destructive'}`}>
                  Strength: {passwordStrength}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
              <Input 
                type="password" 
                required 
                name="confirmPassword"
                value={passwordForm.confirmPassword} 
                onChange={handlePasswordInputChange}
                className="bg-slate-50 dark:bg-slate-950 border-border focus-visible:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsPasswordChangeOpen(false);
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="border-border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="text-xs font-semibold bg-primary shadow shadow-primary/15"
              >
                Update Password
              </Button>
            </div>
          </form>
        </DialogContentWrapper>
      </DialogModal>
    </div>
  );
}

// Inline Dialog helper to avoid extra dependencies or layout issues
interface DialogModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function DialogModal({ open, onClose, children }: DialogModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out" 
      />
      {/* Content wrapper */}
      <div className="z-10 animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

function DialogContentWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
