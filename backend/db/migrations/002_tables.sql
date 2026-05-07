-- 002_tables.sql
-- Create normalized tables

create table if not exists tool_catalog (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null unique,
  tool_label text not null,
  tool_category text null,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists audit_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  title text not null,
  description text null,
  status session_status not null default 'draft',
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists audit_session_tool_selections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references audit_sessions(id) on delete cascade,
  tool_id uuid not null references tool_catalog(id) on delete restrict,
  selection_order integer not null,
  is_enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint audit_session_tool_selections_unique_session_tool unique (session_id, tool_id),
  constraint audit_session_tool_selections_order_positive check (selection_order > 0)
);

create table if not exists audit_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references audit_sessions(id) on delete cascade,
  session_tool_selection_id uuid not null references audit_session_tool_selections(id) on delete cascade,
  result_key text not null,
  result_value jsonb not null,
  severity text null,
  confidence numeric(5,2) null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint audit_results_confidence_range check (confidence is null or (confidence >= 0 and confidence <= 100))
);

create table if not exists ai_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references audit_sessions(id) on delete cascade,
  summary_type text not null default 'session',
  model_name text null,
  prompt_version text null,
  content text not null,
  summary_data jsonb null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint ai_summaries_unique_session_type unique (session_id, summary_type)
);

create table if not exists lead_capture_emails (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  source text not null default 'public_report',
  report_id uuid null,
  consented_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint lead_capture_emails_email_format check (position('@' in email) > 1),
  constraint lead_capture_emails_unique_email_source unique (email, source)
);

create table if not exists public_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references audit_sessions(id) on delete cascade,
  visibility report_visibility not null default 'private',
  slug text not null,
  share_token_hash text not null,
  title text not null,
  summary text null,
  published_at timestamptz null,
  expires_at timestamptz null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint public_reports_slug_unique unique (slug),
  constraint public_reports_share_token_hash_unique unique (share_token_hash)
);

alter table lead_capture_emails
  add constraint lead_capture_emails_report_id_fkey
  foreign key (report_id) references public_reports(id) on delete set null;
