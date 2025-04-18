import { useState } from 'react';
    import { supabase } from '../lib/supabase';

    export function useWorkoutDelete() {
      const [deleting, setDeleting] = useState(false);

      const deleteWorkout = async (workoutId: string) => {
        setDeleting(true);
        try {
          // First, delete related workout_exercises
          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .delete()
            .eq('workout_id', workoutId);

          if (exercisesError) {
            console.error('Error deleting workout exercises:', exercisesError);
            throw exercisesError;
          }

          // Then, delete the workout itself
          const { error: workoutError } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

          if (workoutError) {
            console.error('Error deleting workout:', workoutError);
            throw workoutError;
          }

          return true;
        } catch (error) {
          console.error('Error deleting workout:', error);
          throw error;
        } finally {
          setDeleting(false);
        }
      };

      return { deleteWorkout, deleting };
    }
