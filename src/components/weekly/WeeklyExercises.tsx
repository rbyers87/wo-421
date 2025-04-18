import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import { CheckCircle, Circle } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WeeklyExercise {
  id: string;
  name: string;
}

interface CompletedExercise {
  exercise_id: string;
  completed_at: string;
}

interface WeeklyExercisesProps {
  completedExercises?: CompletedExercise[];
}

export function WeeklyExercises({ completedExercises: initialCompletedExercises }: WeeklyExercisesProps) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<WeeklyExercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>(initialCompletedExercises || []);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    async function fetchExercises() {
      setLoading(true);
      try {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .order('name');

        if (exercisesError) throw exercisesError;
        setExercises(exercisesData || []);

        if (user) {
          const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
          const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');

          // Modified query to directly get exercise IDs
          const { data: completedData, error: completedError } = await supabase
            .from('workout_logs')
            .select(`
              completed_at,
              workout:workouts!inner (
                workout_exercises!inner (
                  exercise_id
                )
              )
            `)
            .eq('user_id', user.id)
            .gte('completed_at', weekStart)
            .lte('completed_at', weekEnd);

          if (completedError) throw completedError;

          console.log('Completed Data:', completedData); // Debug log

          const formattedCompletedExercises = completedData?.flatMap(log =>
            log.workout.workout_exercises.map(ex => ({
              exercise_id: ex.exercise_id,
              completed_at: log.completed_at,
            }))
          ) || [];

          console.log('Formatted Exercises:', formattedCompletedExercises); // Debug log
          setCompletedExercises(formattedCompletedExercises);
        }
      } catch (error) {
        console.error('Error fetching weekly exercises:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, [user, currentWeekStart]);

  useEffect(() => {
    if (initialCompletedExercises) {
      setCompletedExercises(initialCompletedExercises);
    }
  }, [initialCompletedExercises]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const isExerciseCompleted = (exerciseId: string) => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    
    return completedExercises.some(
      (completed) => {
        const completedDate = new Date(completed.completed_at);
        return completed.exercise_id === exerciseId &&
          isWithinInterval(completedDate, {
            start: currentWeekStart,
            end: weekEnd
          });
      }
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100 dark:text-white">Weekly Exercises</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:dark:bg-gray-700 dark:hover:bg-gray-700 rounded-full"
            aria-label="Previous week"
          >
            &lt;
          </button>
          <span className="text-sm dark:text-gray-300 dark:text-gray-300">
            {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d')}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:dark:bg-gray-700 dark:hover:bg-gray-700 rounded-full"
            aria-label="Next week"
          >
            &gt;
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="flex items-center justify-between p-2 dark:bg-gray-800 dark:bg-gray-700 rounded-lg">
            <span className="dark:text-gray-100 dark:text-white">{exercise.name}</span>
            {isExerciseCompleted(exercise.id) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
