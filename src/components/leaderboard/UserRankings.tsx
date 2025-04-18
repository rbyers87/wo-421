import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Medal, Heart } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface UserRanking {
  id: string;
  profile_name: string;
  daily_score: number;
  likes: number;
  hasLiked: boolean;
}

export function UserRankings() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user: authUser } = useAuth();

  useEffect(() => {
    async function fetchRankings() {
      try {
        setLoading(true);
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

        // Get wod workouts for selected date
        const { data: wodWorkouts, error: wodError } = await supabase
          .from('workouts')
          .select('id')
          .eq('is_wod', true)
          .eq('scheduled_date', selectedDateStr);

        if (wodError || !wodWorkouts?.length) {
          setRankings([]);
          return;
        }

        // Get all logs for these wod workouts
        const { data: logs, error: logsError } = await supabase
          .from('workout_logs')
          .select(`
            total,
            profiles!inner(id, profile_name)
          `)
          .in('workout_id', wodWorkouts.map(w => w.id));

        if (logsError) {
          console.error('Error fetching logs:', logsError);
          return;
        }

        // Aggregate scores and likes
        const userStats = await Promise.all(
          logs.map(async (log) => {
            const profile = log.profiles;
            if (!profile) return null;

            // Get likes count
            const { count } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('profile_id', profile.id);

            return {
              id: profile.id,
              profile_name: profile.profile_name || 'Anonymous',
              daily_score: log.total || 0,
              likes: count || 0,
              hasLiked: false,
            };
          })
        );

        // Merge duplicates and sort
        const mergedStats = userStats.reduce((acc, curr) => {
          if (!curr) return acc;
          const existing = acc.find(u => u.id === curr.id);
          if (existing) {
            existing.daily_score = Math.max(existing.daily_score, curr.daily_score);
          } else {
            acc.push(curr);
          }
          return acc;
        }, [] as UserRanking[]);

        setRankings(
          mergedStats.sort((a, b) => b.daily_score - a.daily_score).slice(0, 10)
        );
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, [selectedDate]);

  const handleLike = async (profileId: string) => {
    if (!authUser || profileId === authUser.id) return;

    try {
      // Update UI immediately
      setRankings(prev => prev.map(user => 
        user.id === profileId 
          ? { ...user, likes: user.likes + 1, hasLiked: true } 
          : user
      ));

      // Record like in database
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: authUser.id, profile_id: profileId });

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      setRankings(prev => prev.map(user => 
        user.id === profileId 
          ? { ...user, likes: user.likes - 1, hasLiked: false } 
          : user
      ));
      console.error('Like failed:', error);
    }
  };

  // Date navigation handlers
  const handlePrevDay = () => setSelectedDate(d => subDays(d, 1));
  const handleNextDay = () => setSelectedDate(d => addDays(d, 1));

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      {/* Header and date navigation */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold dark:text-gray-100">WOD Leaderboard</h2>
          <p className="text-sm text-gray-500">
            {format(selectedDate, 'MMM do, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrevDay} className="date-nav-button">
            Previous
          </button>
          <button onClick={handleNextDay} className="date-nav-button">
            Next
          </button>
        </div>
      </div>

      {/* Rankings list */}
      {loading ? (
        <LoadingSpinner />
      ) : rankings.length > 0 ? (
        rankings.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-3 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4 ">
              <RankIcon index={index} />
              <div>
                <p className="font-medium dark:text-gray-100">
                  {user.profile_name}
                </p>
                <p className="text-sm text-gray-500">
                  Score: {user.daily_score}
                </p>
              </div>
            </div>
            <LikeButton
              likes={user.likes}
              hasLiked={user.hasLiked}
              isSelf={user.id === authUser?.id}
              onClick={() => handleLike(user.id)}
            />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">
          No WOD results for this date
        </p>
      )}
    </div>
  );
}

// Helper components
const RankIcon = ({ index }: { index: number }) => {
  if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
  if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
  if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
  return <span className="w-6 text-center font-medium text-gray-500">{index + 1}</span>;
};

const LikeButton = ({ likes, hasLiked, isSelf, onClick }: { 
  likes: number;
  hasLiked: boolean;
  isSelf: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={hasLiked || isSelf}
    className="like-button"
  >
    <Heart className={`h-5 w-5 ${hasLiked ? 'text-red-600' : 'text-gray-500'}`} />
    <span className="ml-1">{likes}</span>
  </button>
);
