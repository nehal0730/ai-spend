begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  create type session_status as enum ('draft', 'running', 'completed', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type report_visibility as enum ('private', 'public_unlisted');
exception
  when duplicate_object then null;
end $$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

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

create index if not exists idx_audit_sessions_user_id on audit_sessions (user_id);
create index if not exists idx_audit_sessions_status on audit_sessions (status);
create index if not exists idx_audit_sessions_created_at on audit_sessions (created_at desc);

create index if not exists idx_tool_catalog_tool_key on tool_catalog (tool_key);
create index if not exists idx_tool_catalog_category on tool_catalog (tool_category);
create index if not exists idx_tool_catalog_is_active on tool_catalog (is_active);

create index if not exists idx_audit_session_tool_selections_session_id on audit_session_tool_selections (session_id);
create index if not exists idx_audit_session_tool_selections_tool_id on audit_session_tool_selections (tool_id);
create index if not exists idx_audit_session_tool_selections_enabled on audit_session_tool_selections (session_id, is_enabled);

create index if not exists idx_audit_results_session_id on audit_results (session_id);
create index if not exists idx_audit_results_session_tool_selection_id on audit_results (session_tool_selection_id);
create index if not exists idx_audit_results_result_key on audit_results (result_key);
create index if not exists idx_audit_results_created_at on audit_results (created_at desc);
create index if not exists idx_audit_results_payload_gin on audit_results using gin (result_value);

create index if not exists idx_ai_summaries_session_id on ai_summaries (session_id);
create index if not exists idx_ai_summaries_type on ai_summaries (summary_type);

create index if not exists idx_lead_capture_emails_email on lead_capture_emails (email);
create index if not exists idx_lead_capture_emails_report_id on lead_capture_emails (report_id);
create index if not exists idx_lead_capture_emails_created_at on lead_capture_emails (created_at desc);

create index if not exists idx_public_reports_session_id on public_reports (session_id);
create index if not exists idx_public_reports_visibility on public_reports (visibility);
create index if not exists idx_public_reports_published_at on public_reports (published_at desc);
create index if not exists idx_public_reports_expires_at on public_reports (expires_at);

drop trigger if exists trg_audit_sessions_updated_at on audit_sessions;
create trigger trg_audit_sessions_updated_at
before update on audit_sessions
for each row execute function set_updated_at();

drop trigger if exists trg_tool_catalog_updated_at on tool_catalog;
create trigger trg_tool_catalog_updated_at
before update on tool_catalog
for each row execute function set_updated_at();

drop trigger if exists trg_audit_session_tool_selections_updated_at on audit_session_tool_selections;
create trigger trg_audit_session_tool_selections_updated_at
before update on audit_session_tool_selections
for each row execute function set_updated_at();

drop trigger if exists trg_audit_results_updated_at on audit_results;
create trigger trg_audit_results_updated_at
before update on audit_results
for each row execute function set_updated_at();

drop trigger if exists trg_ai_summaries_updated_at on ai_summaries;
create trigger trg_ai_summaries_updated_at
before update on ai_summaries
for each row execute function set_updated_at();

drop trigger if exists trg_lead_capture_emails_updated_at on lead_capture_emails;
create trigger trg_lead_capture_emails_updated_at
before update on lead_capture_emails
for each row execute function set_updated_at();

drop trigger if exists trg_public_reports_updated_at on public_reports;
create trigger trg_public_reports_updated_at
before update on public_reports
for each row execute function set_updated_at();

commit;
