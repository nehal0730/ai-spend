# Metrics

## North Star

Qualified Optimization Actions per Week.

That means completed audits where the user either shares the report or requests follow-up, and the report contains at least one actionable recommendation. It is a better signal than traffic because it measures whether the audit created enough trust to move someone toward action.

## Input metrics

1. Audit completion rate.
2. Share-link creation rate.
3. Consultation or report-request rate.

These three inputs drive the North Star because they show whether people start, finish, and circulate the audit.

## What to instrument first

Instrument `audit_started`, `audit_completed`, `share_link_created`, `share_link_copied`, `report_email_requested`, `consultation_requested`, and `summary_rendered` first. If those events are clean, you can see where the funnel breaks without guessing.

## What number triggers a pivot

If the product has at least 500 completed audits and fewer than 5% turn into a qualified optimization action, that is a pivot signal. It means the audit is being consumed but not trusted enough to create downstream intent.

## Why this matters

This is a B2B lead-gen tool, not a consumer app. Weekly active users are the wrong lens. The real question is whether one audit produces enough confidence to be shared, discussed, or turned into a sales conversation.
