import React, { useState } from "react";
    import { useWorkoutEditor } from "../../hooks/useWorkoutEditor";
    import { useWorkoutDelete } from "../../hooks/useWorkoutDelete";
    import { WorkoutExerciseEditor } from "./editor/WorkoutExerciseEditor";
    import { WorkoutDetailsEditor } from "./editor/WorkoutDetailsEditor";
    import { DeleteWorkoutModal } from "./DeleteWorkoutModal";
    import { LoadingSpinner } from "../common/LoadingSpinner";
    import { Trash2 } from "lucide-react";
    import type { Workout } from "../../types/workout";

    interface WorkoutEditorProps {
      workout: Workout;
      onClose: () => void;
    }

    export function WorkoutEditor({ workout, onClose }: WorkoutEditorProps) {
      const [showDeleteModal, setShowDeleteModal] = useState(false);
      const { deleteWorkout, deleting } = useWorkoutDelete();
      const {
        formData,
        loading,
        handleChange,
        handleExerciseChange,
        handleSubmit,
        addExercise,
        removeExercise,
        error,
      } = useWorkoutEditor(workout, onClose);

      const handleDelete = async () => {
        try {
          if (workout && workout.id) {
            await deleteWorkout(workout.id);
            onClose();
          } else {
            console.error("Workout ID is undefined, cannot delete.");
          }
        } catch (error) {
          console.error('Error deleting workout:', error);
        }
      };

      if (loading) return <LoadingSpinner />;

      return (
        <div className="fixed inset-0 dark:bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 ai-style-change-1 dark:bg-gray-700 dark:text-gray-300 dark:shadow-gray-900">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold dark:text-gray-100">Edit Workout</h2>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 p-2"
                disabled={deleting}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-500">
                Error: {error.message || "An unexpected error occurred. Please try again."}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <WorkoutDetailsEditor formData={formData} onChange={handleChange} />

              <WorkoutExerciseEditor
                exercises={formData.exercises}
                onChange={handleExerciseChange}
                onAdd={addExercise}
                onRemove={removeExercise}
              />

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium dark:text-gray-300 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {showDeleteModal && (
            <DeleteWorkoutModal
              workoutName={workout.name}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteModal(false)}
            />
          )}
        </div>
      );
    }
