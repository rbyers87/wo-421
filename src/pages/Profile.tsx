import React, { useState } from 'react';
    import { ProfileHeader } from '../components/profile/ProfileHeader';
    import { ProfileStats } from '../components/profile/ProfileStats';
    import { WorkoutHistory } from '../components/profile/WorkoutHistory';
    import { useProfile } from '../hooks/useProfile';
    import { LoadingSpinner } from '../components/common/LoadingSpinner';
    import { useExercises } from '../hooks/useExercises';
    import { ExercisePercentages } from '../components/workouts/ExercisePercentages';

    export default function Profile() {
      const { profile, loading } = useProfile();
      const { exercises, loading: exercisesLoading } = useExercises();
      const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

      if (loading || exercisesLoading) return <LoadingSpinner />;
      if (!profile) return null;

      return (
        <div className="space-y-8">
          <ProfileHeader profile={profile} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <label htmlFor="exerciseSelect" className="block text-sm font-medium dark:text-gray-300">
                  Select Exercise
                </label>
                <select
                  id="exerciseSelect"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  value={selectedExercise || ''}
                >
                  <option value="">Select an exercise</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedExercise && (
                <ExercisePercentages exerciseId={selectedExercise} exerciseName={exercises.find(ex => ex.id === selectedExercise)?.name || ''} />
              )}
              <WorkoutHistory exerciseId={selectedExercise} />
            </div>
            <div>
              <ProfileStats />
            </div>
          </div>
        </div>
      );
    }
