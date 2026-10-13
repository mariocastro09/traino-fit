import { drizzle } from 'drizzle-orm/d1';
import { eq, asc, desc, and } from 'drizzle-orm';
import * as schema from './db/schema';
import type { AppLoadContext } from '../load-context';

// Public read queries, shared by the /api/* handlers and the page loaders.

// Settings rows that must never reach the browser of a non-admin visitor.
const SECRET_SETTING_KEYS = new Set(['HF_TOKEN', 'GEMINI_API_KEY']);

// The D1 binding, from a React Router loader's `context`.
export const d1 = (context: unknown) => (context as AppLoadContext).cloudflare.env.DB;

export async function getAllSettings(d1: D1Database) {
  const rows = await drizzle(d1, { schema }).query.settings.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export async function getPublicSettings(d1: D1Database) {
  const all = await getAllSettings(d1);
  return Object.fromEntries(
    Object.entries(all).filter(([key]) => !SECRET_SETTING_KEYS.has(key))
  ) as Record<string, string>;
}

export function getActivePlans(d1: D1Database) {
  return drizzle(d1, { schema }).query.plans.findMany({
    where: eq(schema.plans.isActive, true),
    orderBy: [asc(schema.plans.orderIndex)],
  });
}

export function getActiveClassTypes(d1: D1Database) {
  return drizzle(d1, { schema }).query.classTypes.findMany({
    where: eq(schema.classTypes.isActive, true),
  });
}

export function getActiveSchedule(d1: D1Database) {
  return drizzle(d1, { schema }).query.classSchedule.findMany({
    where: eq(schema.classSchedule.isActive, true),
  });
}

// Published routines with their exercises, newest first.
export async function getPublishedRoutines(d1: D1Database) {
  const db = drizzle(d1, { schema });
  const [routines, exercises] = await Promise.all([
    db.query.workouts.findMany({
      where: eq(schema.workouts.isPublished, true),
      orderBy: [desc(schema.workouts.publishedAt)],
    }),
    db.query.workoutExercises.findMany(),
  ]);
  return routines.map((routine) => ({
    ...routine,
    exercises: exercises.filter((e) => e.workoutId === routine.id),
  }));
}

export async function getPublishedRoutine(d1: D1Database, slug: string) {
  const db = drizzle(d1, { schema });
  const routine = await db.query.workouts.findFirst({
    where: and(eq(schema.workouts.slug, slug), eq(schema.workouts.isPublished, true)),
  });
  if (!routine) return null;
  const exercises = await db.query.workoutExercises.findMany({
    where: eq(schema.workoutExercises.workoutId, routine.id),
    orderBy: [asc(schema.workoutExercises.id)],
  });
  return { ...routine, exercises };
}

// Loaders must render the page even if the database is unreachable.
export async function orFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error('Public data query failed:', error);
    return fallback;
  }
}
