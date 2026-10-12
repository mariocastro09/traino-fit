import { drizzle } from 'drizzle-orm/d1';
import { eq, asc } from 'drizzle-orm';
import * as schema from './db/schema';
import type { AppLoadContext } from '../load-context';

// Public read queries, shared by the /api/* handlers and the page loaders.

// Settings rows that must never reach the browser of a non-admin visitor.
const SECRET_SETTING_KEYS = new Set(['HF_TOKEN']);

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

// Loaders must render the page even if the database is unreachable.
export async function orFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error('Public data query failed:', error);
    return fallback;
  }
}
