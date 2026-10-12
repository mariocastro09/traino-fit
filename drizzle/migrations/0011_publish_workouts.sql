-- Publishable routines: a workout can be classified by purpose and
-- published on the website as an article at /rutinas/<slug>.
ALTER TABLE workouts ADD COLUMN slug TEXT;
ALTER TABLE workouts ADD COLUMN category TEXT;
ALTER TABLE workouts ADD COLUMN duration_min INTEGER;
ALTER TABLE workouts ADD COLUMN summary TEXT;
ALTER TABLE workouts ADD COLUMN body TEXT;
ALTER TABLE workouts ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workouts ADD COLUMN published_at INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS workouts_slug_unique ON workouts(slug);
