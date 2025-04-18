import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TopPerformer {
  id: string;
  profile_name: string;
  first_name: string;
  last_name: string;
  workout_count: number;
}

export function TopPerformers() {
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopPerformers() {
      try {
        setLoading(true);
        // Get date from 7 days ago
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        // Fetch workout logs from the past 7 days
        const { data, error } = await supabase
          .from('workout_logs')
          .select(`
            user_id,
            profiles (
              id,
              first_name,
              last_name,
              profile_name
            )
          `)
          .gte('completed_at', sevenDaysAgo);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setPerformers([]);
          return;
        }
        
        // Process the data to count workouts per user
        const userCounts = data.reduce((acc: Record<string, TopPerformer>, log) => {
          const profile = log.profiles;
          if (!profile) return acc;
          
          if (!acc[profile.id]) {
            acc[profile.id] = {
              id: profile.id,
              profile_name: profile.profile_name || '',
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              workout_count: 0
            };
          }
          
          acc[profile.id].workout_count++;
          return acc;
        }, {});
        
        // Convert to array, sort by workout count, and take top 5
        const topPerformers = Object.values(userCounts)
          .sort((a, b) => b.workout_count - a.workout_count)
          .slice(0, 5);
        
        setPerformers(topPerformers);
      } catch (error) {
        console.error('Error fetching top performers:', error);
        setPerformers([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTopPerformers();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Top Performers</h2>
      <p className="text-sm text-gray-500 mb-6">Last 7 days</p>
      <div className="space-y-4">
        {performers.map((performer) => (
          <div
            key={performer.id}
            className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium dark:text-gray-100">
                  {performer.profile_name || `${performer.first_name} ${performer.last_name}`}
                </p>
                <p className="text-sm text-gray-500">
                  {performer.workout_count} workouts
                </p>
              </div>
            </div>
          </div>
        ))}
        {performers.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No top performers this week
          </p>
        )}
      </div>
    </div>
  );
}
