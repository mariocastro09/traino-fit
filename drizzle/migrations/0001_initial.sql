-- Migration: Initial schema
-- Created at: 2025-11-19

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at INTEGER NOT NULL
);

-- Create class_schedule table
CREATE TABLE IF NOT EXISTS class_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  class_name TEXT NOT NULL,
  level TEXT,
  coach TEXT,
  max_capacity INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Insert sample admin (replace with your email)
INSERT INTO admins (email, name, created_at) VALUES 
  ('admin@example.com', 'Admin User', unixepoch());

-- Insert sample schedule data
INSERT INTO class_schedule (day_of_week, time, class_name, level, coach, max_capacity, is_active, created_at, updated_at) VALUES
  ('Lunes', '06:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Lunes', '09:00', 'CrossFit Fundamentals', 'Principiantes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Lunes', '12:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Lunes', '17:00', 'Olympic Lifting', 'Intermedio', NULL, 10, 1, unixepoch(), unixepoch()),
  ('Lunes', '19:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  
  ('Martes', '06:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Martes', '09:00', 'CrossFit Fundamentals', 'Principiantes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Martes', '12:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Martes', '17:00', 'CrossFit Kids & Teens', 'Jóvenes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Martes', '19:00', 'CrossFit Competition', 'Avanzado', NULL, 10, 1, unixepoch(), unixepoch()),
  
  ('Miércoles', '06:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Miércoles', '09:00', 'CrossFit Fundamentals', 'Principiantes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Miércoles', '12:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Miércoles', '17:00', 'Olympic Lifting', 'Intermedio', NULL, 10, 1, unixepoch(), unixepoch()),
  ('Miércoles', '19:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  
  ('Jueves', '06:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Jueves', '09:00', 'CrossFit Fundamentals', 'Principiantes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Jueves', '12:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Jueves', '17:00', 'CrossFit Kids & Teens', 'Jóvenes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Jueves', '19:00', 'CrossFit Competition', 'Avanzado', NULL, 10, 1, unixepoch(), unixepoch()),
  
  ('Viernes', '06:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Viernes', '09:00', 'CrossFit Fundamentals', 'Principiantes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Viernes', '12:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  ('Viernes', '19:00', 'CrossFit WOD', 'Todos los niveles', NULL, 15, 1, unixepoch(), unixepoch()),
  
  ('Sábado', '10:30', 'CrossFit Fundamentals', 'Principiantes', NULL, 12, 1, unixepoch(), unixepoch()),
  ('Sábado', '12:00', 'Open Gym', 'Todos los niveles', NULL, 20, 1, unixepoch(), unixepoch()),
  ('Sábado', '12:00', 'CrossFit Competition', 'Avanzado', NULL, 10, 1, unixepoch(), unixepoch()),
  
  ('Domingo', '12:00', 'Open Gym', 'Todos los niveles', NULL, 20, 1, unixepoch(), unixepoch());
