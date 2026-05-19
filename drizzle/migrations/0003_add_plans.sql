-- Migration: Add plans table
-- Created at: 2026-05-19

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  hook TEXT,
  price TEXT NOT NULL,
  description TEXT,
  features TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
  cta TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Seed initial plans
INSERT INTO plans (name, module_name, hook, price, description, features, featured, cta, order_index, is_active, created_at, updated_at) VALUES
  ('STARTER', 'TRAINO BOX', 'Crea el Hábito', '$29.990', '2 Clases / semana + Coaching', '2 clases por semana,Coaching certificado incluido,Escalable a tu nivel,Comunidad TrainoBox', 0, 'Empieza aquí', 0, 1, unixepoch(), unixepoch()),
  ('PROGRESS', 'TRAINO BOX', 'El Punto Dulce', '$39.990', '3 Clases / semana + Seguimiento', '3 clases por semana,Coaching certificado incluido,Seguimiento de rendimiento,Acceso a comunidad activa', 1, 'Sube de nivel', 1, 1, unixepoch(), unixepoch()),
  ('RX', 'TRAINO BOX', 'Maestría Total', '$54.990', 'Clases Ilimitadas + Open Box', 'Clases ilimitadas,Coaching certificado incluido,Open Box Access — incluido,Rendimiento sin restricciones', 0, 'Rendimiento Total', 2, 1, unixepoch(), unixepoch()),
  ('FLEX', 'TRAINO GYM', 'Ahorro Inteligente', '$29.990', 'Lun–Vie 08:00–16:00', 'Acceso completo Off-Peak,Lunes a Viernes, mañanas,Equipamiento de alta gama,Ideal para horario flexible', 0, 'Empieza aquí', 0, 1, unixepoch(), unixepoch()),
  ('LIBRE', 'TRAINO GYM', 'Sin Límites', '$39.990', 'Acceso Total — Todos los horarios', 'Acceso completo todos los días,Fines de semana incluidos,Equipamiento premium,Entrena bajo tus propias reglas', 1, 'Sube de nivel', 1, 1, unixepoch(), unixepoch()),
  ('ATHLETE', 'TRAINO HYBRID', 'La Máquina Definitiva', '$69.990', 'Gym ilimitado + CrossFit ilimitado + Open Box', 'Gym Ilimitado — todos los horarios,CrossFit Ilimitado — clases diarias,Open Box Access — sin cita previa,Coaching certificado en cada sesión,Equipamiento de alta gama,Sin restricciones de horario,La combinación definitiva: Fuerza + Agilidad', 1, 'QUIERO SER ATHLETE', 0, 1, unixepoch(), unixepoch());
