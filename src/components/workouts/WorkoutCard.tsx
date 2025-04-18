import React, { useState, useEffect } from 'react';
    import { Calendar, Clock, Dumbbell } from 'lucide-react';
    import { WorkoutLogger } from './WorkoutLogger';
    import { WorkoutEditor } from './WorkoutEditor';
    import { supabase } from '../../lib/supabase';
    import type { Workout, WorkoutExercise } from '../../types/workout';
    import { format, parseISO } from 'date-fns';
    import { useAuth } from '../../contexts/AuthContext';
    
    interface WorkoutCardProps {
      workout: Workout;
      onDelete: () => void;
    }
    
    export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
      const [isLogging, setIsLogging] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
      const [loadingExercises, setLoadingExercises] = useState(true);
      const [isCompleted, setIsCompleted] = useState(false);
      const [previousLogs, setPreviousLogs] = useState<any[]>([]);
      const [refreshTrigger, setRefreshTrigger] = useState(0);
      const { user } = useAuth();
    
      const fetchExercises = async () => {
        setLoadingExercises(true);
        try {
          const { data, error } = await supabase
            .from('workout_exercises')
            .select(`
              *,
              exercise:exercises (*)
            `)
            .eq('workout_id', workout.id);
    
          if (error) {
            console.error('Error fetching exercises:', error);
            return;
          }
          setExercises(data || []);
        } finally {
          setLoadingExercises(false);
        }
      };
    
      const checkCompletion = async () => {
        if (!workout.id || !user) return;
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
    
      useEffect(() => {
        fetchExercises();
        checkCompletion();
      }, [workout.id, refreshTrigger, user]);
    
      const handleClose = () => {
        setIsEditing(false);
        onDelete();
      };
    
      const handleStartWorkout = () => {
        setIsLogging(true);
      };
    
      const handleViewWorkout = () => {
        setIsLogging(true);
        setRefreshTrigger(prev => prev + 1);
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
    
      return (
        <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold dark:text-gray-100 dark:text-gray-100">{workout.name}</h3>
              {workout.description && (
                <p className="dark:text-gray-300 dark:text-gray-400 mt-1">{workout.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              {workout.scheduled_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 dark:text-gray-400" />
                  <span className="text-sm dark:text-gray-300">
                    {formatDate(workout.scheduled_date)}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 dark:text-gray-400" />
                <span className="text-sm dark:text-gray-300">~45 min</span>
              </div>
            </div>
          </div>
    
          <div className="space-y-3">
            {loadingExercises ? (
              <p className="text-gray-500 dark:text-gray-400">Loading exercises...</p>
            ) : (
              exercises?.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <div>
                      <p className="font-medium dark:text-gray-100 dark:text-gray-100">{exercise.exercise.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
    
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Edit
            </button>
            <button
              onClick={isCompleted ? handleViewWorkout : handleStartWorkout}
              className={`px-4 py-2 rounded-md text-white dark:bg-gray-400 bg-gray-400 ${
                isCompleted
                  ? 'dark:bg-gray-800 hover:bg-gray-600 dark:bg-gray-400 dark:hover:dark:bg-gray-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-300'
              }`}
            >
              {isCompleted ? 'View Workout' : 'Start Workout'}
            </button>
          </div>
    
          {isLogging && (
            <WorkoutLogger
              workout={workout}
              onClose={() => setIsLogging(false)}
              previousLogs={previousLogs}
              workoutLogId={previousLogs.length > 0 ? previousLogs[0].id : null}
            />
          )}
    
          {isEditing && (
            <WorkoutEditor
              workout={workout}
              onClose={handleClose}
            />
          )}
        </div>
      );
    }
