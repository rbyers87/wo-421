import React from 'react';
    import { useExerciseHistory } from '../../hooks/useExerciseHistory';
    import { Trophy } from 'lucide-react';

    interface ExercisePercentagesProps {
      exerciseId: string;
      exerciseName: string;
    }

    export function ExercisePercentages({ exerciseId, exerciseName }: ExercisePercentagesProps) {
      const { history, loading } = useExerciseHistory(exerciseId);

      if (loading) return null;
      if (!history) return null;


      return (
        <div className="mt-2 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              Personal Best: {(history.maxWeight)}lbs
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {history.percentages.map(({ percentage, weight }) => (
              <div 
                key={percentage}
                className="bg-white rounded p-2 text-center shadow-sm dark:bg-gray-700"
              >
                <div className="text-sm font-medium text-indigo-600">
                  {percentage}%
                </div>
                <div className="text-sm dark:text-gray-300">
                  {weight}lbs
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
