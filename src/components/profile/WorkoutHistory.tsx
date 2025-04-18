import React, { useState, useEffect } from 'react';
    import { format } from 'date-fns';
    import { supabase } from '../../lib/supabase';
    import { useAuth } from '../../contexts/AuthContext';
    import { LoadingSpinner } from '../common/LoadingSpinner';
    import type { WorkoutLog } from '../../types/workout';

    interface WorkoutHistoryProps {
      exerciseId?: string | null;
    }

    export function WorkoutHistory({ exerciseId }: WorkoutHistoryProps) {
      const { user } = useAuth();
      const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        async function fetchWorkoutHistory() {
          if (!user) return;

          try {
            let query = supabase
              .from('workout_logs')
              .select(`
                *,
                workouts (
                  *
                )
              `)
              .eq('user_id', user.id)
              .order('completed_at', { ascending: false })
              .limit(20);

            if (exerciseId) {
              query = query.contains('workouts->workout_exercises->exercise_id', [exerciseId]);
            }

            const { data, error } = await query;

            if (error) throw error;
            setWorkouts(data || []);
          } catch (error) {
            console.error('Error fetching workout history:', error);
          } finally {
            setLoading(false);
          }
        }

        fetchWorkoutHistory();
      }, [user, exerciseId]);

      if (loading) return <LoadingSpinner />;

      return (
        <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
          <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Workout History</h2>
          
          <div className="space-y-4">
            {workouts.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <h3 className="font-medium dark:text-gray-100">{log.workouts.name}</h3>
                  <p className="text-sm dark:text-gray-300">
                    {format(new Date(log.completed_at), 'PPP')}
                  </p>
                  {log.notes && (
                    <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-indigo-600 font-medium">
                    Score: {log.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
