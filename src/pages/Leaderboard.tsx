import React from 'react';
import { UserRankings } from '../components/leaderboard/UserRankings';
import { TopPerformers } from '../components/leaderboard/TopPerformers';
import { ExerciseRecords } from '../components/leaderboard/ExerciseRecords';

export default function Leaderboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-gray-100">Leaderboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UserRankings />
        </div>
        <div className="space-y-8">
          <TopPerformers />
          <ExerciseRecords />
        </div>
      </div>
    </div>
  );
}
