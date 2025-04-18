import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, User, Settings, Trophy, LogOut, Calendar } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-transparent shadow-lg dark:bg-transparent">
      <div className="container mx-auto px-4 bg-transparent">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Workout Tracker</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/wod"
              className="dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-indigo-400"
            >
              WOD
            </Link>
            <Link
              to="/workouts"
              className="dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-indigo-400"
            >
              <Dumbbell className="h-5 w-5" />
            </Link>
            <Link
              to="/leaderboard"
              className="dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-indigo-400"
            >
              <Trophy className="h-5 w-5" />
            </Link>
            <Link
              to="/profile"
              className="dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-indigo-400"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/settings"
              className="dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-indigo-400"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-indigo-400"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
