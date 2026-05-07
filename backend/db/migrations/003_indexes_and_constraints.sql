-- 003_indexes_and_constraints.sql
-- Create indexes to support typical queries and JSONB GIN indexes

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
