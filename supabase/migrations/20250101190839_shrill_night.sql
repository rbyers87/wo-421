/*
              # Initial Schema Setup for Workout Application
        
              1. New Tables
                - `profiles`
                  - Stores user profile information
                  - Links to Supabase auth.users
                - `workouts`
                  - Stores workout definitions
                  - Contains workout name, description, and type
                - `workout_logs`
                  - Records completed workouts and scores
                - `exercises`
                  - Stores exercise definitions
                  - Links exercises to workouts
                - `exercise_scores`
                  - Stores personal records for exercises
        
              2. Security
                - Enable RLS on all tables
                - Add policies for authenticated users
            */
        
            -- Create profiles table
            CREATE TABLE IF NOT EXISTS profiles (
              id uuid PRIMARY KEY REFERENCES auth.users(id),
              first_name text,
              last_name text,
              profile_name text UNIQUE,
              age integer,
              gender text,
              email text UNIQUE NOT NULL,
              avatar_url text,
              created_at timestamptz DEFAULT now(),
              updated_at timestamptz DEFAULT now(),
              birthday date,
              role text DEFAULT 'user'
            );
        
            -- Create workouts table
            CREATE TABLE IF NOT EXISTS workouts (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              name text NOT NULL,
              description text,
              type text NOT NULL,
              created_by uuid REFERENCES profiles(id),
              scheduled_date date,
              is_wod boolean DEFAULT false,
              created_at timestamptz DEFAULT now(),
              updated_at timestamptz DEFAULT now()
            );
        
            -- Create exercises table
            CREATE TABLE IF NOT EXISTS exercises (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              name text NOT NULL,
              description text,
              category text,
              created_at timestamptz DEFAULT now()
            );
        
            -- Create workout_exercises table
            CREATE TABLE IF NOT EXISTS workout_exercises (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
              exercise_id uuid REFERENCES exercises(id),
              sets integer,
              reps integer,
              weight numeric,
              order_index integer,
              created_at timestamptz DEFAULT now()
            );
        
            -- Create workout_logs table
            CREATE TABLE IF NOT EXISTS workout_logs (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id uuid REFERENCES profiles(id),
              workout_id uuid REFERENCES workouts(id),
              completed_at timestamptz DEFAULT now(),
              notes text,
              score numeric,
              created_at timestamptz DEFAULT now()
            );
        
            -- Create exercise_scores table
            CREATE TABLE IF NOT EXISTS exercise_scores (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id uuid REFERENCES profiles(id),
              exercise_id uuid REFERENCES exercises(id),
              weight numeric,
              reps integer,
              distance numeric,
              time numeric,
              date timestamptz DEFAULT now(),
              created_at timestamptz DEFAULT now(),
              workout_log_id uuid REFERENCES workout_logs(id)
            );
        
            -- Enable RLS
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
            ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
            ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
            ALTER TABLE exercise_scores ENABLE ROW LEVEL SECURITY;
        
            -- Profiles policies
            CREATE POLICY "Public profiles are viewable by everyone"
              ON profiles FOR SELECT
              USING (true);
        
            CREATE POLICY "Users can update own profile"
              ON profiles FOR UPDATE
              USING (auth.uid() = id);
        
            -- Workouts policies
            CREATE POLICY "Workouts are viewable by everyone"
              ON workouts FOR SELECT
              USING (true);
        
            CREATE POLICY "Authenticated users can create workouts"
              ON workouts FOR INSERT
              WITH CHECK (auth.role() = 'authenticated');
        
            CREATE POLICY "Users can update own workouts"
              ON workouts FOR UPDATE
              USING (auth.uid() = created_by);
        
            -- Exercise policies
            CREATE POLICY "Exercises are viewable by everyone"
              ON exercises FOR SELECT
              USING (true);
        
            -- Workout exercises policies
            CREATE POLICY "Workout exercises are viewable by everyone"
              ON workout_exercises FOR SELECT
              USING (true);
        
            -- Workout logs policies
            CREATE POLICY "Users can view all workout logs"
              ON workout_logs FOR SELECT
              USING (true);
        
            CREATE POLICY "Users can create own workout logs"
              ON workout_logs FOR INSERT
              WITH CHECK (auth.uid() = user_id);
        
            -- Exercise scores policies
            CREATE POLICY "Users can view all exercise scores"
              ON exercise_scores FOR SELECT
              USING (true);
        
            CREATE POLICY "Users can create own exercise scores"
              ON exercise_scores FOR INSERT
              WITH CHECK (auth.uid() = user_id);
        
            CREATE POLICY "Users can update own exercise scores"
              ON exercise_scores FOR UPDATE
              USING (auth.uid() = user_id);
        
            -- Create app_settings table
            CREATE TABLE IF NOT EXISTS app_settings (
              key TEXT PRIMARY KEY,
              value TEXT
            );
        
            -- Insert default welcome image URL
            INSERT INTO app_settings (key, value)
            VALUES ('welcome_image_url', 'https://res.cloudinary.com/dvmv00x0y/image/upload/v1718219988/workout-app/fitness_q0q09j.jpg')
            ON CONFLICT (key) DO NOTHING;
    
            -- Create user_preferences table
            CREATE TABLE IF NOT EXISTS user_preferences (
              user_id uuid PRIMARY KEY REFERENCES auth.users(id),
              icon_choice text
            );
        
            -- Enable RLS for user_preferences
            ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    
            -- User preferences policies
            CREATE POLICY "Users can view their own preferences"
              ON user_preferences FOR SELECT
              USING (auth.uid() = user_id);
    
            CREATE POLICY "Users can update their own preferences"
              ON user_preferences FOR UPDATE
              USING (auth.uid() = user_id);
    
            CREATE POLICY "Users can insert their own preferences"
              ON user_preferences FOR INSERT
              USING (auth.uid() = user_id);
    
            -- Create likes table
            CREATE TABLE IF NOT EXISTS likes (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id uuid REFERENCES auth.users(id),
              profile_id uuid REFERENCES profiles(id),
              date timestamptz DEFAULT now()
            );
    
            -- Enable RLS for likes
            ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
    
            -- Likes policies
            CREATE POLICY "Users can insert likes"
              ON likes FOR INSERT
              WITH CHECK (auth.uid() <> profile_id);
    
            CREATE POLICY "Likes are viewable by everyone"
              ON likes FOR SELECT
              USING (true);
    
            -- Add likes count to workout_logs
            ALTER TABLE workout_logs
            ADD COLUMN likes int GENERATED ALWAYS AS (
              SELECT count(*)
              FROM likes
              WHERE likes.profile_id = workout_logs.user_id
            ) STORED;
