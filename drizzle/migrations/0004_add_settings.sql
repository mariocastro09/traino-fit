-- Migration: Add settings table
-- Created at: 2026-05-19

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER
);

-- Seed initial settings
INSERT INTO settings (key, value, updated_at) VALUES
  ('waitlist_countdown_target', '2026-08-01T00:00:00-04:00', unixepoch()),
  ('waitlist_countdown_title', 'APERTURA AGOSTO', unixepoch()),
  ('waitlist_discount_text', '20% OFF TU PRIMER MES', unixepoch()),
  ('three_pillars_box_hook', 'Crea el hábito y recupera tu energía', unixepoch()),
  ('three_pillars_box_description', 'Coaching de élite, comunidad que empuja y WODs diarios que desafían. Para quienes se superan en equipo.', unixepoch()),
  ('three_pillars_box_features', 'Coaching certificado en cada clase,WODs programados y escalables,Seguimiento de rendimiento,Comunidad de alto nivel', unixepoch()),
  ('three_pillars_gym_hook', 'Entrena bajo tus propias reglas', unixepoch()),
  ('three_pillars_gym_description', 'Máquinas de última generación y horario extendido. Para quienes dominan su propio ritmo y no necesitan permiso.', unixepoch()),
  ('three_pillars_gym_features', 'Acceso horario extendido,Equipamiento de alta gama,Open Gym ilimitado,Plan FLEX off-peak disponible', unixepoch()),
  ('three_pillars_full_hook', 'El Sistema Híbrido: Fuerza + Agilidad', unixepoch()),
  ('three_pillars_full_description', 'La combinación definitiva. Fuerza bruta y acondicionamiento atlético sin restricciones. Para quienes quieren todo.', unixepoch()),
  ('three_pillars_full_features', 'Acceso ilimitado Gym + Box,Open Box incluido,Sin restricciones de horario,La opción más recomendada', unixepoch());
