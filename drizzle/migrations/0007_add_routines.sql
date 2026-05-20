-- Migration: Add routines table and seed data
-- Created at: 2026-05-20

-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routine_name TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  description TEXT,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  intensity_pct INTEGER,
  difficulty TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Seed initial advanced/intermediate routines for the assistant's context
INSERT INTO routines (routine_name, exercise_name, description, sets, reps, intensity_pct, difficulty, created_at, updated_at) VALUES
  ('Fuerza y Potencia de Piernas', 'Sentadilla Trasera (Back Squat)', 'Sentadillas profundas manteniendo tensión en la fase excéntrica.', 4, '6-8', 80, 'Avanzado', unixepoch(), unixepoch()),
  ('Fuerza y Potencia de Piernas', 'Peso Muerto Convencional (Deadlift)', 'Mantener espalda neutra y empujar con las piernas desde el piso.', 3, '5', 85, 'Avanzado', unixepoch(), unixepoch()),
  ('Fuerza y Potencia de Piernas', 'Zancadas con Barra (Barbell Lunges)', 'Alternando piernas de manera controlada.', 3, '12', 65, 'Intermedio', unixepoch(), unixepoch()),

  ('Acondicionamiento Metabólico Avanzado', 'Burpee Over the Bar', 'Saltar de lado sobre la barra después del burpee.', 5, '15', 90, 'Avanzado', unixepoch(), unixepoch()),
  ('Acondicionamiento Metabólico Avanzado', 'Kettlebell Swings', 'Estilo americano (kettlebell completamente sobre la cabeza).', 5, '20', 75, 'Intermedio', unixepoch(), unixepoch()),
  ('Acondicionamiento Metabólico Avanzado', 'Doble Unders (Saltos Dobles)', 'Saltos dobles de cuerda manteniendo el core compacto.', 5, '50', 85, 'Avanzado', unixepoch(), unixepoch()),

  ('Fuerza de Empuje Superior', 'Prensa de Banca (Bench Press)', 'Controlar la bajada y empuje explosivo.', 4, '8', 75, 'Intermedio', unixepoch(), unixepoch()),
  ('Fuerza de Empuje Superior', 'Prensa Militar de Hombros (Military Press)', 'De pie sin impulso de piernas.', 4, '6', 70, 'Intermedio', unixepoch(), unixepoch()),
  ('Fuerza de Empuje Superior', 'Fondos en Paralelas (Weighted Dips)', 'Fondos lastrados con disco.', 3, '8-10', 80, 'Avanzado', unixepoch(), unixepoch()),

  ('WOD Murph Adaptado', 'Dominadas (Pull-ups)', 'Kipping pull-ups o estrictas segun nivel.', 1, '100', 70, 'Avanzado', unixepoch(), unixepoch()),
  ('WOD Murph Adaptado', 'Flexiones de Brazo (Push-ups)', 'Mantener alineacion perfecta de cuerpo.', 1, '200', 65, 'Intermedio', unixepoch(), unixepoch()),
  ('WOD Murph Adaptado', 'Sentadillas de Aire (Air Squats)', 'Romper el paralelo en cada repeticion.', 1, '300', 60, 'Principiante', unixepoch(), unixepoch());
