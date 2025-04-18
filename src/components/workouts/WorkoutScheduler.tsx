import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Workout } from '../../types/workout';

export function WorkoutScheduler() {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    async function fetchScheduledWorkouts() {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date');
      
      if (data) setScheduledWorkouts(data);
    }

    fetchScheduledWorkouts();
  }, []);

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Scheduled Workouts</h2>

      <div className="space-y-4">
        {scheduledWorkouts.map((workout) => (
          <div
            key={workout.id}
            className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg"
          >
            <div>
              <p className="font-medium dark:text-gray-100">{workout.name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(workout.scheduled_date!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {scheduledWorkouts.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No upcoming scheduled workouts
          </p>
        )}
      </div>
    </div>
  );
}
