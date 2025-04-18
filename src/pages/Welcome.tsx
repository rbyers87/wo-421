import React, { useState, useEffect } from 'react';
    import { supabase } from '../lib/supabase';
    
    export default function Welcome() {
      const [imageUrl, setImageUrl] = useState('https://res.cloudinary.com/dvmv00x0y/image/upload/v1718219988/workout-app/fitness_q0q09j.jpg');
      const [loading, setLoading] = useState(true);
      const [fetchedImageUrl, setFetchedImageUrl] = useState('');
    
      useEffect(() => {
        async function fetchImageUrl() {
          try {
            const { data, error } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'welcome_image_url')
              .single();
    
            if (error) {
              console.error('Error fetching welcome image URL:', error);
            } else if (data) {
              setFetchedImageUrl(data.value);
              console.log('Fetched image URL:', data.value);
            }
          } catch (error) {
            console.error('Error fetching welcome image URL:', error);
          } finally {
            setLoading(false);
          }
        }
    
        fetchImageUrl();
      }, []);
    
      useEffect(() => {
        if (fetchedImageUrl) {
          setImageUrl(fetchedImageUrl);
        }
      }, [fetchedImageUrl]);
    
      return (
        <div className="text-center flex flex-col items-center">
          <h1 className="text-4xl font-bold dark:text-gray-100 mb-4">Welcome to Workout Tracker</h1>
          <p className="text-lg dark:text-gray-300 mb-8">
            Workouts are scored by adding total weight moved and calories together for a total score!
          </p>
          {!loading && (
            <img
              src={imageUrl}
              alt="Fitness"
              className="mx-auto rounded-lg shadow-md mb-8 max-w-full"
              style={{ maxWidth: '90%', height: 'auto' }}
            />
          )}
          <p className="dark:text-gray-300">
            Use the navigation bar to access different features.
          </p>
        </div>
      );
    }
