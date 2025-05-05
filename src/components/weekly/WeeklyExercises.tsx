import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { CheckCircle, Circle } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WeeklyExercise {
  id: string;
  name: string;
}

interface ScheduledExercise {
  exercise_id: string;
  scheduled_date: string;
}

interface WeeklyExercisesProps {
  scheduledExercises?: ScheduledExercise[];
}

export function WeeklyExercises({ scheduledExercises: initialScheduledExercises }: WeeklyExercisesProps) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<WeeklyExercise[]>([]);
  const [scheduledExercises, setScheduledExercises] = useState<ScheduledExercise[]>(initialScheduledExercises || []);
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
          // Get normalized date strings for comparison
          const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
          const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          
          console.log('Fetching scheduled exercises between:', weekStart, 'and', weekEnd);

          // Modified query to get exercises from workouts table using scheduled_date
          const { data: scheduledData, error: scheduledError } = await supabase
            .from('workouts')
            .select(`
              id,
              scheduled_date,
              workout_exercises (
                exercise_id
              )
            `)
            .eq('user_id', user.id)
            .gte('scheduled_date', `${weekStart}`)
            .lte('scheduled_date', `${weekEnd}`);

          if (scheduledError) throw scheduledError;

          console.log('Scheduled Data:', scheduledData); // Debug log

          const formattedScheduledExercises = scheduledData?.flatMap(workout =>
            workout.workout_exercises.map(ex => ({
              exercise_id: ex.exercise_id,
              scheduled_date: workout.scheduled_date,
            }))
          ) || [];

          console.log('Formatted Scheduled Exercises:', formattedScheduledExercises); // Debug log
          setScheduledExercises(formattedScheduledExercises);
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
    if (initialScheduledExercises) {
      setScheduledExercises(initialScheduledExercises);
    }
  }, [initialScheduledExercises]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const isExerciseScheduled = (exerciseId: string) => {
    // Create start and end dates for the current week, normalizing time boundaries
    const weekStart = setHours(setMinutes(setSeconds(setMilliseconds(currentWeekStart, 0), 0), 0), 0);
    const weekEnd = setHours(setMinutes(setSeconds(setMilliseconds(
      endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 999), 59), 23), 23);
    
    // Debug log for week boundaries
    console.log('Checking exercise', exerciseId, 'within interval:', format(weekStart, 'yyyy-MM-dd HH:mm:ss'), 'to', format(weekEnd, 'yyyy-MM-dd HH:mm:ss'));
    
    return scheduledExercises.some(scheduled => {
      const scheduledDate = parseISO(scheduled.scheduled_date);
      
      // Debug log for each comparison
      console.log(
        'Exercise:', exerciseId, 
        'Scheduled:', scheduled.exercise_id, 
        'Date:', format(scheduledDate, 'yyyy-MM-dd HH:mm:ss'),
        'In range?', isWithinInterval(scheduledDate, { start: weekStart, end: weekEnd })
      );
      
      return scheduled.exercise_id === exerciseId && 
             isWithinInterval(scheduledDate, { start: weekStart, end: weekEnd });
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Weekly Exercises</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            aria-label="Previous week"
          >
            &lt;
          </button>
          <span className="text-sm dark:text-gray-300">
            {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d')}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            aria-label="Next week"
          >
            &gt;
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="dark:text-white">{exercise.name}</span>
            {isExerciseScheduled(exercise.id) ? (
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
