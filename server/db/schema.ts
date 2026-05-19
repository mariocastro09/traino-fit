import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Admin users table (whitelist)
export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Class types table (CRUD for dynamic class types)
export const classTypes = sqliteTable('class_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // 'CrossFit WOD', 'CrossFit Fundamentals', etc.
  description: text('description'), // Optional description
  color: text('color'), // Optional color for UI (e.g., '#FF5733')
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Class schedule table
export const classSchedule = sqliteTable('class_schedule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayOfWeek: text('day_of_week').notNull(), // 'Lunes', 'Martes', etc.
  time: text('time').notNull(), // '06:00', '09:00', etc.
  className: text('class_name').notNull(), // References class_types.name
  level: text('level'), // 'Principiantes', 'Intermedio', 'Avanzado'
  coach: text('coach'),
  maxCapacity: integer('max_capacity'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Students table
export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Mandatory fields
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  // Optional fields
  dateOfBirth: text('date_of_birth'), // ISO date string
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  medicalConditions: text('medical_conditions'),
  membershipType: text('membership_type'), // 'monthly', 'quarterly', 'annual', etc.
  membershipStartDate: text('membership_start_date'), // ISO date string
  membershipEndDate: text('membership_end_date'), // ISO date string
  notes: text('notes'), // Admin notes
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Plans table
export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // 'STARTER', 'PROGRESS', 'RX', 'ATHLETE'
  moduleName: text('module_name').notNull(), // 'TRAINO BOX', 'TRAINO GYM', 'TRAINO HYBRID'
  hook: text('hook'), // 'Crea el Hábito', 'El Punto Dulce'
  price: text('price').notNull(), // '$29.990', '$39.990'
  description: text('description'), // '2 Clases / semana + Coaching'
  features: text('features').notNull(), // Comma-separated or JSON string of features
  featured: integer('featured', { mode: 'boolean' }).default(false),
  cta: text('cta').notNull(), // 'Empieza aquí', 'Sube de nivel'
  orderIndex: integer('order_index').default(0), // for custom sorting
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sessions table for authentication
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type ClassType = typeof classTypes.$inferSelect;
export type NewClassType = typeof classTypes.$inferInsert;
export type ClassSchedule = typeof classSchedule.$inferSelect;
export type NewClassSchedule = typeof classSchedule.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
