-- Seed hero default settings
INSERT INTO settings (key, value, updated_at) VALUES 
('hero_apertura_badge', '— Apertura Agosto 2026', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_apertura_sub', 'Nueva apertura en AGOSTO.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- Seed carrusel slide 1 settings
INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_gym_tag', 'TRAINO GYM', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_gym_focus', 'FUERZA', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_gym_tagline', 'Máquinas de última generación. Horario extendido. Tu ritmo, tus reglas.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- Seed carrusel slide 2 settings
INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_box_tag', 'TRAINO BOX', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_box_focus', 'COMUNIDAD', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_box_tagline', 'Coaching de élite, WODs diarios y una comunidad que te empuja al límite.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- Seed carrusel slide 3 settings
INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_hybrid_tag', 'TRAINO HYBRID', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_hybrid_focus', 'RENDIMIENTO', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('hero_slide_hybrid_tagline', 'Gym + CrossFit. El sistema definitivo para atletas sin restricciones.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- Seed pricing page hero settings
INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_hero_badge', 'Arquitectura de Precios', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_hero_title', 'EL PLAN [PERFECTO] PARA TI', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_hero_subtitle', 'Sin cargos ocultos. Sin contratos largos. Solo resultados.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;
