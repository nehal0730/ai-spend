-- 001_extensions_and_types.sql
-- Create required extensions and custom types

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
