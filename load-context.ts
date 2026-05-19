import type { D1Database } from '@cloudflare/workers-types';
import type { Context } from 'hono';

type Env = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  SESSION_SECRET: string;
  ADMIN_EMAILS: string;
  FRONTEND_URL?: string;
};

export type AppLoadContext = {
  cloudflare: {
    env: Env;
  };
  hono: {
    context: Context;
  };
};

type GetLoadContext = (args: {
  request: Request;
  context: AppLoadContext;
}) => AppLoadContext;

export const getLoadContext: GetLoadContext = ({ context }) => {
  return context;
};
