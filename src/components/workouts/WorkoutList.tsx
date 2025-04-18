import React, { useState, useEffect } from 'react';
    import { supabase } from '../../lib/supabase';
    import { LoadingSpinner } from '../common/LoadingSpinner';
    import { WorkoutCard } from './WorkoutCard';
    import { WorkoutCreator } from './WorkoutCreator';
    import type { Workout } from '../../types/workout';

    export function WorkoutList() {
      const [workouts, setWorkouts] = useState<Workout[]>([]);
      const [loading, setLoading] = useState(true);

      const fetchWorkouts = async () => {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .select(`
              *,
              workout_exercises (
                *,
                exercise:exercises (*)
              )
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setWorkouts(data || []);
        } catch (error) {
          console.error('Error fetching workouts:', error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchWorkouts();
      }, []);

      if (loading) return <LoadingSpinner />;

      return (
        <div className="space-y-6">
          <WorkoutCreator onWorkoutCreated={fetchWorkouts} />
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onDelete={fetchWorkouts}
            />
          ))}
        </div>
      );
    }
