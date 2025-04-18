import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteWorkoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  workoutName: string;
}

export function DeleteWorkoutModal({ onConfirm, onCancel, workoutName }: DeleteWorkoutModalProps) {
  return (
    <div className="fixed inset-0 dark:bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4 text-red-600">
          <Trash2 className="h-12 w-12" />
        </div>
        
        <h3 className="text-lg font-medium dark:text-gray-100 text-center mb-2">
          Delete Workout
        </h3>
        
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete "{workoutName}"? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium dark:text-gray-300 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Delete Workout
          </button>
        </div>
      </div>
    </div>
  );
}
