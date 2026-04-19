// ResultPanel.jsx — FINAL PREMIUM VERSION

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

  // Merge sources
  const sources = insights?.sources?.length
    ? insights.sources
    : (topPublications || []).slice(0, 8).map((p, i) => ({
        index: i + 1,
        title: p.title,
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
        <div className="
          grid gap-6 lg:grid-cols-2
          items-start
        ">
          <InsightsList insights={insights} />
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