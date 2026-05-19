-- Seed pricing module 1 (Box) settings
INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_box_tag', 'Módulo 1', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_box_title', 'TRAINO BOX — La Comunidad', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_box_subtitle', 'Coaching, comunidad y WODs de alto rendimiento. Para quienes buscan superarse en equipo.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- Seed pricing module 2 (Gym) settings
INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_gym_tag', 'Módulo 2', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_gym_title', 'TRAINO GYM — La Libertad', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_gym_subtitle', 'Autonomía total, fuerza bruta y equipamiento de última generación. Entrena bajo tus propias reglas.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- Seed pricing module 3 (Hybrid) settings
INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_hybrid_tag', 'Módulo 3', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_hybrid_title', 'TRAINO HYBRID — La Élite', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

INSERT INTO settings (key, value, updated_at) VALUES 
('pricing_module_hybrid_subtitle', 'Lo mejor de ambos mundos. El plan más rentable para el atleta serio.', 1716162391000)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;
