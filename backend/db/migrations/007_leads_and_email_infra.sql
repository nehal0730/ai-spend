-- 007_leads_and_email_infra.sql
-- Production-grade lead capture, email events, and report request tracking.

do $$
begin
  create type lead_status as enum ('new', 'subscribed', 'engaged', 'converted', 'suppressed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type lead_source as enum ('landing_page', 'audit_page', 'audit_results', 'share_page', 'contact_widget');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type report_request_status as enum ('pending', 'queued', 'sent', 'failed', 'deduped');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type report_request_type as enum ('audit_report', 'updates', 'share_delivery', 'consultation');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type email_event_kind as enum ('welcome', 'audit_report', 'follow_up', 'share_delivery', 'blocked', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type email_event_status as enum ('queued', 'sent', 'failed', 'suppressed');
exception
  when duplicate_object then null;
end $$;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  normalized_email text not null unique,
  company text null,
  role text null,
  team_size integer null,
  source lead_source not null default 'landing_page',
  status lead_status not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint leads_email_format check (position('@' in email) > 1),
  constraint leads_team_size_positive check (team_size is null or team_size > 0)
);

create table if not exists report_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  request_type report_request_type not null,
  status report_request_status not null default 'pending',
  source lead_source not null,
  share_id text null,
  report_title text null,
  report_url text null,
  dedupe_key text not null unique,
  request_ip_hash text null,
  request_user_agent text null,
  request_referer text null,
  metadata jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint report_requests_share_id_format check (share_id is null or share_id ~ '^[A-Za-z0-9_-]{8,64}$')
);

-- If an older `report_requests` table exists without the new schema, add missing columns safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_requests') THEN
    -- Add columns if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'dedupe_key') THEN
      ALTER TABLE report_requests ADD COLUMN dedupe_key text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'request_type') THEN
      ALTER TABLE report_requests ADD COLUMN request_type report_request_type;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'status') THEN
      ALTER TABLE report_requests ADD COLUMN status report_request_status;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'source') THEN
      ALTER TABLE report_requests ADD COLUMN source lead_source;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'share_id') THEN
      ALTER TABLE report_requests ADD COLUMN share_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'report_title') THEN
      ALTER TABLE report_requests ADD COLUMN report_title text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'report_url') THEN
      ALTER TABLE report_requests ADD COLUMN report_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'request_ip_hash') THEN
      ALTER TABLE report_requests ADD COLUMN request_ip_hash text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'request_user_agent') THEN
      ALTER TABLE report_requests ADD COLUMN request_user_agent text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'request_referer') THEN
      ALTER TABLE report_requests ADD COLUMN request_referer text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'metadata') THEN
      ALTER TABLE report_requests ADD COLUMN metadata jsonb not null default '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'requested_at') THEN
      ALTER TABLE report_requests ADD COLUMN requested_at timestamptz not null default timezone('utc', now());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'processed_at') THEN
      ALTER TABLE report_requests ADD COLUMN processed_at timestamptz null;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'created_at') THEN
      ALTER TABLE report_requests ADD COLUMN created_at timestamptz not null default timezone('utc', now());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'updated_at') THEN
      ALTER TABLE report_requests ADD COLUMN updated_at timestamptz not null default timezone('utc', now());
    END IF;

    -- Add unique constraint for dedupe_key if possible
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'dedupe_key') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_requests_dedupe_key_unique') THEN
        BEGIN
          ALTER TABLE report_requests ADD CONSTRAINT report_requests_dedupe_key_unique UNIQUE (dedupe_key);
        EXCEPTION WHEN unique_violation THEN NULL; END;
      END IF;
    END IF;
  END IF;
END
$$;

-- If an older `report_requests` has legacy non-nullable columns (e.g., audit_id), relax them so new inserts can succeed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'audit_id') THEN
    -- If audit_id is NOT NULL, make it nullable
    IF (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'audit_id') = 'NO' THEN
      EXECUTE 'ALTER TABLE report_requests ALTER COLUMN audit_id DROP NOT NULL';
    END IF;
  END IF;
END
$$;

-- Make legacy `email` column nullable if present so new schema using `lead_id` is allowed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'email') THEN
    IF (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'email') = 'NO' THEN
      EXECUTE 'ALTER TABLE report_requests ALTER COLUMN email DROP NOT NULL';
    END IF;
  END IF;
END
$$;

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  report_request_id uuid null references report_requests(id) on delete set null,
  kind email_event_kind not null,
  status email_event_status not null default 'queued',
  provider text not null default 'resend',
  provider_message_id text null,
  recipient_email citext not null,
  subject text not null,
  template_key text not null,
  source lead_source not null,
  request_ip_hash text null,
  request_user_agent text null,
  request_referer text null,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint email_events_provider_message_id_unique unique (provider, provider_message_id)
);

-- Ensure `lead_id` exists on report_requests when migrating over an older schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_requests' AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE report_requests ADD COLUMN lead_id uuid NULL;
  END IF;
  -- Add foreign key constraint only if it doesn't exist and `leads` table exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'lead_id')
  AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_requests_lead_id_fkey') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
      ALTER TABLE report_requests
        ADD CONSTRAINT report_requests_lead_id_fkey
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

-- Create indexes only when the target column exists to avoid errors on older schemas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'normalized_email') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_normalized_email ON leads (normalized_email)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_seen_at') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_last_seen_at ON leads (last_seen_at desc)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'lead_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_report_requests_lead_id ON report_requests (lead_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'request_type') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_report_requests_request_type ON report_requests (request_type)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'status') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_report_requests_status ON report_requests (status)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'created_at') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_report_requests_created_at ON report_requests (created_at desc)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_requests' AND column_name = 'share_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_report_requests_share_id ON report_requests (share_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_events' AND column_name = 'lead_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_email_events_lead_id ON email_events (lead_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_events' AND column_name = 'report_request_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_email_events_report_request_id ON email_events (report_request_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_events' AND column_name = 'kind') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_email_events_kind ON email_events (kind)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_events' AND column_name = 'status') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events (status)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_events' AND column_name = 'created_at') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events (created_at desc)';
  END IF;
END
$$;

drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at
before update on leads
for each row execute function set_updated_at();

drop trigger if exists trg_report_requests_updated_at on report_requests;
create trigger trg_report_requests_updated_at
before update on report_requests
for each row execute function set_updated_at();

drop trigger if exists trg_email_events_updated_at on email_events;
create trigger trg_email_events_updated_at
before update on email_events
for each row execute function set_updated_at();
