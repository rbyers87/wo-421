export interface Exercise {
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      created_at: string;
    }

    export interface WorkoutExercise {
      id: string;
      workout_id: string;
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number | null;
      distance?: number;
      time?: number;
      order_index: number;
      created_at: string;
      exercise: Exercise;
    }

    export interface Workout {
      id: string;
      name: string;
      description: string | null;
      type: string;
      created_by: string;
      scheduled_date: string | null;
      is_wod: boolean;
      created_at: string;
      updated_at: string;
      workout_exercises?: WorkoutExercise[];
    }

    export interface WorkoutLog {
      id: string;
      user_id: string;
      workout_id: string;
      completed_at: string;
      notes: string | null;
      score: number;
      created_at: string;
      workout: Workout;
    }

    export interface ExerciseScore {
      id: string;
      user_id: string;
      exercise_id: string;
      weight: number;
      reps: number;
      distance?: number;
      time?: number;
      date: string;
      created_at: string;
      exercise: Exercise;
    }
