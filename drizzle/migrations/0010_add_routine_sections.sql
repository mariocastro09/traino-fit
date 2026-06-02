-- Add rest_seconds and section columns to routines table
ALTER TABLE routines ADD COLUMN rest_seconds INTEGER;
ALTER TABLE routines ADD COLUMN section TEXT;

-- Add rest_seconds column to workout_exercises table (already defined in schema but missing from migration)
ALTER TABLE workout_exercises ADD COLUMN rest_seconds INTEGER;
