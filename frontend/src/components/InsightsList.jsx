// InsightsList.jsx — FINAL PREMIUM VERSION

const EVIDENCE_CONFIG = {
  strong:      { label: 'Strong Evidence',      color: 'emerald',  dot: 'bg-emerald-400' },
  moderate:    { label: 'Moderate Evidence',    color: 'cyan',     dot: 'bg-cyan-400' },
  limited:     { label: 'Limited Evidence',     color: 'amber',    dot: 'bg-amber-400' },
  conflicting: { label: 'Conflicting Evidence', color: 'rose',     dot: 'bg-rose-400' },
}

const getEvidence = (level) => {
  if (!level) return EVIDENCE_CONFIG.moderate
  const key = level.toLowerCase().replace(/\s+/g, '')
  return EVIDENCE_CONFIG[key] || EVIDENCE_CONFIG.moderate
}

export default function InsightsList({ insights }) {
  const items = insights?.research_insights || []

  if (!items.length) return null

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-sm">
          📊
        </div>

        <span className="text-sm font-display font-semibold text-slate-200">
          Research Insights
        </span>

        <div className="flex-1 h-px bg-slate-800" />

        <span className="text-xs font-mono text-slate-500">
          {items.length} findings
        </span>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <InsightCard key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Card
// ─────────────────────────────────────────
function InsightCard({ item, index }) {
  const ev = getEvidence(item.evidence_level)

  return (
    <div
      className="
        relative group
        bg-slate-900/60 backdrop-blur-xl
        border border-slate-800
        rounded-xl p-4
        transition-all duration-300
        hover:border-cyan-500/30
        hover:-translate-y-1
        shadow-soft hover:shadow-glow
        opacity-0 animate-slide-up
      "
      style={{ animationDelay: `${100 + index * 80}ms` }}
    >

      {/* Left color bar (evidence strength) */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-${ev.color}-400/70`} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">

        {/* Evidence badge */}
        <span className={`
          flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-full
          bg-${ev.color}-500/10 border border-${ev.color}-500/20 text-${ev.color}-400
        `}>
          <span className={`w-1.5 h-1.5 rounded-full ${ev.dot}`} />
          {ev.label}
        </span>

        {/* Index */}
        <span className="text-xs font-mono text-slate-600">
          #{index + 1}
        </span>
      </div>

      {/* Finding */}
      <p className="text-sm text-slate-100 font-medium leading-relaxed mb-3">
        {item.finding || item.insight || 'No finding recorded'}
      </p>

      {/* Divider */}
      {(item.evidence || item.source) && (
        <div className="pt-3 border-t border-slate-800/70 space-y-2">

          {/* Evidence text */}
          {item.evidence && (
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500 font-mono">evidence → </span>
              {item.evidence}
            </p>
          )}

          {/* Source */}
          {item.source && (
            <p
              className="text-xs text-slate-500 font-mono truncate"
              title={item.source}
            >
              ↳ {item.source}
            </p>
          )}
        </div>
      )}

      {/* References */}
      {item.related_publications?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.related_publications.map((pub) => (
            <span
              key={pub}
              className="
                text-[10px] font-mono px-2 py-0.5 rounded
                bg-slate-800 text-slate-400
                border border-slate-700/50
              "
            >
              [{pub}]
            </span>
          ))}
        </div>
      )}
    </div>
  )
}