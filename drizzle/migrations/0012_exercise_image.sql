-- Demonstration photos: links a workout exercise to its photo folder in
-- the exercise library, shown to students and on published routines.
ALTER TABLE workout_exercises ADD COLUMN image TEXT;
