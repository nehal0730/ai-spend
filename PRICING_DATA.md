# Pricing Data

The audit engine uses normalized seat-price equivalents so very different vendor plans can be compared on one axis. The numbers below are the modeled values used in the engine, tied back to the current official pricing pages I checked on 2026-05-13.

## Cursor

- Pro: $20/user/month — https://cursor.com/pricing — verified 2026-05-13
- Teams: $40/user/month — https://cursor.com/pricing — verified 2026-05-13

## Claude

- Pro: $20/user/month billed monthly, $17/user/month billed annually — https://claude.com/pricing/pro — verified 2026-05-13
- Team standard seat: $25/user/month billed monthly, $20/user/month billed annually — https://claude.com/pricing/team — verified 2026-05-13
- Team premium seat: $125/user/month billed monthly, $100/user/month billed annually — https://claude.com/pricing/team — verified 2026-05-13

## GitHub Copilot

- Pro: $10/user/month — https://github.com/features/copilot — verified 2026-05-13
- Pro+: $39/user/month — https://github.com/features/copilot — verified 2026-05-13

## Windsurf

- Pro: $20/user/month — https://windsurf.com/pricing — verified 2026-05-13
- Teams: $40/user/month — https://windsurf.com/pricing — verified 2026-05-13
- Enterprise: custom pricing — https://windsurf.com/pricing — verified 2026-05-13

## OpenAI / ChatGPT

- Plus: from $20/user/month — https://chatgpt.com/pricing — verified 2026-05-13
- Business: per-user monthly pricing with annual billing options — https://chatgpt.com/pricing — verified 2026-05-13
- Enterprise: custom pricing — https://chatgpt.com/pricing — verified 2026-05-13

## Gemini

- Paid API tiers: pricing varies by model and usage — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-08
- 2.5 Flash input: $0.30 / 1M tokens — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-08
- 2.5 Flash output: $2.50 / 1M tokens — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-08

## Notes

- The engine still collapses these into fixed monthly equivalents so the audit stays deterministic.
- The values are conservative modeling inputs, not vendor contract quotes.
- If a vendor changes pricing, update the engine and this file together.
