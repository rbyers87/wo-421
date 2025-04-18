import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Workout } from '../types/workout';

interface LoggedSet {
  id?: string;
  weight: number | null;
  reps: number;
  distance?: number;
  time?: string | number | null;
  calories?: number;
}

interface ExerciseLog {
  exercise_id: string;
  sets: LoggedSet[];
}

export function useWorkoutLogger() {
  const { user } = useAuth();
  const [logging, setLogging] = useState(false);

  const startWorkoutLogging = async (workout: Workout) => {
    if (!user) {
      throw new Error('User must be logged in to start a workout');
    }

    setLogging(true);

    // Initialize exercise logs based on workout exercises
    const initialLogs: ExerciseLog[] = workout.workout_exercises?.map((exercise) => ({
      exercise_id: exercise.exercise_id,
      sets: Array(exercise.sets).fill({
        weight: exercise.weight || 0,
        reps: exercise.reps,
        distance: exercise.distance,
        time: exercise.time,
        calories: exercise.calories,
      }),
    })) || [];

    return initialLogs;
  };

  const calculateTotalScore = (logs: ExerciseLog[], workout: Workout) => {
    return logs.reduce((total, log, index) => {
      const exercise = workout.workout_exercises?.[index];
      if (!exercise) return total;
      
      if (exercise.exercise.name === 'Run') {
        // Score for Run is based on total distance
        return total + log.sets.reduce((setTotal, set) => setTotal + (set.distance || 0), 0);
      } else if (exercise.exercise.name === 'Assault Bike') {
        // Score for Assault Bike is based on total calories
        return total + log.sets.reduce((setTotal, set) => setTotal + (set.calories || 0), 0);
      } else if (workout.type === 'weight training') {
        // Score for weight training is based on weight * reps
        return total + log.sets.reduce((setTotal, set) => {
          return setTotal + ((set.weight || 0) * set.reps);
        }, 0);
      } else {
        // Default scoring
        return total + log.sets.reduce((setTotal, set) => {
          return setTotal + ((set.weight || 0) * set.reps);
        }, 0);
      }
    }, 0);
  };

  const logWorkout = async (
    workout: Workout,
    logs: ExerciseLog[],
    notes: string = ''
  ) => {
    if (!user) {
      throw new Error('User must be logged in to log a workout');
    }

    try {
      // Calculate total score
      const totalScore = calculateTotalScore(logs, workout);

      // Create workout log
      const { data: workoutLog, error: workoutError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          notes,
          score: totalScore,
          total: totalScore,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercise scores
      const exerciseScores = logs.flatMap((log) =>
        log.sets.map((set) => ({
          user_id: user.id,
          workout_log_id: workoutLog.id,
          exercise_id: log.exercise_id,
          weight: set.weight,
          reps: set.reps,
          distance: set.distance,
          time: set.time,
          calories: set.calories,
        }))
      );

      const { error: scoresError } = await supabase
        .from('exercise_scores')
        .insert(exerciseScores);

      if (scoresError) throw scoresError;

      return workoutLog;
    } catch (error) {
      console.error('Error logging workout:', error);
      throw error;
    } finally {
      setLogging(false);
    }
  };

  const updateWorkoutLog = async (
    workoutLogId: string,
    workout: Workout,
    logs: ExerciseLog[],
    notes: string = ''
  ) => {
    if (!user) {
      throw new Error('User must be logged in to update a workout');
    }

    try {
      // Calculate total score
      const totalScore = calculateTotalScore(logs, workout);

      // Update the workout log
      const { data: workoutLog, error: workoutError } = await supabase
        .from('workout_logs')
        .update({
          notes,
          score: totalScore,
          total: totalScore,
          completed_at: new Date().toISOString(),
        })
        .eq('id', workoutLogId)
        .eq('user_id', user.id)  // Safety check
        .select()
        .single();

      if (workoutError) throw workoutError;

      // First, fetch existing exercise scores
      const { data: existingScores, error: fetchError } = await supabase
        .from('exercise_scores')
        .select('id')
        .eq('workout_log_id', workoutLogId);

      if (fetchError) throw fetchError;

      // Create a map of existing score IDs
      const existingScoreIds = new Set((existingScores || []).map(score => score.id));

      // Prepare scores for upsert with IDs for existing scores
      const exerciseScores = logs.flatMap((log) =>
        log.sets.map((set) => ({
          id: set.id, // Use existing ID if available
          user_id: user.id,
          workout_log_id: workoutLogId,
          exercise_id: log.exercise_id,
          weight: set.weight,
          reps: set.reps,
          distance: set.distance,
          time: set.time,
          calories: set.calories,
        }))
      );

      // Find scores to delete (IDs in existingScoreIds but not in exerciseScores)
      const currentScoreIds = new Set(exerciseScores.filter(score => score.id).map(score => score.id));
      const scoreIdsToDelete = Array.from(existingScoreIds).filter(id => !currentScoreIds.has(id));

      // Delete scores that no longer exist
      if (scoreIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('exercise_scores')
          .delete()
          .in('id', scoreIdsToDelete);

        if (deleteError) throw deleteError;
      }

      // Upsert the scores (update existing ones, insert new ones)
      const { error: upsertError } = await supabase
        .from('exercise_scores')
        .upsert(exerciseScores, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      return workoutLog;
    } catch (error) {
      console.error('Error updating workout log:', error);
      throw error;
    } finally {
      setLogging(false);
    }
  };

  return {
    logging,
    startWorkoutLogging,
    logWorkout,
    updateWorkoutLog,
  };
}