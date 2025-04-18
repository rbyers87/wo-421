import React from 'react';
    import { ProfileSettings } from './ProfileSettings';
    import { SecuritySettings } from './SecuritySettings';
    import { NotificationSettings } from './NotificationSettings';
    import { UserManagement } from './UserManagement';
    import { AdminSettings } from './AdminSettings';
    import { WeeklyExercisesSettings } from './WeeklyExercisesSettings';
    
    export default function Settings() {
      return (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold dark:text-gray-100">Settings</h1>
          
          <div className="space-y-6">
            <ProfileSettings />
            <SecuritySettings />
            <NotificationSettings />
            <UserManagement />
            <AdminSettings />
            <WeeklyExercisesSettings />
          </div>
        </div>
      );
    }
