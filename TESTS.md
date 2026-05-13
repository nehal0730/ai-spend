# Testing

## Automated tests

| Filename | What it covers | How to run it |
|---|---|---|
| [backend/src/tests/auditEngine/auditEngine.spec.ts](backend/src/tests/auditEngine/auditEngine.spec.ts) | Core audit engine behavior: wasted seats, consolidation, annualization sanity, empty tool validation, free-plan handling, and savings caps | `cd backend && npm run test:run -- src/tests/auditEngine/auditEngine.spec.ts` |
| [backend/src/tests/api/auditApi.spec.ts](backend/src/tests/api/auditApi.spec.ts) | Happy-path `/audit/analyze` request and report response shape | `cd backend && npm run test:run -- src/tests/api/auditApi.spec.ts` |

## Audit engine test cases

The audit engine suite currently covers these scenarios:

1. Detects wasted seats and estimates seat-based savings.
2. Generates at least one recommendation for a realistic startup input.
3. Produces finite annualized savings from monthly savings.
4. Throws when the tool list is empty.
5. Caps unrealistic savings so total savings cannot exceed monthly spend.
6. Handles a zero-spend free plan without crashing.

## What the tests are for

These tests protect the deterministic part of the product. The audit engine is the core value, so the tests focus on calculations, validation, and guardrails instead of UI or logging plumbing.

## How to run everything

```bash
cd backend
npm run test
```

Single run:

```bash
cd backend
npm run test:run
```

Coverage:

```bash
cd backend
npm run coverage
```

## Notes

- There are no automated frontend tests yet.
- Database and email flows are covered by manual smoke checks.
- If a pricing assumption changes, update the fixtures before changing the assertions.
