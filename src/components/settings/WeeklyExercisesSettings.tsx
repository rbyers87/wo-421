import React, { useState, useEffect } from 'react';
    import { supabase } from '../../lib/supabase';
    import { Plus, Trash2 } from 'lucide-react';
    
    interface Exercise {
      id: string;
      name: string;
    }
    
    export function WeeklyExercisesSettings() {
      const [exercises, setExercises] = useState<Exercise[]>([]);
      const [newExerciseName, setNewExerciseName] = useState('');
      const [loading, setLoading] = useState(true);
      const [message, setMessage] = useState('');
    
      useEffect(() => {
        async function fetchExercises() {
          setLoading(true);
          try {
            const { data, error } = await supabase
              .from('exercises')
              .select('*')
              .order('name');
    
            if (error) throw error;
            setExercises(data || []);
          } catch (error) {
            console.error('Error fetching exercises:', error);
          } finally {
            setLoading(false);
          }
        }
    
        fetchExercises();
      }, []);
    
      const handleAddExercise = async () => {
        setLoading(true);
        setMessage('');
    
        try {
          const { error } = await supabase
            .from('exercises')
            .insert([{ name: newExerciseName }]);
    
          if (error) throw error;
          setNewExerciseName('');
          setMessage('Exercise added successfully');
          // Refresh exercises
          const { data, error: fetchError } = await supabase
            .from('exercises')
            .select('*')
            .order('name');
    
          if (fetchError) throw fetchError;
          setExercises(data || []);
        } catch (error) {
          console.error('Error adding exercise:', error);
          setMessage('Error adding exercise');
        } finally {
          setLoading(false);
        }
      };
    
      const handleDeleteExercise = async (exerciseId: string) => {
        setLoading(true);
        setMessage('');
    
        try {
          const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', exerciseId);
    
          if (error) throw error;
          setMessage('Exercise deleted successfully');
          // Refresh exercises
          const { data, error: fetchError } = await supabase
            .from('exercises')
            .select('*')
            .order('name');
    
          if (fetchError) throw fetchError;
          setExercises(data || []);
        } catch (error) {
          console.error('Error deleting exercise:', error);
          setMessage('Error deleting exercise');
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
          <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Weekly Exercises Settings</h2>
    
          <div className="mb-6">
            <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Add New Exercise</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Exercise name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleAddExercise}
                disabled={loading}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </p>
            )}
          </div>
    
          <div>
            <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Current Exercises</h3>
            <ul className="space-y-2">
              {exercises.map((exercise) => (
                <li key={exercise.id} className="flex items-center justify-between p-2 dark:bg-gray-800 rounded-lg">
                  <span className="dark:text-gray-100">{exercise.name}</span>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
