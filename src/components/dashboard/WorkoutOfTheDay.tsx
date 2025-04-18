import React, { useState, useEffect } from 'react';
    import { supabase } from '../../lib/supabase';
    import { format } from 'date-fns';
    import { LoadingSpinner } from '../common/LoadingSpinner';
    import type { Workout, WorkoutExercise } from '../../types/workout';
    import { Dumbbell, Calendar, Clock } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { WorkoutLogger } from '../workouts/WorkoutLogger';
    import { WorkoutEditor } from '../workouts/WorkoutEditor';
    import { parseISO } from 'date-fns';
    import { useAuth } from '../../contexts/AuthContext';

    interface WorkoutOfTheDayProps {
      onWorkoutComplete?: () => void;
    }

    export function WorkoutOfTheDay({ onWorkoutComplete }: WorkoutOfTheDayProps) {
      const [wodWorkout, setWodWorkout] = useState<Workout | null>(null);
      const [loading, setLoading] = useState(true);
      const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
      const [isLogging, setIsLogging] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [isCompleted, setIsCompleted] = useState(false);
      const [previousLogs, setPreviousLogs] = useState<any[]>([]);
      const { user } = useAuth();

      useEffect(() => {
        async function fetchWOD() {
          try {
            const formattedDate = format(new Date(), 'yyyy-MM-dd');

            const { data, error } = await supabase
              .from('workouts')
              .select(`
                *,
                workout_exercises (
                  *,
                  exercise:exercises (*)
                )
              `)
              .eq('is_wod', true)
              .eq('scheduled_date', formattedDate)
              .limit(1);

            if (error) throw error;
            setWodWorkout(data?.[0] || null);
            setExercises(data?.[0]?.workout_exercises || []);
            await checkCompletion(data?.[0]);
          } catch (error) {
            console.error('Error fetching WOD:', error);
          } finally {
            setLoading(false);
          }
        }

        fetchWOD();
      }, [refreshKey]);

      const checkCompletion = async (workout: Workout | null) => {
        if (!workout?.id || !user) return;
        try {
          const { data, error } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('workout_id', workout.id)
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1);

          if (error) {
            console.error('Error checking workout completion:', error);
            return;
          }

          if (data && data.length > 0) {
            setIsCompleted(true);
            setPreviousLogs(data);
          } else {
            setIsCompleted(false);
            setPreviousLogs([]);
          }
        } catch (error) {
          console.error('Error checking workout completion:', error);
        }
      };

      const handleStartWorkout = () => {
        setIsLogging(true);
      };

      const handleViewWorkout = () => {
        setIsLogging(true);
        setRefreshKey(prev => prev + 1);
      };

      const handleClose = () => {
        setIsEditing(false);
        if (onWorkoutComplete) {
          onWorkoutComplete();
        }
      };

      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          const date = parseISO(dateString);
          return format(date, 'PPP');
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      const [refreshKey, setRefreshKey] = useState(0);

      if (loading) return <LoadingSpinner />;

      return (
        <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
          <h2 className="text-2xl font-bold dark:text-gray-100">Workout of the Day</h2>
          {wodWorkout ? (
            <>
              <h3 className="text-xl font-semibold dark:text-gray-100">{wodWorkout.name}</h3>
              {wodWorkout.description && (
                <p className="dark:text-gray-300 mt-1">{wodWorkout.description}</p>
              )}
              <div className="space-y-3">
                {exercises?.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 text-indigo-600 mr-3" />
                      <div>
                        <p className="font-medium dark:text-gray-100">{exercise.exercise.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={isCompleted ? handleViewWorkout : handleStartWorkout}
                  className={`px-4 py-2 rounded-md text-white dark:bg-gray-400 bg-gray-400 ${
                    isCompleted
                      ? 'dark:bg-gray-800 hover:bg-gray-600'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isCompleted ? 'View Workout' : 'Start Workout'}
                </button>
              </div>
            </>
          ) : (
            <p>No workout scheduled for today.</p>
          )}
          {isLogging && (
            <WorkoutLogger
              workout={wodWorkout}
              onClose={handleClose}
              previousLogs={previousLogs}
              workoutLogId={previousLogs.length > 0 ? previousLogs[0].id : null}
            />
          )}
          {isEditing && (
            <WorkoutEditor
              workout={wodWorkout}
              onClose={handleClose}
            />
          )}
        </div>
      );
    }
