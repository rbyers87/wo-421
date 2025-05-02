import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ExercisePercentages } from './ExercisePercentages';
import type { Workout, WorkoutExercise, ExerciseScore } from '../../types/workout';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutLoggerProps {
  workout: Workout;
  onClose: (completedExercises?: any[]) => void;
  previousLogs?: any[];
  workoutLogId?: string | null;
  isCompleted?: boolean;
}

interface ExerciseLog {
  exercise_id: string;
  sets: Array<{
    id?: string;
    weight: number;
    reps: number;
    distance?: number;
    time?: string | number | null;
    calories?: number;
  }>;
}

export function WorkoutLogger({ workout, onClose, previousLogs, workoutLogId: initialWorkoutLogId, isCompleted }: WorkoutLoggerProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(initialWorkoutLogId);
  const [existingScores, setExistingScores] = useState<ExerciseScore[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      let initialLogs: ExerciseLog[] = [];
      let fetchedExistingScores: ExerciseScore[] = [];

      if (initialWorkoutLogId) {
        setWorkoutLogId(initialWorkoutLogId);
        try {
          const { data, error } = await supabase
            .from('exercise_scores')
            .select('*')
            .eq('workout_log_id', initialWorkoutLogId)
            .eq('user_id', user.id);

          if (error) throw error;
          fetchedExistingScores = data || [];
        } catch (error) {
          console.error('Error fetching previous exercise scores:', error);
        }
      } else if (previousLogs && previousLogs.length > 0) {
        const lastLog = previousLogs[0];
        setNotes(lastLog.notes || '');
        setWorkoutLogId(lastLog.id);
        try {
          const { data, error } = await supabase
            .from('exercise_scores')
            .select('*')
            .eq('workout_log_id', lastLog.id)
            .eq('user_id', user.id);

          if (error) throw error;
          fetchedExistingScores = data || [];
        } catch (error) {
          console.error('Error fetching previous exercise scores:', error);
        }
      }

      initialLogs = workout.workout_exercises?.map((exercise) => {
        const exerciseScores = fetchedExistingScores.filter((score) => score.exercise_id === exercise.exercise_id);
        const sets = exerciseScores.map((score) => ({
          id: score.id,
          weight: score.weight || 0,
          reps: score.reps,
          distance: score.distance,
          time: formatTime(score.time),
          calories: score.calories,
        }));

        if (sets.length === 0) {
          return {
            exercise_id: exercise.exercise_id,
            sets: Array(exercise.sets).fill({
              weight: null,
              reps: exercise.reps,
              distance: exercise.distance,
              time: formatTime(exercise.time),
              calories: exercise.calories,
            }),
          };
        }

        return {
          exercise_id: exercise.exercise_id,
          sets: sets,
        };
      }) || [];

      setLogs(initialLogs);
      setExistingScores(fetchedExistingScores);
    };

    fetchInitialData();
  }, [previousLogs, workout, user, initialWorkoutLogId]);

  const formatTime = (time: string | number | null): string => {
    if (time == null) return '00:00';
    if (typeof time === 'number') {
      const mins = Math.floor(time);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${String(hours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}`;
    }
    return time;
  };

  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'distance' | 'time' | 'calories',
    value: any
  ) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      newLogs[exerciseIndex].sets[setIndex] = {
        ...newLogs[exerciseIndex].sets[setIndex],
        [field]: field === 'time' ? value : Number(value),
      };
      return newLogs;
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      const exercise = workout.workout_exercises?.[exerciseIndex];
      if (exercise) {
        newLogs[exerciseIndex] = {
          ...newLogs[exerciseIndex],
          sets: [...newLogs[exerciseIndex].sets, {
            id: uuidv4(), // Generate a new UUID for the new set
            weight: null,
            reps: exercise.reps,
            distance: exercise.distance,
            time: formatTime(exercise.time),
            calories: exercise.calories,
          }]
        };
      }
      return newLogs;
    });
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      newLogs[exerciseIndex].sets = newLogs[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      return newLogs;
    });
  };

  const calculateScore = (exercise: WorkoutExercise, log: ExerciseLog, workoutType: string) => {
    // Calculate score based on exercise type
    if (exercise.exercise.name === 'Run') {
      // Score for Run is based on total distance
      return log.sets.reduce((total, set) => total + (set.distance || 0), 0);
    } else if (exercise.exercise.name === 'Assault Bike') {
      // Score for Assault Bike is based on total calories
      return log.sets.reduce((total, set) => total + (set.calories || 0), 0);
    } else if (workoutType === 'weight training') {
      // Score for weight training workouts is based on the heaviest weight used
      let maxWeight = 0;
      log.sets.forEach(set => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
      return maxWeight;
    } else {
      // Score for other exercises is based on the heaviest weight used
      let maxWeight = 0;
      log.sets.forEach(set => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
      return maxWeight;
    }
  };

  const calculateTotal = (exercise: WorkoutExercise, log: ExerciseLog) => {
    if (exercise.exercise.name === 'Run') {
      return log.sets.reduce((total, set) => {
        return total + (set.distance || 0);
      }, 0);
    } else if (exercise.exercise.name === 'Assault Bike') {
      return log.sets.reduce((total, set) => {
        return total + (set.calories || 0);
      }, 0);
    } else {
      return log.sets.reduce(
        (total, set) => total + set.weight * set.reps,
        0
      );
    }
  };

  const handleCancel = () => {
    onClose(); // Close the modal without saving changes
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('User is not logged in.');
      return;
    }

    setSaving(true);

    try {
      // Calculate the total score and total for the workout
      const score = logs.reduce((total, log, index) => {
        const exercise = workout.workout_exercises?.[index];
        return total + (exercise ? calculateScore(exercise, log, workout.type) : 0);
      }, 0);

      const total = logs.reduce((total, log, index) => {
        const exercise = workout.workout_exercises?.[index];
        return total + (exercise ? calculateTotal(exercise, log) : 0);
      }, 0);

      // Define a variable to hold the current workout log ID
      let currentWorkoutLogId = workoutLogId;

      // Check if we're updating an existing workout log or creating a new one
      if (currentWorkoutLogId) {
        // Update existing workout log
        const { data, error: updateError } = await supabase
          .from('workout_logs')
          .update({
            notes,
            score,
            total,
            completed_at: new Date().toISOString(),
          })
          .eq('id', currentWorkoutLogId)
          .select()
          .maybeSingle();

        if (updateError) {
          console.error('Error updating workout log:', updateError);
          throw updateError;
        }

        if (!data) {
          console.warn('No workout log found with that ID to update.');
          // Instead of throwing an error, we'll create a new workout log
          const { data: newData, error: createError } = await supabase
            .from('workout_logs')
            .insert({
              user_id: user.id,
              workout_id: workout.id,
              notes,
              completed_at: new Date().toISOString(),
              score,
              total,
            })
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Error creating workout log after failed update:', createError);
            throw createError;
          }

          if (!newData) {
            console.error('Failed to create new workout log after failed update');
            throw new Error('Failed to create or update workout log');
          }

          // Update to use the newly created workout log ID
          currentWorkoutLogId = newData.id;
          setWorkoutLogId(currentWorkoutLogId);
        }
        // We don't need to update currentWorkoutLogId if the update succeeded
      } else {
        // Create new workout log
        const { data, error: workoutError } = await supabase
          .from('workout_logs')
          .insert({
            user_id: user.id,
            workout_id: workout.id,
            notes,
            completed_at: new Date().toISOString(),
            score,
            total,
          })
          .select()
          .maybeSingle();

        if (workoutError) {
          console.error('Error creating workout log:', workoutError);
          throw workoutError;
        }

        if (!data) {
          console.warn('Workout log creation returned no data.');
          throw new Error('Failed to create workout log');
        }

        // Update the current workout log ID with the new one
        currentWorkoutLogId = data.id;
        setWorkoutLogId(currentWorkoutLogId);
      }

      // Make sure we have a valid workout log ID at this point
      if (!currentWorkoutLogId) {
        throw new Error('Missing workout log ID');
      }

      // Prepare exercise scores for upsert
      const exerciseScoresToUpsert = logs.flatMap((log, index) => {
        const exercise = workout.workout_exercises?.[index];
        if (!exercise) return [];
        return log.sets.map((set) => {
          return {
            id: set.id || uuidv4(),
            user_id: user.id,
            workout_log_id: currentWorkoutLogId, // Use the current workout log ID
            exercise_id: log.exercise_id,
            weight: set.weight,
            reps: set.reps,
            distance: set.distance,
            time: set.time,
            calories: set.calories,
          };
        });
      });

      // Upsert exercise scores
      const { error: upsertError } = await supabase
        .from('exercise_scores')
        .upsert(exerciseScoresToUpsert, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error upserting exercise scores:', upsertError);
        throw upsertError;
      }

      // Handle deleted sets
      if (currentWorkoutLogId) {
        const existingScoreIds = existingScores.map(es => es.id);
        const currentScoreIds = exerciseScoresToUpsert.map(es => es.id).filter(id => id);
        const scoresToDelete = existingScoreIds.filter(id => !currentScoreIds.includes(id));

        if (scoresToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('exercise_scores')
            .delete()
            .in('id', scoresToDelete);

          if (deleteError) throw deleteError;
        }
      }

      // Get completed exercises for the week in the format WeeklyExercises expects
      if (user) {
        const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

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

        const formattedCompletedExercises = completedData?.flatMap(log =>
          log.workout.workout_exercises.map(ex => ({
            exercise_id: ex.exercise_id,
            completed_at: log.completed_at,
          }))
        ) || [];

        onClose(formattedCompletedExercises);
      } else {
        onClose();
      }

      alert('Workout logged successfully!');
    } catch (error) {
      console.error('Error logging workout:', error);
      alert(`Failed to log workout: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 dark:bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 ai-style-change-1 dark:bg-gray-700 dark:text-gray-300 dark:shadow-gray-900">
        <h2 className="text-2xl font-bold dark:text-gray-100 mb-6">
          Log Workout: {workout.name}
        </h2>

        <div className="space-y-6">
          {workout.workout_exercises?.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-3">
                {exercise.exercise.name}
              </h3>

              <ExercisePercentages 
                exerciseId={exercise.exercise_id}
                exerciseName={exercise.exercise.name}
              />

              <div className="space-y-3 mt-4">
                {Array.from({ length: logs[exerciseIndex]?.sets?.length || 0 }).map((_, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-gray-500">
                      Set {setIndex + 1}
                    </div>
                    {
                      exercise.exercise.name === 'Run' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Time (HH:MM)</label>
                            <input
                              type="text"
                              value={logs[exerciseIndex].sets[setIndex].time || '00:00'}
                              onChange={(e) =>
                                handleSetChange(exerciseIndex, setIndex, 'time', e.target.value)
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="HH:MM"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Distance (meters)</label>
                            <input
                              type="number"
                              value={logs[exerciseIndex].sets[setIndex].distance}
                              onChange={(e) =>
                                handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'distance',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="Distance (meters)"
                            />
                          </div>
                        </>
                      ) : exercise.exercise.name === 'Assault Bike' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Time (HH:MM)</label>
                            <input
                              type="text"
                              value={logs[exerciseIndex].sets[setIndex].time || '00:00'}
                              onChange={(e) =>
                                handleSetChange(exerciseIndex, setIndex, 'time', e.target.value)
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="HH:MM"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Calories</label>
                            <input
                              type="number"
                              value={logs[exerciseIndex].sets[setIndex].calories}
                              onChange={(e) =>
                                handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'calories',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="Calories"
                            />
                          </div>
                        </>
                      ) : exercise.exercise.name === 'Rower' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Distance (meters)</label>
                            <input
                              type="number"
                              value={logs[exerciseIndex].sets[setIndex].distance}
                              onChange={(e) =>
                                handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'distance',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="Distance (meters)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Calories</label>
                            <input
                              type="number"
                              value={logs[exerciseIndex].sets[setIndex].calories}
                              onChange={(e) =>
                                handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'calories',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="Calories"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <input
                              type="number"
                              value={logs[exerciseIndex].sets[setIndex].weight || ''}
                              onChange={(e) =>
                                handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'weight',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="Weight"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={logs[exerciseIndex].sets[setIndex].reps}
                              onChange={(e) =>
                                handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'reps',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full rounded-md border-gray-300"
                              placeholder="Reps"
                            />
                          </div>
                        </>
                      )}
                    <button
                      onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="mt-2 text-indigo-600 font-medium hover:underline"
                >
                  Add Set
                </button>
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-gray-300"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium dark:text-gray-300 hover:text-gray-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              disabled={saving}
            >
              {saving ? 'Saving...' : isCompleted ? 'Update Workout' : 'Complete Workout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
