import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ExerciseHistory {
  maxWeight: number;
  percentages: {
    percentage: number;
    weight: number;
  }[];
}

export function useExerciseHistory(exerciseId: string) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ExerciseHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user || !exerciseId) return;

      try {
        const { data, error } = await supabase
          .from('exercise_scores')
          .select('weight')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .order('weight', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const maxWeight = data[0].weight;
          const percentages = [100, 90, 80, 70, 60, 50].map(percentage => ({
            percentage,
            weight: Math.round((maxWeight * percentage) / 100 * 2) / 2 // Rounds to nearest 0.5
          }));

          setHistory({ maxWeight, percentages });
        }
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user, exerciseId]);

  return { history, loading };
}
