import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { setCookie, getCookie } from 'hono/cookie';
import { drizzle } from 'drizzle-orm/d1';
import { eq, asc } from 'drizzle-orm';
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
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8787',
    'https://trainofit.mcastrodev.workers.dev',
    'https://trainofit.mcastrodev.cl'
  ],
  credentials: true,
}));

// Initialize Google OAuth
function getGoogleAuth(c: any) {
  return new Google(
    c.env.GOOGLE_CLIENT_ID,
    c.env.GOOGLE_CLIENT_SECRET,
    c.env.GOOGLE_REDIRECT_URI
  );
}

// Middleware to check if user is admin
async function requireAdmin(c: any, next: any) {
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = drizzle(c.env.DB, { schema });
  const session = await db.query.sessions.findFirst({
    where: eq(schema.sessions.id, sessionId),
  });

  if (!session || session.expiresAt < new Date()) {
    return c.json({ error: 'Session expired' }, 401);
  }

  // Check if email is in admin whitelist
  const adminEmails = c.env.ADMIN_EMAILS.split(',').map((e: string) => e.trim());
  if (!adminEmails.includes(session.email)) {
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
app.get('/api/auth/login', async (c) => {
  const google = getGoogleAuth(c);
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = await google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);

  setCookie(c, 'google_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'Lax',
  });

  setCookie(c, 'google_code_verifier', codeVerifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'Lax',
  });

  // Redirect to Google OAuth instead of returning JSON
  return c.redirect(url.toString());
});

app.get('/api/auth/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const storedState = getCookie(c, 'google_oauth_state');
  const codeVerifier = getCookie(c, 'google_code_verifier');

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  try {
    const google = getGoogleAuth(c);

    console.log('Validating auth code...');
    console.log('Code verifier exists:', !!codeVerifier);
    console.log('State matches:', state === storedState);

    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    console.log('Successfully validated auth code');
    console.log('Tokens object keys:', Object.keys(tokens));
    console.log('Access token exists:', !!tokens.accessToken);
    console.log('Access token type:', typeof tokens.accessToken);

    // Get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    const user = await response.json() as { id: string; email: string;[key: string]: any };
    const email = user.email;

    console.log('User email:', email);

    // Check if email is in admin whitelist
    const adminEmails = c.env.ADMIN_EMAILS.split(',').map((e: string) => e.trim());
    if (!adminEmails.includes(email)) {
      console.log('Email not in whitelist');
      const url = new URL(c.req.url);
      const origin = `${url.protocol}//${url.host}`;
      return c.redirect(`${origin}/?error=not_authorized`);
    }

    // Create session
    const db = drizzle(c.env.DB, { schema });
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: user.id,
      email: email,
      expiresAt: expiresAt,
    });

    // Redirect to admin panel with session token
    // Use the request origin to redirect back to the correct domain
    const url = new URL(c.req.url);
    const origin = `${url.protocol}//${url.host}`;
    return c.redirect(`${origin}/admin?session=${sessionId}`);
  } catch (error) {
    console.error('Auth error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return c.json({ error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.post('/api/auth/logout', async (c) => {
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');

  if (sessionId) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
  }

  return c.json({ success: true });
});

// Check session
app.get('/api/auth/session', async (c) => {
  const sessionId = c.req.query('session');

  if (!sessionId) {
    return c.json({ authenticated: false }, 401);
  }

  const db = drizzle(c.env.DB, { schema });
  const session = await db.query.sessions.findFirst({
    where: eq(schema.sessions.id, sessionId),
  });

  if (!session || session.expiresAt < new Date()) {
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

export default app;
