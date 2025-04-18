import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { WorkoutForm } from './WorkoutForm';

interface WorkoutCreatorProps {
  onWorkoutCreated: (newWorkout: any) => void; // Function that accepts a workout object
}

export function WorkoutCreator({ onWorkoutCreated }: WorkoutCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    if (onWorkoutCreated) {
      onWorkoutCreated(); // Only call if onWorkoutCreated is defined
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        <Plus className="h-5 w-5" />
        <span>Create Workout</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 dark:bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 ai-style-change-1 dark:bg-gray-700 dark:text-gray-300 dark:shadow-gray-900">
            <div className="p-6">
              <h2 className="text-2xl font-bold dark:text-gray-100 mb-6">Create New Workout</h2>
              <WorkoutForm onClose={handleClose} onCreate={onWorkoutCreated} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
