import React, { useState } from 'react';
import { Bell, Calendar, Trophy } from 'lucide-react';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    workout_reminders: true,
    achievement_notifications: true,
    leaderboard_updates: false,
  });

  const handleChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Notification Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium dark:text-gray-100">Workout Reminders</p>
              <p className="text-sm text-gray-500">Get notified about your scheduled workouts</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('workout_reminders')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              settings.workout_reminders ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.workout_reminders ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium dark:text-gray-100">Achievement Notifications</p>
              <p className="text-sm text-gray-500">Get notified when you reach new milestones</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('achievement_notifications')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              settings.achievement_notifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.achievement_notifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium dark:text-gray-100">Leaderboard Updates</p>
              <p className="text-sm text-gray-500">Get notified about leaderboard changes</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('leaderboard_updates')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              settings.leaderboard_updates ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.leaderboard_updates ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
