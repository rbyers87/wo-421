import React from 'react';
import { Trophy, Dumbbell, Calendar } from 'lucide-react';
import { useWorkoutStats } from '../../hooks/useWorkoutStats';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ProfileStats() {
  const { stats, loading } = useWorkoutStats();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Statistics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-indigo-600 mr-3" />
            <span className="dark:text-gray-300">Personal Records</span>
          </div>
          <span className="font-semibold">{stats.personalRecords}</span>
        </div>

        <div className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <Dumbbell className="h-5 w-5 text-indigo-600 mr-3" />
            <span className="dark:text-gray-300">Total Workouts</span>
          </div>
          <span className="font-semibold">{stats.totalWorkouts}</span>
        </div>

        <div className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-indigo-600 mr-3" />
            <span className="dark:text-gray-300">Workout Streak</span>
          </div>
          <span className="font-semibold">{stats.currentStreak} days</span>
        </div>
      </div>
    </div>
  );
}
