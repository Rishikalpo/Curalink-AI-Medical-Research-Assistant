// TrialsList.jsx — FINAL PREMIUM VERSION

const STATUS_CONFIG = {
  RECRUITING:              { label: 'Recruiting',      color: 'emerald', pulse: true },
  NOT_YET_RECRUITING:      { label: 'Opening Soon',    color: 'cyan',    pulse: false },
  ENROLLING_BY_INVITATION: { label: 'By Invitation',   color: 'blue',    pulse: false },
  ACTIVE_NOT_RECRUITING:   { label: 'Active',          color: 'violet',  pulse: false },
  COMPLETED:               { label: 'Completed',       color: 'slate',   pulse: false },
  SUSPENDED:               { label: 'Suspended',       color: 'amber',   pulse: false },
  TERMINATED:              { label: 'Terminated',      color: 'rose',    pulse: false },
}

const getStatusConfig = (status) => {
  if (!status) return STATUS_CONFIG.COMPLETED
  const key = status.toUpperCase().replace(/[\s-]/g, '_')
  return STATUS_CONFIG[key] || STATUS_CONFIG.COMPLETED
}

export default function TrialsList({ trials }) {
  if (!trials?.length) return null

  const recruiting = trials.filter((t) =>
    ['RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION'].includes(
      (t.status || '').toUpperCase().replace(/\s/g, '_')
    )
  )

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-sm">
          🧪
        </div>

        <span className="text-sm font-display font-semibold text-slate-200">
          Clinical Trials
        </span>

        <div className="flex-1 h-px bg-slate-800" />

        <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
          {recruiting.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {recruiting.length}
            </span>
          )}
          <span>{trials.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {trials.map((trial, i) => (
          <TrialCard key={trial.nctId || i} trial={trial} index={i} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Card
// ─────────────────────────────────────────
function TrialCard({ trial, index }) {
  const sc = getStatusConfig(trial.status)
  const isRecruiting = trial.isActivelyRecruiting

  return (
    <div
      className={`
        relative
        bg-slate-900/60 backdrop-blur-xl
        border border-slate-800
        rounded-xl p-4
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-glow
        ${isRecruiting ? 'hover:border-emerald-500/40' : 'hover:border-cyan-500/30'}
        opacity-0 animate-slide-up
      `}
      style={{ animationDelay: `${80 + index * 70}ms` }}
    >

      {/* Recruiting highlight */}
      {isRecruiting && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent" />
      )}

      <div className="flex items-start gap-3">

        {/* Status */}
        <div className="flex-shrink-0 pt-0.5">
          <span className={`
            flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-full
            bg-${sc.color}-500/10 border border-${sc.color}-500/20 text-${sc.color}-400
          `}>
            <span className={`w-1.5 h-1.5 rounded-full bg-${sc.color}-400 ${sc.pulse ? 'animate-pulse' : ''}`} />
            {sc.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Title */}
          <h4 className="text-sm font-medium text-slate-100 leading-snug mb-2">
            {trial.title}
          </h4>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mb-2 text-xs font-mono text-slate-500">
            {trial.phases?.length > 0 && (
              <span>Phase {trial.phases.join('/')}</span>
            )}
            {trial.dates?.startDate && (
              <span>{trial.dates.startDate}</span>
            )}
            {trial.dates?.completionDate && (
              <span>→ {trial.dates.completionDate}</span>
            )}
          </div>

          {/* Summary */}
          {trial.summary && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">
              {trial.summary}
            </p>
          )}

          {/* Eligibility */}
          {trial.eligibility?.ageRange && (
            <p className="text-xs text-slate-500 font-mono">
              Ages {trial.eligibility.ageRange} · {trial.eligibility.sex || 'All'}
            </p>
          )}

          {/* AI relevance */}
          {trial.relevance && (
            <p className="mt-2 text-xs text-teal-400/80 italic">
              {trial.relevance}
            </p>
          )}
        </div>

        {/* Link */}
        {trial.url && (
          <a
            href={trial.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-shrink-0 w-8 h-8 rounded-lg
              bg-slate-800 border border-slate-700
              flex items-center justify-center
              hover:border-cyan-500/40 hover:bg-cyan-500/10
              transition
            "
          >
            ↗
          </a>
        )}
      </div>
    </div>
  )
}