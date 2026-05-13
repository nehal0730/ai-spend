# Database schema overview

This schema is designed for Supabase/Postgres and keeps mutable session data, tool definitions, results, summaries, and public sharing concerns separated.

## Tables

- `tool_catalog` stores canonical tool metadata once.
- `audit_sessions` stores each audit run and its lifecycle.
- `audit_session_tool_selections` stores the tools chosen for a session and their order/configuration.
- `audit_results` stores structured findings tied to a selected tool.
- `ai_summaries` stores AI-generated narrative output for a session.
- `public_reports` stores shareable report metadata and access control fields.
- `lead_capture_emails` stores email signups that came from a public report or another funnel.

## UUID strategy

All primary keys use `uuid` with `gen_random_uuid()` defaults.

Recommended usage:
- Use UUIDs for every public-facing identifier and every foreign key.
- Keep the share token separate from the public report UUID.
- Store only a hash of the share token in the database.

## Security notes

- Enable Row Level Security in Supabase for all tables.
- Let authenticated users read/write only their own `audit_sessions` and dependent rows.
- Keep `audit_results`, `ai_summaries`, and `lead_capture_emails` private by default.
- Expose `public_reports` only through an unlisted/public policy or a server-side lookup by share token.
- Never expose `share_token_hash` to clients.
- Insert lead capture rows only from trusted server or Edge Function code.

## Applying migrations

Files are split under `backend/db/migrations/` and should be applied in numeric order.

Using `psql`:

```bash
# from repository root
psql "postgres://<user>:<pass>@<host>:5432/<db>" -f backend/db/migrations/001_extensions_and_types.sql
psql "postgres://<user>:<pass>@<host>:5432/<db>" -f backend/db/migrations/002_tables.sql
psql "postgres://<user>:<pass>@<host>:5432/<db>" -f backend/db/migrations/003_indexes_and_constraints.sql
psql "postgres://<user>:<pass>@<host>:5432/<db>" -f backend/db/migrations/004_triggers_and_functions.sql
psql "postgres://<user>:<pass>@<host>:5432/<db>" -f backend/db/migrations/005_seeds.sql
```

Using Supabase CLI (recommended for Supabase projects):

```bash
supabase db remote set <db-connection-string>
supabase db push --file backend/db/migrations --schema public
```

## Smoke tests to run after applying migrations

Run these checks to validate the schema:

1) Verify tables exist

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

2) Confirm extensions

```sql
SELECT * FROM pg_extension;
```

3) Insert and read a session, selection, result, and summary (example):

```sql
BEGIN;
INSERT INTO audit_sessions (title) VALUES ('smoke-session') RETURNING id;
-- take the returned id -> :session_id
INSERT INTO audit_session_tool_selections (session_id, tool_id, selection_order)
	SELECT :session_id, id, 1 FROM tool_catalog WHERE tool_key = 'security_headers' LIMIT 1 RETURNING id;
-- take returned id -> :selection_id
INSERT INTO audit_results (session_id, session_tool_selection_id, result_key, result_value)
	VALUES (:session_id, :selection_id, 'headers_missing', '{"missing":["X-Frame-Options"]}');
INSERT INTO ai_summaries (session_id, content) VALUES (:session_id, 'Smoke test summary');
COMMIT;
```

4) Query the JSONB result

```sql
SELECT id, result_key, result_value->'missing' AS missing FROM audit_results WHERE session_id = :session_id;
```

5) Check the GIN index is used (EXPLAIN)

```sql
EXPLAIN SELECT * FROM audit_results WHERE result_value @> '{"missing": ["X-Frame-Options"]}';
```

## Quick automated test (recommended)

You can run the migrations and smoke tests locally using the Node scripts provided. From the `backend` folder:

```bash
# install deps
npm install

# set DATABASE_URL, for example using Docker postgres
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_spend_dev

# run migrations
npm run migrate

# run smoke test (inserts a session, selection, result, summary and prints results)
npm run smoke
```

On Windows PowerShell, use `$env:DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/ai_spend_dev'` to set the env var for the session.

## Creating the `test_audits` table in Supabase (one-time)

If you don't want to run migrations, create a tiny table in your Supabase project's SQL editor before testing the `POST /test-db` route.

Run this in Supabase SQL editor (or via `psql`):

```sql
create table if not exists public.test_audits (
	id uuid primary key default gen_random_uuid(),
	company_name text not null,
	team_size integer null,
	created_at timestamptz not null default timezone('utc', now())
);
```

This single table is intentionally small and safe for smoke-testing your backend-to-database flow.