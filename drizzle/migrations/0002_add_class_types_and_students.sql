-- Migration: Add class_types and students tables
-- Created at: 2025-11-20

-- Create class_types table
CREATE TABLE IF NOT EXISTS class_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  date_of_birth TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_conditions TEXT,
  membership_type TEXT,
  membership_start_date TEXT,
  membership_end_date TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Seed initial class types
INSERT INTO class_types (name, description, color, is_active, created_at, updated_at) VALUES
  ('CrossFit WOD', 'Entrenamiento del día - Workout of the Day', '#E63946', 1, unixepoch(), unixepoch()),
  ('CrossFit Fundamentals', 'Clase de fundamentos para principiantes', '#457B9D', 1, unixepoch(), unixepoch()),
  ('CrossFit Competition', 'Entrenamiento para competidores avanzados', '#F4A261', 1, unixepoch(), unixepoch()),
  ('Olympic Lifting', 'Levantamiento olímpico', '#2A9D8F', 1, unixepoch(), unixepoch()),
  ('CrossFit Kids & Teens', 'CrossFit para niños y adolescentes', '#E9C46A', 1, unixepoch(), unixepoch()),
  ('Open Gym', 'Gimnasio abierto para entrenamiento libre', '#06A77D', 1, unixepoch(), unixepoch());
