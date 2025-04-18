import React, { useState, useEffect } from 'react';
    import cloudinary from '../../lib/cloudinary';
    import { supabase } from '../../lib/supabase';
    import { Trash2 } from 'lucide-react';
    
    export function AdminSettings() {
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState('');
      const [imageUrl, setImageUrl] = useState('');
      const [newExerciseName, setNewExerciseName] = useState('');
      const [newExerciseDescription, setNewExerciseDescription] = useState('');
      const [newExerciseCategory, setNewExerciseCategory] = useState('');
      const [exerciseMessage, setExerciseMessage] = useState('');
      const [exercises, setExercises] = useState([]);
      const [selectedExercise, setSelectedExercise] = useState('');
    
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
    
      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setLoading(true);
        setMessage('');
    
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
        const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
        if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
          setMessage('Cloudinary environment variables are not set.');
          setLoading(false);
          return;
        }
    
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
    
          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
          console.log('Cloudinary Upload URL:', uploadUrl);
    
          const response = await fetch(
            uploadUrl,
            {
              method: 'POST',
              body: formData,
            }
          );
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Failed to upload image');
          }
    
          const data = await response.json();
          setImageUrl(data.secure_url);
          setMessage('Image uploaded successfully');
    
          // Update the welcome image URL in Supabase
          const { error } = await supabase
            .from('app_settings')
            .upsert({
              key: 'welcome_image_url',
              value: data.secure_url,
            }, { onConflict: 'key' });
    
          if (error) throw error;
    
        } catch (error) {
          console.error('Error uploading image:', error);
          setMessage('Error uploading image');
        } finally {
          setLoading(false);
        }
      };
    
      const handleCreateExercise = async () => {
        setLoading(true);
        setExerciseMessage('');
    
        try {
          const { error } = await supabase
            .from('exercises')
            .insert([
              {
                name: newExerciseName,
                description: newExerciseDescription,
                category: newExerciseCategory,
              },
            ]);
    
          if (error) throw error;
          setExerciseMessage('Exercise created successfully');
          setNewExerciseName('');
          setNewExerciseDescription('');
          setNewExerciseCategory('');
          // Refresh exercises
          const { data, error: fetchError } = await supabase
            .from('exercises')
            .select('*')
            .order('name');
    
          if (fetchError) throw fetchError;
          setExercises(data || []);
        } catch (error) {
          console.error('Error creating exercise:', error);
          setExerciseMessage('Error creating exercise');
        } finally {
          setLoading(false);
        }
      };
    
      const handleDeleteExercise = async () => {
        setLoading(true);
        setExerciseMessage('');
    
        try {
          const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', selectedExercise);
    
          if (error) throw error;
          setExerciseMessage('Exercise deleted successfully');
          // Refresh exercises
          const { data, error: fetchError } = await supabase
            .from('exercises')
            .select('*')
            .order('name');
    
          if (fetchError) throw fetchError;
          setExercises(data || []);
          setSelectedExercise(''); // Reset selected exercise after deletion
        } catch (error) {
          console.error('Error deleting exercise:', error);
          setExerciseMessage('Error deleting exercise');
        } finally {
          setLoading(false);
        }
      };
    
      const categoryOptions = ['weight training', 'cardio', 'metcon'];
    
      return (
        <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
          <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Admin Settings</h2>
    
          <div>
            <label htmlFor="welcome_image" className="block text-sm font-medium dark:text-gray-300">
              Welcome Page Image (600x400 - 800x600)
            </label>
            <input
              type="file"
              id="welcome_image"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
    
          {message && (
            <p className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
    
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Uploaded" className="max-w-xs rounded-md" />
            </div>
          )}
    
          <div className="mt-8">
            <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Create New Exercise</h3>
            <p className="text-sm text-gray-500 mb-4">
              Note: Exercise names are case-sensitive.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="new_exercise_name" className="block text-sm font-medium dark:text-gray-300">
                  Exercise Name
                </label>
                <input
                  type="text"
                  id="new_exercise_name"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="new_exercise_description" className="block text-sm font-medium dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="new_exercise_description"
                  value={newExerciseDescription}
                  onChange={(e) => setNewExerciseDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="new_exercise_category" className="block text-sm font-medium dark:text-gray-300">
                  Category
                </label>
                <select
                  id="new_exercise_category"
                  value={newExerciseCategory}
                  onChange={(e) => setNewExerciseCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreateExercise}
                disabled={loading}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Exercise'}
              </button>
              {exerciseMessage && (
                <p className={`mt-4 text-sm ${exerciseMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {exerciseMessage}
                </p>
              )}
            </div>
          </div>
    
          <div className="mt-8">
            <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Current Exercises</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select an exercise to delete</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDeleteExercise}
                disabled={loading || !selectedExercise}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }
