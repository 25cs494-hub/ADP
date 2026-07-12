import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences.</p>
        </div>
        <Button className="gap-2">
          <SettingsIcon className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>Update your personal information and avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">Profile settings coming soon...</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive alerts and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">Notification preferences coming soon...</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your password and authentication methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-sm text-muted-foreground">Security settings coming soon...</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Export your data and manage backups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-sm text-muted-foreground">Data management coming soon...</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
