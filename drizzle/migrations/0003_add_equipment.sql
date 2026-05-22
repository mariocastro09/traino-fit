-- Migration: Add equipment table and rest_seconds to workout_exercises
-- Run with: pnpm db:migrate:003:local and pnpm db:migrate:003

-- Equipment inventory (ISO 27001 A.8.1: Asset Inventory)
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  is_available INTEGER DEFAULT 1,
  created_at INTEGER,
  updated_at INTEGER
);

-- Add rest_seconds column to workout_exercises (nullable, backward-compatible)
ALTER TABLE workout_exercises ADD COLUMN rest_seconds INTEGER;

-- Seed common equipment examples (optional - can be removed)
-- INSERT INTO equipment (name, category, quantity, description, is_available) VALUES
--   ('Barbell Olímpico 20kg', 'barras', 3, 'Barras olímpicas estándar', 1),
--   ('Discos Bumper 10-25kg', 'barras', 1, 'Juego completo de discos bumper', 1),
--   ('Mancuernas 5-30kg', 'mancuernas', 1, 'Juego fijo de mancuernas', 1),
--   ('Kettlebell 16kg', 'funcional', 4, 'Kettlebells de hierro fundido', 1),
--   ('Kettlebell 24kg', 'funcional', 2, 'Kettlebells de hierro fundido', 1),
--   ('Pull-up Bar / Rig', 'calistenia', 2, 'Barra de dominadas fija', 1),
--   ('Rings de Gimnasia', 'gimnasia', 2, 'Anillas de madera olímpica', 1),
--   ('Jump Rope', 'funcional', 10, 'Cuerdas de salto velocidad', 1),
--   ('Box Pliométrico', 'funcional', 4, 'Cajones de madera 20/24/30 pulgadas', 1),
--   ('Rowing Machine', 'cardio', 2, 'Remo Concept2', 1);
