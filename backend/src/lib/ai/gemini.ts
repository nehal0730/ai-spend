import { AuditReport } from '../audit-engine/types'
import cache from './cache'

const GEMINI_URL = process.env.GEMINI_API_URL || ''
const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

type SummaryResult = { summary: string; fallback: boolean }

// Preprocess report data for founder-friendly presentation
interface PreparedContext {
  spend: number
  savings: number
  savingsPercent: number
  topTool: { name: string; spend: number; percent: number } | null
  toolCount: number
  teamSize: number
  seatCount: number
  utilizationPercent: number
  recommendationCount: number
  topRecommendations: string[]
}

function prepareReportContext(report: any): PreparedContext {
  const tools = report.input?.tools ?? []
  const spend = report.summary?.currentSpend ?? report.input?.monthlySpend ?? 0
  const savings = report.summary?.totalEstimatedSavings ?? 0
  
  // Round currency to 2 decimals
  const roundCurrency = (val: number) => Math.round(val * 100) / 100
  
  // Find top tool
  const topTool = tools.length > 0 
    ? tools.reduce((max: any, t: any) => 
        (Number(t.monthlySpend || 0) > Number(max.monthlySpend || 0) ? t : max))
    : null
  
  const topToolSpend = topTool ? Number(topTool.monthlySpend || 0) : 0
  const topToolPercent = spend > 0 ? Math.round((topToolSpend / spend) * 10) / 10 : 0 // 1 decimal for %
  
  // Utilization metrics
  const teamSize = report.input?.teamSize ?? 1
  const seatCount = report.input?.seatCount ?? 1
  const utilizationPercent = teamSize > 0 ? Math.round((seatCount / teamSize) * 10) / 10 : 0 // 1 decimal for %
  
  // Extract top recommendations (skip technical jargon)
  const recommendations = (report.recommendations ?? [])
    .slice(0, 2)
    .map((r: any) => r.description || r.title || '')
    .filter((desc: string) => desc && !desc.includes('rule'))
  
  return {
    spend: roundCurrency(spend),
    savings: roundCurrency(savings),
    savingsPercent: spend > 0 ? Math.round((savings / spend) * 100) : 0, // Whole number for %
    topTool: topTool ? {
      name: topTool.toolName || topTool.provider || 'Top tool',
      spend: roundCurrency(topToolSpend),
      percent: topToolPercent
    } : null,
    toolCount: tools.length,
    teamSize,
    seatCount,
    utilizationPercent,
    recommendationCount: recommendations.length,
    topRecommendations: recommendations
  }
}

function fallbackTemplate(context: PreparedContext): string {
  // Founder-friendly, business-oriented fallback
  if (!context.topTool) {
    return `Your audit identified ${context.toolCount} AI tools in use. With a current spend of $${context.spend.toLocaleString()}, there's opportunity to optimize allocation and reduce costs. Review your tool stack for consolidation opportunities and unused seats to maximize ROI on AI infrastructure investment.`
  }
  
  const utilizationGap = context.teamSize - context.seatCount
  const hasUtilizationIssue = utilizationGap > 1 && context.utilizationPercent < 75
  
  let insight = `You're spending $${context.spend.toLocaleString()} monthly on ${context.toolCount} AI tools, with ${context.topTool.name} as your largest expense at $${context.topTool.spend.toLocaleString()} (${Math.round(context.topTool.percent)}%). `
  
  if (hasUtilizationIssue) {
    insight += `You have ${context.seatCount} active seats for a team of ${context.teamSize} — that's ${context.utilizationPercent}% utilization. Right-sizing your seat count could unlock significant savings. `
  }
  
  if (context.savingsPercent > 0) {
    insight += `Applying recommended optimizations could save approximately $${context.savings.toLocaleString()} (${context.savingsPercent}% reduction).`
  } else {
    insight += `Consider consolidating underutilized tools and optimizing your plan tiers for better cost efficiency.`
  }
  
  return insight
}

export async function generateAiSummary(report: AuditReport | any): Promise<SummaryResult> {
  // Prepare context with proper formatting
  const context = prepareReportContext(report)
  
  // Use a cache key derived from the report payload
  const key = cache.makeKey(report)
  const cached = cache.getFromCache(key)
  if (cached) {
    return cached
  }

  // Premium prompt: Write like a SaaS optimization consultant
  const consultantPrompt = `You are a strategic AI infrastructure consultant advising startup founders. Your job is to provide a concise, founder-friendly audit summary that sounds like expert advice—not a technical report.

AUDIT CONTEXT:
- Monthly AI spend: $${context.spend.toLocaleString()}
- Estimated potential savings: $${context.savings.toLocaleString()} (${context.savingsPercent}%)
- Tools in stack: ${context.toolCount}
${context.topTool ? `- Largest expense: ${context.topTool.name} at $${context.topTool.spend.toLocaleString()} (${Math.round(context.topTool.percent)}%)` : ''}
- Team size: ${context.teamSize} | Active seats: ${context.seatCount} (${context.utilizationPercent}% utilization)
- Top recommendations: ${context.topRecommendations.length > 0 ? context.topRecommendations.join('; ') : 'Consolidate underutilized tools'}

WRITE A SINGLE PARAGRAPH (80–120 words) that:
1. Acknowledges their current spend and largest tool
2. Highlights ONE key optimization opportunity (consolidation, utilization gap, or plan downgrade)
3. Quantifies the potential impact
4. Suggests a strategic next step

TONE: Direct, conversational, knowledgeable. Sound like you're speaking to a founder over coffee, not writing a report.

CRITICAL RULES:
- NO percentages with >1 decimal place (write "45%" or "45.5%", never "45.87%")
- NO currency with >2 decimals (write "$2,500.50", never "$2,500.4782")
- NO technical jargon: avoid "rules", "evaluations", "confidence", "telemetry"
- NO sentences longer than 20 words
- NO bullet points—write as prose
- Sound human, not machine-generated

OUTPUT: Only the summary paragraph, nothing else.`

  const validateNumbersStrict = (text: string): { ok: boolean; offending?: string } => {
    // Build approved numbers from context
    const approved = new Set<string>()
    
    const addApproved = (val: number) => {
      approved.add(String(Math.round(val)))
      approved.add(String(Math.round(val * 10) / 10))
      approved.add(String(Math.round(val * 100) / 100))
      // With commas
      approved.add(String(Math.round(val)).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
    }
    
    addApproved(context.spend)
    addApproved(context.savings)
    addApproved(context.savingsPercent)
    addApproved(context.utilizationPercent)
    addApproved(context.toolCount)
    addApproved(context.teamSize)
    addApproved(context.seatCount)
    
    if (context.topTool) {
      addApproved(context.topTool.spend)
      addApproved(context.topTool.percent)
    }
    
    // Scan output for suspicious numbers
    const numbersInOutput = text.match(/\d+(?:[.,]\d+)?/g) || []
    const normalizeToken = (t: string) => t.replace(/,/g, '').replace(/\./g, '')
    
    for (const num of numbersInOutput) {
      const normalized = normalizeToken(num)
      const found = Array.from(approved).some(a => normalizeToken(String(a)) === normalized)
      if (!found) {
        // Reject if it's a large invented number
        const parsed = parseFloat(num)
        if (!isNaN(parsed) && parsed > 1000 && approved.size > 0) {
          return { ok: false, offending: num }
        }
      }
    }
    
    return { ok: true }
  }

  // If Gemini config is not provided, immediately fall back
  if (!GEMINI_URL || !GEMINI_KEY) {
    console.log('[AI Summary] Missing Gemini config, using fallback')
    const fb = fallbackTemplate(context)
    return { summary: fb, fallback: true }
  }
  console.log('[AI Summary] Gemini config present, attempting API call')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    // Add API key to URL as query parameter
    const urlWithKey = `${GEMINI_URL}?key=${GEMINI_KEY}`
    const resp = await fetch(urlWithKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        contents: [
          {
            parts: [{ text: consultantPrompt }]
          }
        ]
      }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!resp.ok) {
      const text = await resp.text()
      console.error('[AI Summary] Gemini API non-OK', resp.status, text.slice(0, 200))
      const fb = fallbackTemplate(context)
      return { summary: fb, fallback: true }
    }

    const data = await resp.json()
    console.log('[AI Summary] Gemini API response received')

    // Extract text from Google Generative AI API response format
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    
    if (!candidate || typeof candidate !== 'string') {
      console.warn('[AI Summary] No valid candidate text extracted, using fallback')
      const fb = fallbackTemplate(context)
      return { summary: fb, fallback: true }
    }

    // Validate numbers in output
    const validation = validateNumbersStrict(candidate)
    if (!validation.ok) {
      console.warn('[AI Summary] Output contains number not in context, retrying strict rewrite:', validation.offending)
      
      const strictPrompt = consultantPrompt + '\n\nREWRITE INSTRUCTION: Do not invent any numbers. Use ONLY these values: ' + 
        Array.from(new Set([
          context.spend, context.savings, context.savingsPercent,
          context.topTool?.spend, context.topTool?.percent,
          context.teamSize, context.seatCount, context.utilizationPercent,
          context.toolCount
        ])).filter(v => v !== undefined).join(', ')
      
      const strictResp = await fetch(urlWithKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: strictPrompt }] }]
        }),
        signal: controller.signal
      })

      if (strictResp.ok) {
        const strictData = await strictResp.json()
        const strictCandidate = strictData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        if (strictCandidate && validateNumbersStrict(strictCandidate).ok) {
          console.log('[AI Summary] Strict rewrite passed validation')
          cache.setCache(key, { summary: strictCandidate, fallback: false })
          return { summary: strictCandidate, fallback: false }
        }
      }

      console.warn('[AI Summary] Strict rewrite failed, using fallback')
      const fb = fallbackTemplate(context)
      return { summary: fb, fallback: true }
    }

    // Success
    console.log('[AI Summary] Success! Returning Gemini summary')
    cache.setCache(key, { summary: candidate, fallback: false })
    return { summary: candidate, fallback: false }
  } catch (err: any) {
    console.error('[AI Summary] Gemini request failed:', err?.message ?? err)
    const fb = fallbackTemplate(context)
    return { summary: fb, fallback: true }
  }
}

export default { generateAiSummary }
