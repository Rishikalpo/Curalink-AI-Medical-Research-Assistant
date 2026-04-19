// OverviewCard.jsx — FINAL PREMIUM VERSION

export default function OverviewCard({ insights, meta }) {
  const overview = insights?.overview || ''
  const paragraphs = overview.split('\n').filter(Boolean)

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center text-sm">
          🧬
        </div>

        <span className="text-sm font-display font-semibold text-slate-200">
          Research Overview
        </span>

        <div className="flex-1 h-px bg-slate-800" />

        {meta && (
          <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span>{meta.totalPublicationsFetched ?? '—'} papers</span>
            <span className="text-slate-700">·</span>
            <span>
              {meta.processingTimeMs
                ? `${(meta.processingTimeMs / 1000).toFixed(1)}s`
                : '—'}
            </span>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="
        relative
        bg-slate-900/60 backdrop-blur-xl
        border border-slate-800
        rounded-2xl p-6
        shadow-soft hover:shadow-glow
        transition-all duration-300
        overflow-hidden
      ">

        {/* Glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* Tags */}
        {meta && (
          <div className="flex flex-wrap gap-2 mb-4 relative z-10">

            {meta.disease && (
              <span className="
                text-xs font-mono px-2.5 py-1 rounded-full
                bg-cyan-500/10 border border-cyan-500/20 text-cyan-400
              ">
                {meta.disease}
              </span>
            )}

            {meta.query && (
              <span className="
                text-xs font-mono px-2.5 py-1 rounded-full
                bg-slate-800 border border-slate-700 text-slate-300
              ">
                {meta.query}
              </span>
            )}

            {meta.diseaseInferredFromHistory && (
              <span className="
                text-xs font-mono px-2.5 py-1 rounded-full
                bg-violet-500/10 border border-violet-500/20 text-violet-400
              ">
                ↩ context
              </span>
            )}
          </div>
        )}

        {/* Overview */}
        <div className="space-y-4 relative z-10">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p
                key={i}
                className={`leading-relaxed ${
                  i === 0
                    ? 'text-base font-medium text-slate-100'
                    : 'text-sm text-slate-400'
                }`}
              >
                {para}
              </p>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">
              No overview generated.
            </p>
          )}
        </div>

        {/* Clinical Implications */}
        {insights?.clinical_implications && (
          <div className="mt-6 pt-5 border-t border-slate-800/70 relative z-10">
            <p className="text-xs font-mono text-teal-400 uppercase tracking-widest mb-2">
              Clinical Implications
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {insights.clinical_implications}
            </p>
          </div>
        )}

        {/* Gaps */}
        {insights?.gaps_and_limitations && (
          <div className="
            mt-4
            bg-amber-500/5
            border border-amber-500/20
            rounded-xl p-4
            relative z-10
          ">
            <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1.5">
              ⚠ Gaps & Limitations
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              {insights.gaps_and_limitations}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}