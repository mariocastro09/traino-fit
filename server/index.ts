import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { setCookie, getCookie } from 'hono/cookie';
import { drizzle } from 'drizzle-orm/d1';
import { eq, asc, desc, lt } from 'drizzle-orm';
import { Google, generateState, generateCodeVerifier } from 'arctic';
import * as schema from './db/schema';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  SESSION_SECRET: string;
  ADMIN_EMAILS: string;
  FRONTEND_URL?: string;
  RESEND_API_KEY?: string;
  HF_TOKEN?: string;
  HUGGINGFACE_TOKEN?: string;
};

// ─────────────────────────────────────────────
// ISO 27001 A.9.1 — Access Control Policy
// Explicit allowlist of trusted origins
// ─────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8787',
  'https://trainofit.mcastrodev.workers.dev',
  'https://trainofit.mcastrodev.cl',
  'https://trainofit.cl',
];

const app = new Hono<{ Bindings: Bindings }>();

// ─────────────────────────────────────────────
// CORS middleware
// ─────────────────────────────────────────────
app.use('/*', cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

// ─────────────────────────────────────────────
// ISO 27001 A.14.2.5 — Security Headers
// Prevents XSS, clickjacking, MIME sniffing,
// enforces HTTPS, restricts resource origins
// ─────────────────────────────────────────────
app.use('/*', async (c, next) => {
  await next();
  const isHttps = new URL(c.req.url).protocol === 'https:';

  // Prevent MIME-type sniffing (A.14.2.5)
  c.header('X-Content-Type-Options', 'nosniff');
  // Deny framing entirely — prevents clickjacking (A.14.2.5)
  c.header('X-Frame-Options', 'DENY');
  // Limit referrer exposure (A.13.2.3 — info transfer)
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Disable browser features not needed (A.14.2.5)
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  // CSP — only allow self + Google Fonts, block inline frames, restrict form targets
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "frame-src 'self' https://www.google.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://accounts.google.com"
  );
  // HSTS — production only (A.10.1.1 — cryptographic controls)
  if (isHttps) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
});

// ─────────────────────────────────────────────
// ISO 27001 A.9.1 — OAuth Redirect URI
// Validates request origin against ALLOWED_ORIGINS
// before using it as redirect URI.
// Prevents Host-header injection attacks.
// ─────────────────────────────────────────────
function getGoogleAuth(c: any) {
  // Default to env variable (safe fallback)
  let redirectUri = c.env.GOOGLE_REDIRECT_URI;
  try {
    const url = new URL(c.req.url);
    const origin = `${url.protocol}//${url.host}`;
    // Only trust the Host header if origin is in the explicit allowlist
    if (ALLOWED_ORIGINS.includes(origin)) {
      redirectUri = `${origin}/api/auth/callback`;
    }
  } catch {
    // Fallback to env variable on URL parse error
  }
  return new Google(c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, redirectUri);
}

// ─────────────────────────────────────────────
// ISO 27001 A.12.4.1 — Audit Logging
// Records every security-relevant event to D1
// ─────────────────────────────────────────────
async function audit(db: any, eventType: string, opts: {
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await db.run(
      `INSERT INTO audit_log (event_type, email, ip, user_agent, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      eventType,
      opts.email ?? null,
      opts.ip ?? null,
      opts.userAgent ?? null,
      opts.details ? JSON.stringify(opts.details) : null,
      new Date().toISOString()
    );
  } catch {
    // Never let audit failure break the request
  }
}

// ─────────────────────────────────────────────
// ISO 27001 A.9.4.2 — Brute Force Protection
// Rate limits: max 5 auth attempts per IP / 15 min
// ─────────────────────────────────────────────
async function isRateLimited(db: any, ip: string, endpoint: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const result = await db.prepare(
    `SELECT COUNT(*) as cnt FROM rate_limits WHERE ip = ? AND endpoint = ? AND attempted_at > ?`
  ).bind(ip, endpoint, windowStart).first() as { cnt: number } | null;
  return (result?.cnt ?? 0) >= 5;
}

async function recordAttempt(db: any, ip: string, endpoint: string) {
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO rate_limits (ip, endpoint, attempted_at) VALUES (?, ?, ?)`
  ).bind(ip, endpoint, now).run();
  // Prune records older than 1 hour to keep the table lean
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await db.prepare(`DELETE FROM rate_limits WHERE attempted_at < ?`).bind(cutoff).run();
}

// Helper: get real client IP (Cloudflare always sets CF-Connecting-IP)
function getClientIP(c: any): string {
  return c.req.header('CF-Connecting-IP')
    ?? c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    ?? 'unknown';
}

// ─────────────────────────────────────────────
// ISO 27001 A.9.4.4 — requireAdmin middleware
// Validates HttpOnly session cookie + email whitelist
// ─────────────────────────────────────────────
async function requireAdmin(c: any, next: any) {
  // Prefer HttpOnly cookie, fall back to Authorization header
  const cookieSession = getCookie(c, 'admin_session');
  const headerSession = c.req.header('Authorization')?.replace('Bearer ', '');
  const sessionId = cookieSession || headerSession;

  if (!sessionId) {
    await audit(drizzle(c.env.DB, { schema }), 'UNAUTHORIZED', {
      ip: getClientIP(c),
      userAgent: c.req.header('User-Agent'),
      details: { path: new URL(c.req.url).pathname },
    });
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = drizzle(c.env.DB, { schema });
  const session = await db.query.sessions.findFirst({
    where: eq(schema.sessions.id, sessionId),
  });

  if (!session || session.expiresAt < new Date()) {
    if (cookieSession) setCookie(c, 'admin_session', '', { path: '/', maxAge: 0 });
    return c.json({ error: 'Session expired' }, 401);
  }

  // Check if email is in admin whitelist (A.9.2.3 — management of privileged access)
  const adminEmails = c.env.ADMIN_EMAILS.split(',').map((e: string) => e.trim());
  if (!adminEmails.includes(session.email)) {
    await audit(db, 'UNAUTHORIZED', {
      email: session.email,
      ip: getClientIP(c),
      details: { reason: 'email_not_in_whitelist' },
    });
    return c.json({ error: 'Forbidden - Admin access required' }, 403);
  }

  c.set('session', session);
  await next();
}

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.get('/api/auth/dev-login', async (c) => {
  const isLocal = new URL(c.req.url).hostname === 'localhost' || new URL(c.req.url).hostname === '127.0.0.1';
  if (!isLocal && (c.env as any).NODE_ENV !== 'development') {
    return c.json({ error: 'Not allowed in production' }, 403);
  }
  const db = drizzle(c.env.DB, { schema });
  const sessionId = 'dev-session-token-1234';
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
  await db.insert(schema.sessions).values({
    id: sessionId,
    userId: 'dev-user-id-1234',
    email: 'mapplerak@gmail.com',
    expiresAt,
  });

  setCookie(c, 'admin_session', sessionId, {
    path: '/',
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'Lax',
  });

  return c.redirect('/admin');
});

app.get('/api/auth/login', async (c) => {
  const ip = getClientIP(c);
  const db = c.env.DB; // raw D1 for rate limiting (no drizzle needed)

  // ISO 27001 A.9.4.2 — Rate limit login initiation
  if (await isRateLimited(db, ip, 'auth/login')) {
    await audit(drizzle(c.env.DB, { schema }), 'LOGIN_BLOCKED', {
      ip,
      userAgent: c.req.header('User-Agent'),
      details: { reason: 'rate_limit_exceeded' },
    });
    return c.json({ error: 'Too many login attempts. Try again in 15 minutes.' }, 429);
  }
  await recordAttempt(db, ip, 'auth/login');

  const google = getGoogleAuth(c);
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authUrl = await google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);
  const isHttps = new URL(c.req.url).protocol === 'https:';

  // Store PKCE verifier and state in HttpOnly cookies (CSRF protection)
  setCookie(c, 'google_oauth_state', state, {
    path: '/',
    secure: isHttps,
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'Lax',
  });
  setCookie(c, 'google_code_verifier', codeVerifier, {
    path: '/',
    secure: isHttps,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'Lax',
  });

  return c.redirect(authUrl.toString());
});

app.get('/api/auth/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const storedState = getCookie(c, 'google_oauth_state');
  const codeVerifier = getCookie(c, 'google_code_verifier');
  const ip = getClientIP(c);
  const userAgent = c.req.header('User-Agent');
  const db = drizzle(c.env.DB, { schema });

  // ISO 27001 A.9.4.2 — Validate OAuth PKCE state (CSRF protection)
  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    await audit(db, 'LOGIN_FAILED', { ip, userAgent, details: { reason: 'invalid_oauth_state' } });
    return c.json({ error: 'Invalid request' }, 400);
  }

  // Clear PKCE cookies immediately (single-use)
  setCookie(c, 'google_oauth_state', '', { path: '/', maxAge: 0 });
  setCookie(c, 'google_code_verifier', '', { path: '/', maxAge: 0 });

  try {
    const google = getGoogleAuth(c);
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    // Get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const user = await response.json() as { id: string; email: string;[key: string]: unknown };
    const email = user.email;

    // ISO 27001 A.9.2.3 — Verify admin whitelist before granting access
    const adminEmails = c.env.ADMIN_EMAILS.split(',').map((e: string) => e.trim());
    if (!adminEmails.includes(email)) {
      await audit(db, 'LOGIN_FAILED', { email, ip, userAgent, details: { reason: 'not_in_whitelist' } });
      const origin = `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`;
      return c.redirect(`${origin}/?error=not_authorized`);
    }

    // ISO 27001 A.9.4.3 — Session management
    // Sessions expire in 8 hours (reduced from 7 days per A.9.4.2 access control)
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: user.id as string,
      email: email,
      expiresAt: expiresAt,
    });

    // ISO 27001 A.12.4.1 — Log successful login
    await audit(db, 'LOGIN_SUCCESS', { email, ip, userAgent });

    const reqUrl = new URL(c.req.url);
    const origin = `${reqUrl.protocol}//${reqUrl.host}`;
    const isHttps = reqUrl.protocol === 'https:';

    // Set HttpOnly cookie — never exposed to JavaScript
    setCookie(c, 'admin_session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: isHttps,
      sameSite: 'Lax',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return c.redirect(`${origin}/admin`);
  } catch (error) {
    await audit(drizzle(c.env.DB, { schema }), 'LOGIN_FAILED', {
      ip,
      userAgent,
      details: { reason: 'exception', message: error instanceof Error ? error.message : 'unknown' },
    });
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

app.post('/api/auth/logout', async (c) => {
  const cookieSession = getCookie(c, 'admin_session');
  const headerSession = c.req.header('Authorization')?.replace('Bearer ', '');
  const sessionId = cookieSession || headerSession;

  if (sessionId) {
    const db = drizzle(c.env.DB, { schema });
    // Get email before deleting for audit
    const session = await db.query.sessions.findFirst({ where: eq(schema.sessions.id, sessionId) });
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
    // ISO 27001 A.12.4.1 — Log logout event
    await audit(db, 'LOGOUT', {
      email: session?.email,
      ip: getClientIP(c),
      userAgent: c.req.header('User-Agent'),
    });
  }

  setCookie(c, 'admin_session', '', { path: '/', httpOnly: true, maxAge: 0 });
  return c.json({ success: true });
});

// Check session — reads from HttpOnly cookie (primary) or Authorization header (fallback)
app.get('/api/auth/session', async (c) => {
  // Prefer the HttpOnly cookie (secure, not accessible to JS)
  const cookieSession = getCookie(c, 'admin_session');
  // Fallback: Authorization header for existing localStorage-based sessions during migration
  const headerSession = c.req.header('Authorization')?.replace('Bearer ', '');
  const sessionId = cookieSession || headerSession;

  if (!sessionId) {
    return c.json({ authenticated: false }, 401);
  }

  const db = drizzle(c.env.DB, { schema });
  const session = await db.query.sessions.findFirst({
    where: eq(schema.sessions.id, sessionId),
  });

  if (!session || session.expiresAt < new Date()) {
    // Clear stale cookie if present
    if (cookieSession) {
      setCookie(c, 'admin_session', '', { path: '/', maxAge: 0 });
    }
    return c.json({ authenticated: false }, 401);
  }

  return c.json({
    authenticated: true,
    email: session.email,
    expiresAt: session.expiresAt,
  });
});

// Public API - Get class schedule
app.get('/api/schedule', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const schedules = await db.query.classSchedule.findMany({
    where: eq(schema.classSchedule.isActive, true),
  });

  return c.json(schedules);
});

// Admin API - Get all schedules (including inactive)
app.get('/api/admin/schedule', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const schedules = await db.query.classSchedule.findMany();

  return c.json(schedules);
});

// Admin API - Create schedule
app.post('/api/admin/schedule', requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const newSchedule = await db.insert(schema.classSchedule).values({
    dayOfWeek: body.dayOfWeek,
    time: body.time,
    className: body.className,
    level: body.level,
    coach: body.coach,
    maxCapacity: body.maxCapacity,
    isActive: body.isActive ?? true,
  }).returning();

  return c.json(newSchedule[0], 201);
});

// Admin API - Update schedule
app.put('/api/admin/schedule/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const { id: _id, createdAt, updatedAt, ...updateData } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const updated = await db.update(schema.classSchedule)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(schema.classSchedule.id, id))
    .returning();

  if (updated.length === 0) {
    return c.json({ error: 'Schedule not found' }, 404);
  }

  return c.json(updated[0]);
});

// Admin API - Delete schedule
app.delete('/api/admin/schedule/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  await db.delete(schema.classSchedule).where(eq(schema.classSchedule.id, id));

  return c.json({ success: true });
});

// Admin API - Get admin list
app.get('/api/admin/admins', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const admins = await db.query.admins.findMany();

  return c.json(admins);
});

// ==================== SETTINGS API ====================

// Public API - Get all settings
app.get('/api/settings', async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const allSettings = await db.query.settings.findMany();
    const settingsMap = allSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    return c.json(settingsMap);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Admin API - Update batch settings
app.put('/api/admin/settings', requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  try {
    for (const [key, value] of Object.entries(body)) {
      const existing = await db.select().from(schema.settings).where(eq(schema.settings.key, key)).get();
      if (existing) {
        await db.update(schema.settings)
          .set({ value: String(value), updatedAt: new Date() })
          .where(eq(schema.settings.key, key));
      } else {
        await db.insert(schema.settings)
          .values({ key, value: String(value), updatedAt: new Date() });
      }
    }
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// ==================== CLASS TYPES API ====================

// Admin API - Get all class types
app.get('/api/admin/class-types', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const classTypes = await db.query.classTypes.findMany();

  return c.json(classTypes);
});

// Public API - Get active class types
app.get('/api/class-types', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const classTypes = await db.query.classTypes.findMany({
    where: eq(schema.classTypes.isActive, true),
  });

  return c.json(classTypes);
});

// Admin API - Create class type
app.post('/api/admin/class-types', requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const newClassType = await db.insert(schema.classTypes).values({
    name: body.name,
    description: body.description,
    color: body.color,
    isActive: body.isActive ?? true,
  }).returning();

  return c.json(newClassType[0], 201);
});

// Admin API - Update class type
app.put('/api/admin/class-types/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const { id: _id, createdAt, updatedAt, ...updateData } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const updated = await db.update(schema.classTypes)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(schema.classTypes.id, id))
    .returning();

  if (updated.length === 0) {
    return c.json({ error: 'Class type not found' }, 404);
  }

  return c.json(updated[0]);
});

// Admin API - Delete class type
app.delete('/api/admin/class-types/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  await db.delete(schema.classTypes).where(eq(schema.classTypes.id, id));

  return c.json({ success: true });
});

// ==================== PLANS CMS API ====================

// Public API - Get active plans
app.get('/api/plans', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const plansList = await db.query.plans.findMany({
    where: eq(schema.plans.isActive, true),
    orderBy: [asc(schema.plans.orderIndex)],
  });

  return c.json(plansList);
});

// Admin API - Get all plans
app.get('/api/admin/plans', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const plansList = await db.query.plans.findMany({
    orderBy: [asc(schema.plans.orderIndex)],
  });

  return c.json(plansList);
});

// Admin API - Create plan
app.post('/api/admin/plans', requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const newPlan = await db.insert(schema.plans).values({
    name: body.name,
    moduleName: body.moduleName,
    hook: body.hook,
    price: body.price,
    description: body.description,
    features: body.features,
    featured: body.featured ?? false,
    cta: body.cta,
    orderIndex: body.orderIndex ?? 0,
    isActive: body.isActive ?? true,
  }).returning();

  return c.json(newPlan[0], 201);
});

// Admin API - Update plan
app.put('/api/admin/plans/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const { id: _id, createdAt, updatedAt, ...updateData } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const updated = await db.update(schema.plans)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(schema.plans.id, id))
    .returning();

  if (updated.length === 0) {
    return c.json({ error: 'Plan not found' }, 404);
  }

  return c.json(updated[0]);
});

// Admin API - Delete plan
app.delete('/api/admin/plans/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  await db.delete(schema.plans).where(eq(schema.plans.id, id));

  return c.json({ success: true });
});

// ==================== STUDENTS API ====================

// Admin API - Get all students
app.get('/api/admin/students', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const students = await db.query.students.findMany();

  return c.json(students);
});

// Admin API - Get active students
app.get('/api/admin/students/active', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const students = await db.query.students.findMany({
    where: eq(schema.students.isActive, true),
  });

  return c.json(students);
});

// Admin API - Get student by ID
app.get('/api/admin/students/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  const student = await db.query.students.findFirst({
    where: eq(schema.students.id, id),
  });

  if (!student) {
    return c.json({ error: 'Student not found' }, 404);
  }

  return c.json(student);
});

// Admin API - Create student
app.post('/api/admin/students', requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  // Validate required fields
  if (!body.firstName || !body.lastName || !body.email || !body.phone) {
    return c.json({
      error: 'Missing required fields',
      required: ['firstName', 'lastName', 'email', 'phone']
    }, 400);
  }

  const newStudent = await db.insert(schema.students).values({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    dateOfBirth: body.dateOfBirth,
    emergencyContact: body.emergencyContact,
    emergencyPhone: body.emergencyPhone,
    medicalConditions: body.medicalConditions,
    membershipType: body.membershipType,
    membershipStartDate: body.membershipStartDate,
    membershipEndDate: body.membershipEndDate,
    notes: body.notes,
    isActive: body.isActive ?? true,
  }).returning();

  return c.json(newStudent[0], 201);
});

// Admin API - Update student
app.put('/api/admin/students/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const { id: _id, createdAt, updatedAt, ...updateData } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const updated = await db.update(schema.students)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(schema.students.id, id))
    .returning();

  if (updated.length === 0) {
    return c.json({ error: 'Student not found' }, 404);
  }

  return c.json(updated[0]);
});

// Admin API - Delete student
app.delete('/api/admin/students/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  await db.delete(schema.students).where(eq(schema.students.id, id));

  return c.json({ success: true });
});

// Public API - Submit lead / contact form (Send via Resend)
app.post('/api/leads', async (c) => {
  try {
    const body = await c.req.json();
    const { type, name, phone, email, interestClass, message, value } = body;

    const resendKey = c.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      return c.json({ error: "Email service not configured" }, 500);
    }

    let htmlContent = "";
    let subject = "";

    if (type === "waitlist") {
      subject = `🚨 Nueva inscripción Lista de Espera: ${value}`;
      htmlContent = `
        <h2>Nueva Inscripción - Lista de Espera (Apertura)</h2>
        <p><strong>Contacto:</strong> ${value}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
      `;
    } else {
      subject = `💪 Solicitud de Clase Gratis: ${name}`;
      htmlContent = `
        <h2>Nueva Solicitud de Clase Gratis</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>WhatsApp/Teléfono:</strong> ${phone}</p>
        <p><strong>Clase de interés:</strong> ${interestClass}</p>
        <p><strong>Mensaje:</strong> ${message || "Ninguno"}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
      `;
    }

    // Send email using Resend API (standard fetch)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TrainoFit Web <no-responder@trainofit.cl>",
        to: "trainocf@gmail.com",
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", errText);
      return c.json({ error: "Failed to send email via Resend" }, 500);
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/leads:", err);
    return c.json({ error: err.message || "Internal server error" }, 500);
  }
});

// ISO 27001 A.9.4 — Admin-only AI assistant endpoint (internal tool)
app.post('/api/assistant', requireAdmin, async (c) => {
  try {
    const { message, history = [] } = await c.req.json();
    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    // Fetch all routines from the DB
    const dbRoutines = await db.select().from(schema.routines).all();

    // Fetch available equipment from DB
    let equipmentContext = 'No hay equipamiento registrado en el sistema.';
    try {
      const dbEquipment = await db.select().from(schema.equipment).all();
      const available = dbEquipment.filter(e => e.isAvailable);
      if (available.length > 0) {
        equipmentContext = available.map(e =>
          `- **${e.name}** (${e.category}): ${e.quantity} unidades disponibles${e.description ? '. ' + e.description : ''}`
        ).join('\n');
      }
    } catch { /* equipment table may not exist yet */ }

    // Build routines context string
    const routinesContext = dbRoutines.map(r =>
      `- **${r.routineName}** | ${r.exerciseName}: ${r.sets} series x ${r.reps} reps (${r.intensityPct ? r.intensityPct + '%' : 'N/A'} int.) - ${r.difficulty}. *Técnica:* ${r.description || 'Sin descripción'}`
    ).join('\n');

    // Fetch token from settings or environment
    const hfTokenSetting = await db.select()
      .from(schema.settings)
      .where(eq(schema.settings.key, 'HF_TOKEN'))
      .get();

    const token = c.env.HF_TOKEN || c.env.HUGGINGFACE_TOKEN || hfTokenSetting?.value;
    const systemPrompt = `Eres un Coach y Entrenador de CrossFit certificado y experto de TrainoFit, además de asesor de bienestar físico y salud. Tu objetivo es asesorar a los alumnos en español sobre entrenamientos, responder dudas y recomendar rutinas de forma profesional, segura y altamente motivadora.

## BASE DE DATOS DE RUTINAS (TrainoFit):
${routinesContext || 'Sin rutinas cargadas aún.'}

## EQUIPAMIENTO DISPONIBLE EN EL GYM:
${equipmentContext}
IMPORTANTE: SOLO diseña rutinas usando el equipamiento listado arriba. Si un ejercicio requiere equipo no disponible, ofrece una alternativa con el equipo existente o con el peso corporal. Nunca sugieras ejercicios con equipamiento que no está en el inventario del gym.

## TIPOS DE ENTRENAMIENTO SOPORTADOS:
- CrossFit / WOD (metabólico, AMRAP, EMOM, for-time)
- Fuerza y Potencia (pesas, barbell, kettlebell)
- Acondicionamiento Físico (cardio, resistencia, funcional)
- Calistenia (peso corporal: dominadas, flexiones, dips, L-sit)
- Gimnasia deportiva (rings, paralelas, handstand)

REGLAS DE FORMATO Y REDUNDANCIA (¡CRÍTICO!):
1. NO DETALLES la rutina completa ni listes los ejercicios en tu respuesta de texto.
2. En su lugar, proporciona únicamente un texto de resumen/overview muy simple y breve (máximo 2-3 líneas o 1 párrafo corto) explicando el enfoque u objetivo principal de la rutina propuesta.
3. Delega todos los detalles específicos de los ejercicios (series, repeticiones, intensidad, descanso, descripción técnica) al bloque JSON de abajo. El usuario ya verá la rutina estructurada y renderizada en tarjetas dentro de la interfaz, por lo que repetirla en el texto es redundante y satura la pantalla de forma innecesaria.

REGLAS DE VALIDACIÓN:
1. Siempre prioriza la seguridad. Antes de proponer rutinas advierte sobre lesiones o condiciones de salud.
2. Las series deben ser 1-6, reps consistentes con el objetivo (fuerza: 1-5, hipertrofia: 8-12, resistencia: 15+).
3. La intensidad porcentual debe ser realista para el nivel del alumno.
4. Para cada ejercicio, indica el descanso recomendado en segundos (restSeconds).

PROTOCOLO DE GUARDADO (TOOL CALLING):
DEBES INCLUIR SIEMPRE al final de tu respuesta el bloque JSON con la acción "save_routine" y los detalles de cada ejercicio diseñado. Esto es obligatorio para que el sistema pueda guardar y compartir la rutina con el alumno. No lo omitas bajo ninguna circunstancia cuando propongas o modifiques una rutina. Debe tener exactamente esta estructura:
\`\`\`json
{
  "action": "save_routine",
  "routines": [
    {
      "routineName": "Nombre de la Rutina",
      "exerciseName": "Nombre del Ejercicio",
      "description": "Técnica, seguridad, ejecución.",
      "sets": 4,
      "reps": "8-10",
      "intensityPct": 75,
      "restSeconds": 90,
      "difficulty": "Principiante"
    }
  ]
}
\`\`\`
Genera siempre este bloque si has diseñado, modificado o propuesto una rutina.`;

    let aiText = "";
    let source = "none";

    // 1. Try Hugging Face Inference API with Qwen 2.5 72B (very smart model!)
    if (token) {
      try {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "Qwen/Qwen2.5-72B-Instruct",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              ...history.slice(-6),
              {
                role: "user",
                content: message
              }
            ],
            max_tokens: 2048,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{
              message?: {
                content?: string;
              };
            }>;
          };
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            aiText = content;
            source = "huggingface-72b";
          }
        } else {
          console.error("Hugging Face API returned error status:", response.status, await response.text());
        }
      } catch (apiErr) {
        console.error("Failed to fetch from Hugging Face Inference API:", apiErr);
      }
    }

    // 2. Fallback to Cloudflare Workers AI if Hugging Face failed or wasn't configured
    if (!aiText && (c.env as any).AI) {
      try {
        const cfResult = await (c.env as any).AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content })),
            {
              role: "user",
              content: message
            }
          ]
        });
        if (cfResult && cfResult.response) {
          aiText = cfResult.response;
          source = "cloudflare-workers-ai";
        }
      } catch (cfErr) {
        console.error("Cloudflare Workers AI fallback failed:", cfErr);
      }
    }

    // 3. Process AI response text and toolCall structures if we got a response
    if (aiText) {
      let toolCall = null;
      let cleanedText = aiText;

      // Robust Regex Fallback Parser to guarantee extraction
      // Pass 1: find fenced code blocks containing save_routine
      const fencedRegex = /```(?:json)?\s*([\s\S]*?)```/g;
      let fencedMatch: RegExpExecArray | null;
      while ((fencedMatch = fencedRegex.exec(cleanedText)) !== null) {
        try {
          const candidate = fencedMatch[1].trim();
          const parsed = JSON.parse(candidate);
          if (parsed && parsed.action === 'save_routine' && Array.isArray(parsed.routines)) {
            toolCall = parsed;
            cleanedText = cleanedText.replace(fencedMatch[0], '').trim();
            break;
          }
        } catch { /* skip */ }
      }

      // Pass 2: bare JSON object
      if (!toolCall) {
        const bareRegex = /\{\s*"action"\s*:\s*"save_routine"[\s\S]*?\}/g;
        const bareMatch = cleanedText.match(bareRegex);
        if (bareMatch) {
          try {
            const parsed = JSON.parse(bareMatch[0]);
            if (parsed && Array.isArray(parsed.routines)) {
              toolCall = parsed;
              cleanedText = cleanedText.replace(bareMatch[0], '').trim();
            }
          } catch { /* skip */ }
        }
      }

      // Nuclear clean remaining braces/code fences
      cleanedText = cleanedText
        .replace(/```(?:json)?[\s\S]*?```/g, '')
        .replace(/^\s*\{[\s\S]*?\}\s*$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      return c.json({
        text: cleanedText || '✅ Rutina procesada correctamente.',
        toolCall: toolCall,
        source: source
      });
    }

    // Local Fallback Responder (always works, zero external dependency!)
    const normMsg = message.toLowerCase();
    let responseText = "";
    let localToolCall = null;

    if (normMsg.includes("fuerza") || normMsg.includes("pierna") || normMsg.includes("squat") || normMsg.includes("sentadilla")) {
      const legRoutines = dbRoutines.filter(r => r.routineName.toLowerCase().includes("piernas") || r.routineName.toLowerCase().includes("leg"));
      const routinesToUse = legRoutines.length > 0 ? legRoutines : [
        { id: 1, routineName: "Fuerza de Piernas", exerciseName: "Sentadilla Trasera (Back Squat)", sets: 4, reps: "8", intensityPct: 75, difficulty: "Intermedio", description: "Mantén el core firme y baja rompiendo el paralelo." },
        { id: 2, routineName: "Fuerza de Piernas", exerciseName: "Peso Muerto Rumano", sets: 3, reps: "10", intensityPct: 65, difficulty: "Intermedio", description: "Enfócate en la bisagra de cadera manteniendo espalda neutra." }
      ];
      responseText = `💪 **Recomendación del Coach:** Te sugiero nuestra rutina de **Fuerza y Potencia de Piernas**. He preparado una secuencia enfocada en construir fuerza y potencia en el tren inferior, ideal para desarrollar tus cuádriceps, glúteos e isquiotibiales de forma segura.`;
      
      localToolCall = {
        action: "save_routine",
        routines: routinesToUse.map(r => ({
          routineName: r.routineName,
          exerciseName: r.exerciseName,
          description: r.description || "Ejecutar con control",
          sets: r.sets,
          reps: r.reps.toString(),
          intensityPct: r.intensityPct || 70,
          difficulty: r.difficulty
        }))
      };
    } else if (normMsg.includes("metab") || normMsg.includes("cardio") || normMsg.includes("wod") || normMsg.includes("burpee") || normMsg.includes("murph")) {
      const cardRoutines = dbRoutines.filter(r => r.routineName.toLowerCase().includes("metab") || r.routineName.toLowerCase().includes("murph") || r.routineName.toLowerCase().includes("cardio"));
      const routinesToUse = cardRoutines.length > 0 ? cardRoutines : [
        { id: 1, routineName: "Acondicionamiento Metabólico", exerciseName: "Burpees", sets: 4, reps: "15", intensityPct: 80, difficulty: "Intermedio", description: "Mantén ritmo constante sin detenerte." },
        { id: 2, routineName: "Acondicionamiento Metabólico", exerciseName: "Kettlebell Swings", sets: 4, reps: "20", intensityPct: 75, difficulty: "Intermedio", description: "Empuje potente desde las caderas, no uses los hombros." }
      ];
      responseText = `⚡ **WOD Recomendado por el Coach:** Te sugiero nuestra rutina de **Acondicionamiento Metabólico**. Está diseñada para elevar tu ritmo cardíaco, mejorar tu resistencia cardiovascular y quemar calorías de manera eficiente y dinámica.`;
      
      localToolCall = {
        action: "save_routine",
        routines: routinesToUse.map(r => ({
          routineName: r.routineName,
          exerciseName: r.exerciseName,
          description: r.description || "Mantén el ritmo",
          sets: r.sets,
          reps: r.reps.toString(),
          intensityPct: r.intensityPct || 75,
          difficulty: r.difficulty
        }))
      };
    } else if (normMsg.includes("empuje") || normMsg.includes("pecho") || normMsg.includes("hombro") || normMsg.includes("press")) {
      const pushRoutines = dbRoutines.filter(r => r.routineName.toLowerCase().includes("empuje") || r.routineName.toLowerCase().includes("pecho") || r.routineName.toLowerCase().includes("push"));
      const routinesToUse = pushRoutines.length > 0 ? pushRoutines : [
        { id: 1, routineName: "Fuerza Empuje Superior", exerciseName: "Press de Banca Plana", sets: 4, reps: "8", intensityPct: 75, difficulty: "Intermedio", description: "Retracción escapular completa y codos a 45 grados." },
        { id: 2, routineName: "Fuerza Empuje Superior", exerciseName: "Press Militar de Hombros", sets: 3, reps: "10", intensityPct: 70, difficulty: "Intermedio", description: "Cuerpo firme sin arquear la espalda lumbar." }
      ];
      responseText = `🔥 **Recomendación de Fuerza Superior:** Aquí tienes la rutina de **Fuerza de Empuje Superior**. Esta propuesta está enfocada en el empuje del tren superior para fortalecer pectoral, hombros y tríceps de manera balanceada.`;
      
      localToolCall = {
        action: "save_routine",
        routines: routinesToUse.map(r => ({
          routineName: r.routineName,
          exerciseName: r.exerciseName,
          description: r.description || "Foco en la contracción",
          sets: r.sets,
          reps: r.reps.toString(),
          intensityPct: r.intensityPct || 75,
          difficulty: r.difficulty
        }))
      };
    } else {
      responseText = `👋 ¡Hola! Soy tu Coach Virtual de **TrainoFit**.\n\nPregúntame sobre rutinas de entrenamiento, ejercicios o consejos para mejorar tu técnica. Aquí tienes algunas de nuestras rutinas destacadas:\n\n` +
        `- **Fuerza de Piernas** (Sentadillas y Peso Muerto a alta intensidad)\n` +
        `- **Acondicionamiento Metabólico** (Burpees, Kettlebell Swings y saltos dobles)\n` +
        `- **Fuerza de Empuje Superior** (Banca plana y Press Militar)\n` +
        `- **WOD Murph Adaptado** (Dominadas, Flexiones y Sentadillas)\n\n` +
        `¿Cuál te gustaría detallar o qué nivel buscas hoy? (Principiante / Intermedio / Avanzado)`;
    }

    return c.json({
      text: responseText,
      toolCall: localToolCall,
      source: "local",
      tip: token ? undefined : "Puedes configurar tu token de Hugging Face (`HF_TOKEN`) en el panel de administrador para activar la IA completa."
    });

  } catch (err: any) {
    console.error("Error in /api/assistant:", err);
    return c.json({ error: err.message || "Internal server error" }, 500);
  }
});

// ==================== ROUTINES API ====================

// Admin API - Get all routines
app.get('/api/admin/routines', requireAdmin, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const routinesList = await db.query.routines.findMany({
    orderBy: [desc(schema.routines.id)],
  });
  return c.json(routinesList);
});

// Admin API - Create routine
app.post('/api/admin/routines', requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  // Support single routine or array of routines
  const items = Array.isArray(body) ? body : [body];
  const createdItems = [];

  for (const item of items) {
    if (!item.routineName || !item.exerciseName || !item.sets || !item.reps || !item.difficulty) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    const newRoutine = await db.insert(schema.routines).values({
      routineName: item.routineName,
      exerciseName: item.exerciseName,
      description: item.description || '',
      sets: parseInt(item.sets),
      reps: String(item.reps),
      intensityPct: item.intensityPct ? parseInt(item.intensityPct) : null,
      difficulty: item.difficulty,
    }).returning();
    createdItems.push(newRoutine[0]);
  }

  return c.json(Array.isArray(body) ? createdItems : createdItems[0], 201);
});

// Admin API - Update routine
app.put('/api/admin/routines/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const { id: _id, createdAt, updatedAt, ...updateData } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const updated = await db.update(schema.routines)
    .set({
      ...updateData,
      sets: updateData.sets ? parseInt(updateData.sets) : undefined,
      intensityPct: updateData.intensityPct ? parseInt(updateData.intensityPct) : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.routines.id, id))
    .returning();

  if (updated.length === 0) {
    return c.json({ error: 'Routine not found' }, 404);
  }

  return c.json(updated[0]);
});

// Admin API - Delete routine
app.delete('/api/admin/routines/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  await db.delete(schema.routines).where(eq(schema.routines.id, id));

  return c.json({ success: true });
});

// ==================== WORKOUTS API ====================

// Admin API - Get all workouts with their exercises
app.get('/api/admin/workouts', requireAdmin, async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const allWorkouts = await db.query.workouts.findMany({
      orderBy: [desc(schema.workouts.id)],
    });
    const allExercises = await db.query.workoutExercises.findMany();

    const workoutsWithExercises = allWorkouts.map(w => ({
      ...w,
      exercises: allExercises.filter(e => e.workoutId === w.id),
    }));

    return c.json(workoutsWithExercises);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Admin API - Create workout
app.post('/api/admin/workouts', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const db = drizzle(c.env.DB, { schema });

    if (!body.name || !body.difficulty) {
      return c.json({ error: 'Missing name or difficulty' }, 400);
    }

    const token = crypto.randomUUID();

    const newWorkout = await db.insert(schema.workouts).values({
      name: body.name,
      description: body.description || '',
      difficulty: body.difficulty,
      magicToken: token,
    }).returning();

    const workoutId = newWorkout[0].id;
    const createdExercises = [];

    if (body.exercises && Array.isArray(body.exercises)) {
      for (const ex of body.exercises) {
        if (!ex.routineName || !ex.exerciseName || !ex.sets || !ex.reps) continue;
        const newEx = await db.insert(schema.workoutExercises).values({
          workoutId,
          routineName: ex.routineName,
          exerciseName: ex.exerciseName,
          description: ex.description || '',
          sets: parseInt(ex.sets),
          reps: String(ex.reps),
          intensityPct: ex.intensityPct ? parseInt(ex.intensityPct) : null,
          difficulty: ex.difficulty || body.difficulty,
        }).returning();
        createdExercises.push(newEx[0]);
      }
    }

    return c.json({
      ...newWorkout[0],
      exercises: createdExercises,
    }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Admin API - Update workout
app.put('/api/admin/workouts/:id', requireAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const db = drizzle(c.env.DB, { schema });

    const updated = await db.update(schema.workouts)
      .set({
        name: body.name,
        description: body.description,
        difficulty: body.difficulty,
        updatedAt: new Date(),
      })
      .where(eq(schema.workouts.id, id))
      .returning();

    if (updated.length === 0) {
      return c.json({ error: 'Workout not found' }, 404);
    }

    // Replace the exercises
    await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, id));

    const createdExercises = [];
    if (body.exercises && Array.isArray(body.exercises)) {
      for (const ex of body.exercises) {
        if (!ex.routineName || !ex.exerciseName || !ex.sets || !ex.reps) continue;
        const newEx = await db.insert(schema.workoutExercises).values({
          workoutId: id,
          routineName: ex.routineName,
          exerciseName: ex.exerciseName,
          description: ex.description || '',
          sets: parseInt(ex.sets),
          reps: String(ex.reps),
          intensityPct: ex.intensityPct ? parseInt(ex.intensityPct) : null,
          difficulty: ex.difficulty || body.difficulty,
        }).returning();
        createdExercises.push(newEx[0]);
      }
    }

    return c.json({
      ...updated[0],
      exercises: createdExercises,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Admin API - Delete workout
app.delete('/api/admin/workouts/:id', requireAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });

    await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, id));
    await db.delete(schema.workouts).where(eq(schema.workouts.id, id));

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// ==================== EQUIPMENT API ====================

// Get all equipment
app.get('/api/admin/equipment', requireAdmin, async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.equipment).orderBy(asc(schema.equipment.category), asc(schema.equipment.name));
    return c.json(list);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Create equipment
app.post('/api/admin/equipment', requireAdmin, async (c) => {
  try {
    const body = await c.req.json() as { name: string; category: string; quantity: number; description?: string; isAvailable?: boolean };
    const db = drizzle(c.env.DB, { schema });
    const [created] = await db.insert(schema.equipment).values({
      name: body.name,
      category: body.category,
      quantity: body.quantity ?? 1,
      description: body.description,
      isAvailable: body.isAvailable !== false,
    }).returning();
    return c.json(created, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Update equipment
app.put('/api/admin/equipment/:id', requireAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json() as Partial<{ name: string; category: string; quantity: number; description: string; isAvailable: boolean }>;
    const db = drizzle(c.env.DB, { schema });
    const [updated] = await db.update(schema.equipment)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(schema.equipment.id, id))
      .returning();
    return c.json(updated);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Delete equipment
app.delete('/api/admin/equipment/:id', requireAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.equipment).where(eq(schema.equipment.id, id));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Public API - Get shared workout by magic token
app.get('/api/workout/shared/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const ip = getClientIP(c);
    const db = drizzle(c.env.DB, { schema });
    const rawDb = c.env.DB;

    // ISO 27001 A.9.4.2 — Rate limit public access to prevent token brute-forcing
    if (await isRateLimited(rawDb, ip, 'workout/shared')) {
      await audit(db, 'SHARED_WORKOUT_BLOCKED', {
        ip,
        userAgent: c.req.header('User-Agent'),
        details: { reason: 'rate_limit_exceeded', token },
      });
      return c.json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' }, 429);
    }
    await recordAttempt(rawDb, ip, 'workout/shared');

    const workout = await db.query.workouts.findFirst({
      where: eq(schema.workouts.magicToken, token),
    });

    if (!workout) {
      await audit(db, 'SHARED_WORKOUT_NOT_FOUND', {
        ip,
        userAgent: c.req.header('User-Agent'),
        details: { token },
      });
      return c.json({ error: 'Workout not found' }, 404);
    }

    const exercises = await db.query.workoutExercises.findMany({
      where: eq(schema.workoutExercises.workoutId, workout.id),
    });

    // ISO 27001 A.12.4.1 — Audit successful access to public shared resources
    await audit(db, 'WORKOUT_ACCESSED', {
      ip,
      userAgent: c.req.header('User-Agent'),
      details: { workoutId: workout.id, workoutName: workout.name, token }
    });

    return c.json({
      ...workout,
      exercises,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default app;
