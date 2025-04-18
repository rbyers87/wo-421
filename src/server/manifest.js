import { json } from 'node:process';
    import { supabase } from '../lib/supabase';
    
    export async function GET(req) {
      const url = new URL(req.url, 'http://localhost:5173');
      const userId = url.searchParams.get('user-id');
    
      let selectedIcon = '/icons/android-icon-192x192.png';
    
      if (userId) {
        try {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('icon_choice')
            .eq('user_id', userId)
            .single();
    
          selectedIcon = preferences?.icon_choice || selectedIcon;
        } catch (error) {
          console.error('Error fetching user preference:', error);
        }
      }
    
      return new Response(JSON.stringify({
        name: "Workout Tracker",
        short_name: "Tracker",
        icons: [
          {
            src: selectedIcon,
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: selectedIcon,
            sizes: "512x512",
            type: "image/png"
          }
        ],
        start_url: "/",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#000000"
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
