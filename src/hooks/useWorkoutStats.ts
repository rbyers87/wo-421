import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutStats {
  personalRecords: number;
  totalWorkouts: number;
  currentStreak: number;
}

export function useWorkoutStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkoutStats>({
    personalRecords: 0,
    totalWorkouts: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        const [prCount, workoutCount, streakData] = await Promise.all([
          supabase
            .from('exercise_scores')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('workout_logs')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('workout_logs')
            .select('completed_at')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
        ]);

        // Calculate streak
        let streak = 0;
        if (streakData.data) {
          const today = new Date();
          let currentDate = today;
          
          for (const log of streakData.data) {
            const logDate = new Date(log.completed_at);
            if (
              logDate.toDateString() === currentDate.toDateString() ||
              logDate.toDateString() === new Date(currentDate.setDate(currentDate.getDate() - 1)).toDateString()
            ) {
              streak++;
              currentDate = logDate;
            } else {
              break;
            }
          }
        }

        setStats({
          personalRecords: prCount.count || 0,
          totalWorkouts: workoutCount.count || 0,
          currentStreak: streak,
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
}
