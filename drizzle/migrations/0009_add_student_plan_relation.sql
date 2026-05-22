-- Migration: Add plan_id column to students table
ALTER TABLE students ADD COLUMN plan_id INTEGER;
