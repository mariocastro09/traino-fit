// Cloudflare Workers types
declare global {
  interface Env {
    DB: D1Database;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    SESSION_SECRET: string;
    ADMIN_EMAILS: string;
    FRONTEND_URL?: string;
  }
}

export {};
