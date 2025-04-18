import React, { useState, useEffect } from "react";
import { WorkoutList } from "../components/workouts/WorkoutList";
import { WorkoutScheduler } from "../components/workouts/WorkoutScheduler";
import { WorkoutCreator } from "../components/workouts/WorkoutCreator";
import { supabase } from "@lib/supabase"; // Use the alias here



export default function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);

  // Test connection to Supabase
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('workouts').select('*');
        if (error) {
          console.error("Error connecting to Supabase:", error);
        } else {
          console.log("Fetched workouts:", data); // Logs the fetched data from the "workouts" table
        }
      } catch (err) {
        console.error("Error while querying Supabase:", err);
      }
    };

    testSupabaseConnection();
  }, []);  // Empty dependency array means this will run only once when the component mounts

  const fetchWorkouts = async () => {
    const { data, error } = await supabase.from("workouts").select();
    if (error) {
      console.error("Error fetching workouts:", error);
    } else {
      setWorkouts(data);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);  // This useEffect will fetch workouts when the component mounts

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-gray-100">Workouts</h1>
        {/* <WorkoutCreator /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WorkoutList workouts={workouts} />
        </div>
        <div>
          <WorkoutScheduler />
        </div>
      </div>
    </div>
  );
}
