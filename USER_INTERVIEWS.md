# User Interviews

## Interview 1

### Participant profile

- Name or initials: P.K.
- Role: Product Manager
- Company stage: Growth-stage casual mobile gaming company (PlaySimple)

### Quotes

1. "Our highest-performing flows drop users into gameplay first, then introduce account setup later."
2. "Any early friction in onboarding shows up immediately as a retention drop."
3. "If users do not experience value in the first minute, we lose them."
4. "Users engage more deeply after experiencing immediate value."

### Most surprising thing they said

The most surprising point was how strongly sequencing mattered: in their best flows, they intentionally delayed account creation and progression prompts until after the core experience had already delivered value. That challenged my assumption that early sign-in improves intent quality.

### What it changed about the design

- removed mandatory sign-in before running an audit
- let users generate a report first, then prompted for email capture or sharing
- moved account-related friction to post-value moments
- reinforced the product principle: immediate value before commitment

## Interview 2

### Participant profile

- Name or initials: J.L.
- Role: Software Engineer
- Company stage: Early-stage B2B SaaS startup, 8 employees

### Quotes

1. "We store derived report data as compact serialized payloads instead of normalizing everything into separate tables."
2. "The reason is not better database design. It is iteration speed and simpler read paths for user-facing reports."
3. "Recalculating recommendations on every page load kills performance and flexibility."
4. "Storing a stable snapshot of the audit means we can change how we display it without touching the database schema."

### Most surprising thing they said

The most surprising point was that J.L. prioritized operational simplicity over normalization. Their team intentionally denormalized audit results into stored snapshots because recalculating dynamically on every page load was slower and more fragile than storing optimized data once.

### What it changed about the design

- moved from dynamic recommendation recalculation to storing stable audit snapshots
- serialized complete audit results with metadata instead of normalizing into separate tables
- optimized report data for fast retrieval and public sharing
- decoupled the display layer from recalculation logic, allowing UI changes without schema migrations

## Interview 3

### Participant profile

- Name or initials: S.N.
- Role: Engineering Manager
- Company stage: Seed-stage startup, about 18 employees

### Quotes

1. "Every team inside the company uses AI differently, so standardization becomes political quickly."
2. "We optimize AWS costs obsessively, but nobody owns AI spend yet."
3. "Half our AI spend is not even company-managed. People expense tools independently."
4. "The hard part is not identifying expensive tools. It is figuring out whether removing them hurts output."

### Most surprising thing they said

The biggest surprise was ownership fragmentation. S.N. was less worried about pricing complexity and more worried that nobody had clear responsibility for evaluating AI tooling across teams.

### What it changed about the design

- added shareable report views so ops, engineering, and leadership can review the same findings
- pushed explainable recommendations over black-box scores
- highlighted "Top Opportunity" and "Why this matters" sections for decision speed
- designed outputs for alignment discussions, not just budget tracking