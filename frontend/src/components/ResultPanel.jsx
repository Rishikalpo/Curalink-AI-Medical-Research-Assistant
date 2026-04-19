// ResultPanel.jsx — FINAL FIXED VERSION (stable sources + premium UI)

import MetaBar from './MetaBar'
import OverviewCard from './OverviewCard'
import InsightsList from './InsightsList'
import TrialsList from './TrialsList'
import PublicationsList from './PublicationsList'
import SourcesList from './SourcesList'

export default function ResultPanel({ entry }) {
  const { data } = entry
  if (!data) return null

  const { meta, insights, topPublications, clinicalTrials } = data

  // ✅ ALWAYS use structured publications for reliable sources
  const sources = (topPublications || []).slice(0, 8).map((p, i) => ({
    index: i + 1,
    title: p.title || 'Untitled',
    year: p.year,
    source: p.source,
    url: p.url,
  }))

  return (
    <div className="relative space-y-6 animate-fade-in">

      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-cyan-500/5 blur-3xl pointer-events-none rounded-3xl" />

      <div className="relative z-10 space-y-6">

        {/* Meta */}
        <MetaBar meta={meta} />

        {/* Overview */}
        <OverviewCard insights={insights} meta={meta} />

        {/* Insights + Trials */}
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <InsightsList insights={inssetsSafe(insights)} />
          <TrialsList trials={clinicalTrials} />
        </div>

        {/* Publications */}
        <div className="pt-2 border-t border-slate-800/70">
          <PublicationsList publications={topPublications} />
        </div>

        {/* Sources */}
        <div className="pt-2 border-t border-slate-800/70">
          <SourcesList sources={sources} />
        </div>

      </div>
    </div>
  )
}

// 🔒 small safety helper (prevents UI crashes if LLM returns bad structure)
function inssetsSafe(insights) {
  return {
    ...insights,
    research_insights: Array.isArray(insights?.research_insights)
      ? insights.research_insights
      : [],
  }
}