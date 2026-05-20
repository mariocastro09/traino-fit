-- Migration: ISO 27001 Security Hardening
-- Controls: A.9.4.2 (Log-on), A.12.4.1 (Event Logging), A.9.4.4 (Access Control)
-- Created: 2026-05-20

-- Rate limiting table (A.9.4.2 - brute force protection)
CREATE TABLE IF NOT EXISTS rate_limits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip         TEXT    NOT NULL,
  endpoint   TEXT    NOT NULL,
  attempted_at TEXT  NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint
  ON rate_limits (ip, endpoint, attempted_at);

-- Audit log table (A.12.4.1 - event logging)
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type  TEXT NOT NULL,  -- 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGIN_BLOCKED' | 'LOGOUT' | 'ADMIN_ACTION' | 'UNAUTHORIZED'
  email       TEXT,
  ip          TEXT,
  user_agent  TEXT,
  details     TEXT,           -- JSON string with extra context
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_event
  ON audit_log (event_type, created_at);
