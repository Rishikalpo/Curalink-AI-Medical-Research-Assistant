// MetaBar.jsx — FINAL PREMIUM VERSION

export default function MetaBar({ meta }) {
  if (!meta) return null

  const stats = [
    { label: 'Papers', value: meta.totalPublicationsFetched ?? '—', icon: '◎' },
    { label: 'Top Ranked', value: meta.topPublicationsReturned ?? '—', icon: '▲' },
    { label: 'Trials', value: meta.totalTrialsFetched ?? '—', icon: '⬡' },
    {
      label: 'Time',
      value: meta.processingTimeMs
        ? `${(meta.processingTimeMs / 1000).toFixed(1)}s`
        : '—',
      icon: '⏱',
    },
    { label: 'Mode', value: meta.rankingMode ?? 'keyword', icon: '⬥' },
  ]

  return (
    <div className="
      relative
      bg-slate-900/60 backdrop-blur-xl
      border border-slate-800
      rounded-xl p-2
      flex gap-2
      shadow-soft animate-slide-up
    ">

      {/* Glow */}
      <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-xl pointer-events-none" />

      {stats.map((s, i) => (
        <div
          key={i}
          className="
            flex-1
            px-3 py-2
            rounded-lg
            bg-slate-900/50
            border border-slate-800/60
            text-center
            transition-all duration-200
            hover:border-cyan-500/30
            hover:bg-slate-800/60
            hover:-translate-y-[2px]
          "
        >

          {/* Icon */}
          <div className="text-[11px] font-mono text-cyan-400/70 mb-0.5">
            {s.icon}
          </div>

          {/* Value */}
          <div className="text-sm font-display font-semibold text-slate-100">
            {s.value}
          </div>

          {/* Label */}
          <div className="text-[10px] font-mono text-slate-500">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}