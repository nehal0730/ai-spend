-- 005_seeds.sql
-- Minimal seed data for development and smoke tests

insert into tool_catalog (tool_key, tool_label, tool_category, description)
values
  ('security_headers', 'Security Headers Check', 'security', 'Validates common security headers'),
  ('open_ports', 'Open Ports Scan', 'infrastructure', 'Lists exposed ports'),
  ('secret_leak', 'Secret Leak Detector', 'secrets', 'Searches for high-entropy secrets in code')
ON CONFLICT (tool_key) DO NOTHING;

-- Optionally insert a test audit session (do not set user_id if you don't have auth.users in this DB)
WITH maybe_insert AS (
  INSERT INTO audit_sessions (title, description, status)
  SELECT 'Test Session', 'Auto-created smoke test session', 'draft'
  WHERE NOT EXISTS (
    SELECT 1 FROM audit_sessions WHERE title = 'Test Session' AND status = 'draft'
  )
  RETURNING id
)
SELECT id FROM maybe_insert;
