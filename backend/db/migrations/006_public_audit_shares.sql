-- 006_public_audit_shares.sql
-- Stores sanitized, public-facing audit snapshots for share URLs.

create table if not exists public_audit_shares (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  title text not null,
  description text not null,
  og_image_url text not null,
  report_payload jsonb not null,
  published_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint public_audit_shares_share_id_format check (share_id ~ '^[A-Za-z0-9_-]{8,64}$')
);

create index if not exists idx_public_audit_shares_published_at
  on public_audit_shares (published_at desc);

create index if not exists idx_public_audit_shares_expires_at
  on public_audit_shares (expires_at);

create index if not exists idx_public_audit_shares_payload_gin
  on public_audit_shares using gin (report_payload);

drop trigger if exists trg_public_audit_shares_updated_at on public_audit_shares;
create trigger trg_public_audit_shares_updated_at
before update on public_audit_shares
for each row execute function set_updated_at();
