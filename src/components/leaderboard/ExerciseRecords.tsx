import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dumbbell } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { ExerciseScore } from '../../types/workout';

interface EnhancedExerciseScore extends ExerciseScore {
  exercise?: {
    id: string;
    name: string;
  };
}

export function ExerciseRecords() {
  const [records, setRecords] = useState<EnhancedExerciseScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExerciseRecords() {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Get all exercise scores
        const { data: scores, error: scoresError } = await supabase
          .from('exercise_scores')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (scoresError) throw scoresError;
        if (!scores || scores.length === 0) {
          setRecords([]);
          setLoading(false);
          return;
        }

        // 2. Get unique exercise IDs
        const exerciseIds = [...new Set(scores.map(score => score.exercise_id))];
        
        // 3. Fetch the exercises
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .in('id', exerciseIds);
          
        if (exercisesError) throw exercisesError;
        
        // 4. Get workout info for dates
        const workoutIds = scores
          .filter(s => s.workout_id)
          .map(s => s.workout_id)
          .filter((id): id is string => Boolean(id));
        
        let workoutInfo: Record<string, { type: string, completed_at: string }> = {};
        
        if (workoutIds.length > 0) {
          const { data: workouts, error: workoutsError } = await supabase
            .from('workout_logs')
            .select('id, workout_type, completed_at')
            .in('id', workoutIds);
            
          if (workoutsError) throw workoutsError;
          
          if (workouts) {
            workoutInfo = workouts.reduce((acc, workout) => {
              acc[workout.id] = { 
                type: workout.workout_type || '',
                completed_at: workout.completed_at 
              };
              return acc;
            }, {} as Record<string, { type: string, completed_at: string }>);
          }
        }

        // 5. Enhance scores with exercise and workout info
        const enhancedScores = scores.map(score => {
          const exercise = exercises?.find(ex => ex.id === score.exercise_id);
          const workout = score.workout_id ? workoutInfo[score.workout_id] : null;
          
          return {
            ...score,
            exercise,
            workout_type: workout?.type || '',
            date: workout?.completed_at || score.created_at
          };
        });

        // 6. Group by exercise name
        const exerciseGroups: Record<string, EnhancedExerciseScore[]> = {};
        
        enhancedScores.forEach(score => {
          if (!score.exercise?.name) return;
          
          const exerciseName = score.exercise.name;
          if (!exerciseGroups[exerciseName]) {
            exerciseGroups[exerciseName] = [];
          }
          
          exerciseGroups[exerciseName].push(score);
        });

        // 7. Find the best score for each exercise based on its type
        const bestScores: EnhancedExerciseScore[] = [];
        
        Object.entries(exerciseGroups).forEach(([exerciseName, scores]) => {
          if (exerciseName === 'Run') {
            // For Run, find the score with the highest distance
            const bestScore = scores.reduce((best, current) => {
              return (current.distance || 0) > (best.distance || 0) ? current : best;
            }, scores[0]);
            
            bestScores.push(bestScore);
          } else if (exerciseName === 'Assault Bike') {
            // For Assault Bike, find the score with the highest calories
            const bestScore = scores.reduce((best, current) => {
              return (current.calories || 0) > (best.calories || 0) ? current : best;
            }, scores[0]);
            
            bestScores.push(bestScore);
          } else {
            // For weight training, find the score with the heaviest weight
            const bestScore = scores.reduce((best, current) => {
              return (current.weight || 0) > (best.weight || 0) ? current : best;
            }, scores[0]);
            
            bestScores.push(bestScore);
          }
        });
        
        // 8. Sort by date (newest first) and take the top 5
        const topRecords = bestScores
          .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
          .slice(0, 5);
          
        setRecords(topRecords);
      } catch (error) {
        console.error('Error fetching exercise records:', error);
        setError('Failed to load exercise records. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchExerciseRecords();
  }, []);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Exercise Records</h2>
      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Dumbbell className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="font-medium dark:text-gray-100">{record.exercise?.name || 'Unknown Exercise'}</p>
                <div className="text-sm text-gray-500">
                  {record.exercise?.name === 'Run' ? (
                    <>{record.distance || 0} meters</>
                  ) : record.exercise?.name === 'Assault Bike' ? (
                    <>{record.calories || 0} calories</>
                  ) : (
                    <>{record.weight || 0} lbs {record.reps > 0 && `× ${record.reps} reps`}</>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(record.date!).toLocaleDateString()}
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No exercise records yet
          </p>
        )}
      </div>
    </div>
  );
}
