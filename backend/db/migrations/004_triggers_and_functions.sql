-- 004_triggers_and_functions.sql
-- Trigger helper function and triggers that maintain updated_at timestamps

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

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
