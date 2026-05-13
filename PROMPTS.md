# AI Prompts & Summary Strategy

How we use (and avoid) AI in the product, with exact prompts, fallbacks, and lessons learned.

## Philosophy

**Where we use AI**: Narrative text (business summary), tone of voice, communication.
**Where we don't**: Math, calculations, financial recommendations.

Why? Financial advice must be auditable. Generative AI hallucines numbers confidently. We use AI for tone ("write like a consultant") and avoid it for substance ("calculate savings").

## AI summary endpoint

Route: `POST /audit/summary`

Input: Full audit report (JSON)
Output: `{ summary: string, fallback: boolean }`

### Gemini prompt (production)

```
You are a strategic AI infrastructure consultant advising startup founders. 
Your job is to provide a concise, founder-friendly audit summary that sounds 
like expert advice—not a technical report.

AUDIT CONTEXT:
- Monthly AI spend: $[spend]
- Estimated potential savings: $[savings] ([savings_percent]%)
- Tools in stack: [tool_count]
- Largest expense: [top_tool_name] at $[top_tool_spend] ([top_tool_percent]%)
- Team size: [team_size] | Active seats: [seat_count] ([utilization_percent]% utilization)
- Top recommendations: [recommendations_list]

WRITE A SINGLE PARAGRAPH (80–120 words) that:
1. Acknowledges their current spend and largest tool
2. Highlights ONE key optimization opportunity (consolidation, utilization gap, or plan downgrade)
3. Quantifies the potential impact
4. Suggests a strategic next step

TONE: Direct, conversational, knowledgeable. Sound like you're speaking to a founder over coffee, 
not writing a report.

CRITICAL RULES:
- NO percentages with >1 decimal place (write "45%" or "45.5%", never "45.87%")
- NO currency with >2 decimals (write "$2,500.50", never "$2,500.4782")
- NO technical jargon: avoid "rules", "evaluations", "confidence", "telemetry"
- NO sentences longer than 20 words
- NO bullet points—write as prose
- Sound human, not machine-generated

OUTPUT: Only the summary paragraph, nothing else.
```

### Context preparation

Before sending to Gemini, we extract and normalize key metrics:

```typescript
const context = {
  spend: Math.round(report.summary.currentSpend * 100) / 100,
  savings: Math.round(report.totalEstimatedSavings * 100) / 100,
  savingsPercent: Math.round((savings / spend) * 100), // Whole number
  topTool: { 
    name: report.summary.topExpensiveTool.name,
    spend: Math.round(report.summary.topExpensiveTool.spend * 100) / 100,
    percent: Math.round(report.summary.topExpensiveTool.percentage * 10) / 10 // 1 decimal
  },
  toolCount: report.summary.toolCount,
  teamSize: report.input.teamSize,
  seatCount: report.input.seatCount,
  utilizationPercent: Math.round((seatCount / teamSize) * 10) / 10, // 1 decimal
  recommendationCount: report.recommendations.length,
  topRecommendations: report.recommendations.slice(0, 2).map(r => r.description)
}
```

This forces consistent precision: no invented decimals, only values that appear in the report.

### Validation: Prevent hallucination

After Gemini returns text, we validate it only uses numbers from the context:

```typescript
const validateNumbersStrict = (text, context) => {
  const numbersInOutput = text.match(/\d+(?:[.,]\d+)?/g) || []
  const approvedNumbers = buildApprovedSet(context) // All context values + variants
  
  for (const num of numbersInOutput) {
    const normalized = num.replace(/,/g, '').replace(/\./g, '')
    const found = approvedNumbers.has(normalized)
    if (!found && isLargeInventedNumber(num)) {
      return { ok: false, offending: num }
    }
  }
  return { ok: true }
}
```

If validation fails (e.g., Gemini writes "$3.2M" but context has $320k), we:
1. Log the hallucination
2. Retry with explicit strict instruction: "Do not invent any numbers"
3. If that fails, use fallback

### Fallback template (deterministic)

If Gemini is not configured, returns invalid numbers, or times out, we fall back to a business-friendly template:

```typescript
function fallbackTemplate(context) {
  let insight = `You're spending $${context.spend.toLocaleString()} monthly on ${context.toolCount} AI tools`
  
  if (context.topTool) {
    insight += `, with ${context.topTool.name} as your largest expense at $${context.topTool.spend.toLocaleString()} (${Math.round(context.topTool.percent)}%).`
  } else {
    insight += `.`
  }
  
  const hasUtilizationIssue = 
    (context.teamSize - context.seatCount) > 1 && 
    context.utilizationPercent < 75
  
  if (hasUtilizationIssue) {
    insight += ` You have ${context.seatCount} active seats for a team of ${context.teamSize}—that's ${context.utilizationPercent}% utilization. Right-sizing your seat count could unlock significant savings. `
  }
  
  if (context.savingsPercent > 0) {
    insight += `Applying recommended optimizations could save approximately $${context.savings.toLocaleString()} (${context.savingsPercent}% reduction).`
  } else {
    insight += `Consider consolidating underutilized tools and optimizing your plan tiers for better cost efficiency.`
  }
  
  return insight
}
```

Example fallback:
> You're spending $5,000 monthly on 5 AI tools, with OpenAI as your largest expense at $2,000 (40%). You have 25 active seats for a team of 20—that's 125% utilization. Applying recommended optimizations could save approximately $1,200 (24% reduction).

### Error handling

```typescript
export async function generateAiSummary(report) {
  const context = prepareReportContext(report)
  const key = cache.makeKey(report)
  
  // Check cache first
  const cached = cache.getFromCache(key)
  if (cached) return cached
  
  // If no Gemini config, use fallback
  if (!GEMINI_URL || !GEMINI_KEY) {
    return { summary: fallbackTemplate(context), fallback: true }
  }
  
  try {
    // Call Gemini API with timeout
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: consultantPrompt }] }] }),
      signal: AbortSignal.timeout(30000) // 30 sec timeout
    })
    
    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status}`)
      return { summary: fallbackTemplate(context), fallback: true }
    }
    
    const data = await response.json()
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!candidate || typeof candidate !== 'string') {
      console.warn('No valid candidate text')
      return { summary: fallbackTemplate(context), fallback: true }
    }
    
    // Validate numbers in output
    const validation = validateNumbersStrict(candidate)
    if (!validation.ok) {
      console.warn(`Output contains unapproved number: ${validation.offending}`)
      // Retry with strict instruction
      // ... (strict retry logic)
      // If that fails too, fall back
      return { summary: fallbackTemplate(context), fallback: true }
    }
    
    // Success
    cache.setCache(key, { summary: candidate, fallback: false })
    return { summary: candidate, fallback: false }
    
  } catch (err) {
    console.error(`Gemini request failed: ${err.message}`)
    return { summary: fallbackTemplate(context), fallback: true }
  }
}
```

### Caching

- **Key**: SHA-256(JSON.stringify(report))
- **TTL**: 1 hour (in-memory, not distributed)
- **Why**: Same report shouldn't call Gemini twice within an hour. Saves API costs and latency.

## Lessons learned from experimentation

### Failed approaches

1. **"Generate detailed savings strategy"** – Gemini hallucinated investment options, equity strategies, and bonkers business ideas. Too open-ended.

2. **"Explain each recommendation in plain English"** – Output was verbose (300+ words) and repetitive. Users want quick insight, not a book.

3. **"Detect if this team should hire more AI engineers"** – Out of scope. Germane is about spend, not hiring. Removing this kept the prompt focused.

4. **Allowing Gemini to invent numbers for "comparison"** – e.g., "Similar companies spend $X" (where X was hallucinated). Scary and inaccurate. Now: numbers come from context only.

### What worked

1. **Constraint to 80-120 words** – Forces conciseness. Founder can read it in 10 seconds.

2. **One key insight, not three** – "Here's the main thing to fix." Simpler mental model.

3. **Explicit number validation** – Checking output against context prevents hallucinations from shipping to users.

4. **Fallback as a feature, not a bug** – If Gemini breaks, users get deterministic text. No errors, no blank summaries.

5. **"Sound human" in the prompt** – Asking Gemini to avoid jargon, use conversational tone, and keep sentences short works.

## Why we don't use AI for calculations

Three reasons:

1. **Explainability** – Customer should understand why we recommend $50k savings. If it came from Gemini, we can't explain it.

2. **Auditability** – Auditors ask "where did this number come from?" Rules are versioned, testable, transparent. AI is not.

3. **Consistency** – Same input should always produce same recommendation. Generative models are stochastic; we'd get different answers.

For narrative (tone, words, explanation) AI is fine. For substance (math, recommendations) it's not.

## Extending the prompt

To modify the summary behavior:

1. Edit the `consultantPrompt` string in `src/lib/ai/gemini.ts`
2. Add constraints (word count, tone, structure)
3. Update `validateNumbersStrict` if you introduce new number formats
4. Test against a few real audit reports
5. Check the fallback still makes sense

Example: If you want the summary to always mention "next step," add to prompt:
```
4. Suggest a specific next step (e.g., "Book a call to discuss vendor negotiation")
```

## Monitoring & improvement

We track (in logs):
- Gemini API latency
- Fallback rate (how often we use deterministic text vs. Gemini)
- Number validation failures (hallucinations caught)
- Cache hit rate

If fallback rate > 10%, Gemini config is broken or API is down—alert.
If cache hit rate < 70%, consider higher TTL.

## Cost & quotas

**Gemini API**:
- $1.50 per 1M input tokens
- ~500 tokens per summary
- At 1000 summaries/month: ~$0.75/month

Negligible cost. Not worth caching aggressively, but we do anyway (better UX).

## Future

Possible improvements (not MVP):
1. **A/B test summaries** – Compare Gemini vs. fallback for user engagement
2. **Multi-language support** – Translate via Gemini (easy)
3. **Tone customization** – Let founders pick "technical," "executive," "founder"
4. **Structured output** – Return JSON { title, keyInsight, nextStep } instead of prose

For now: simple, deterministic fallback with optional Gemini. Ship it.

---

**Key takeaway**: AI for communication, deterministic logic for advice.
