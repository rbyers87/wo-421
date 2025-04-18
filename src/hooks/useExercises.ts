import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Exercise } from "../types/workout";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .order("name");

        if (error) {
          setError("Failed to fetch exercises. Please try again.");
          console.error("Error fetching exercises:", error);
          return;
        }

        setExercises(data || []);
      } catch (err) {
        console.error("Unexpected error fetching exercises:", err);
        setError("Unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, []);

  return { exercises, loading, error };
}
