import { useState } from "react";
    import { supabase } from "../lib/supabase";
    import { v4 as uuidv4 } from "uuid"; // Add this import for UUID generation
    import type { Workout } from "../types/workout";

    export interface WorkoutExerciseFormData {
      id?: string;
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number;
    }

    export interface WorkoutFormData {
      name: string;
      description: string;
      type: string;
      is_wod: boolean;
      scheduled_date: string;
      exercises: WorkoutExerciseFormData[];
      deletedExerciseIds: string[]; // Track deleted exercise IDs
    }

    export function useWorkoutEditor(workout: Workout, onClose: () => void) {
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<Error | null>(null);
      const [formData, setFormData] = useState<WorkoutFormData>({
        name: workout.name,
        description: workout.description || "",
        type: workout.type,
        is_wod: workout.is_wod,
        scheduled_date: workout.scheduled_date || new Date().toISOString().split("T")[0],
        exercises: workout.workout_exercises?.map((exercise) => ({
          id: exercise.id,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || 0,
        })) || [],
        deletedExerciseIds: [], // Initialize empty array for tracking deletions
      });

      const handleChange = (field: keyof WorkoutFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      };

      const handleExerciseChange = (
        index: number,
        field: keyof WorkoutExerciseFormData,
        value: any
      ) => {
        setFormData((prev) => ({
          ...prev,
          exercises: prev.exercises.map((exercise, i) =>
            i === index ? { ...exercise, [field]: value } : exercise
          ),
        }));
      };

      const addExercise = () => {
        setFormData((prev) => ({
          ...prev,
          exercises: [
            ...prev.exercises,
            { id: uuidv4(), exercise_id: "", sets: null, reps: null, weight: null }, // Generate a unique ID for new exercises
          ],
        }));
      };

      const removeExercise = (index: number) => {
        setFormData((prev) => {
          const exercise = prev.exercises[index];
          const newDeletedIds = exercise.id 
            ? [...prev.deletedExerciseIds, exercise.id]
            : prev.deletedExerciseIds;

          return {
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index),
            deletedExerciseIds: newDeletedIds,
          };
        });
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          // Update workout details
          const { error: updateWorkoutError } = await supabase
            .from("workouts")
            .update({
              name: formData.name,
              description: formData.description,
              type: formData.type,
              is_wod: formData.is_wod,
              scheduled_date: formData.scheduled_date,
              updated_at: new Date().toISOString(),
            })
            .eq("id", workout.id);

          if (updateWorkoutError) throw updateWorkoutError;

          // Delete removed exercises
          if (formData.deletedExerciseIds.length > 0) {
            const { error: deleteError } = await supabase
              .from("workout_exercises")
              .delete()
              .in("id", formData.deletedExerciseIds);

            if (deleteError) throw deleteError;
          }

          // Update existing exercises and insert new ones
          const exercisesToUpsert = formData.exercises.map((exercise, index) => ({
            id: exercise.id, // Include id for existing and new exercises
            workout_id: workout.id,
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            order_index: index,
          }));

          const { error: upsertError } = await supabase
            .from("workout_exercises")
            .upsert(exercisesToUpsert, {
              onConflict: 'id',
            });

          if (upsertError) throw upsertError;

          onClose();
        } catch (err: any) {
          console.error("Error updating workout:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      return {
        formData,
        loading,
        error,
        handleChange,
        handleExerciseChange,
        handleSubmit,
        addExercise,
        removeExercise,
      };
    }
