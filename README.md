clones wo-42 mostly working

shortened workout logger but still not able to update scores.  can't use "scores" to tell AI to update input numbers (reps, weight, time).  Scores is identified as totals on a different supabase table

scores can now be updated 5/2/25

disabled Eruda in index.html with //

site.webmanifest was moved to root to replace the manifest.json

for favicons the src has to be specific to the location of the images

5/5/2025
Major Changes:

Updated Data Source:

Now fetching from workouts table directly instead of workout_logs
Using scheduled_date as the date field for filtering exercises within a week


Renamed Interface and Variables:

Changed CompletedExercise to ScheduledExercise
Renamed completedExercises to scheduledExercises throughout the component
Updated props interface to match the new data structure
