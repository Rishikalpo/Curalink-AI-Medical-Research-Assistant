// EmptyState.jsx — FINAL PREMIUM VERSION

const CAPABILITIES = [
  {
    icon: '⬡',
    label: '200+ publications',
    desc: 'PubMed + OpenAlex combined',
    color: 'text-cyan-400',
  },
  {
    icon: '◈',
    label: 'Hybrid ranking',
    desc: 'Semantic + keyword + recency',
    color: 'text-violet-400',
  },
  {
    icon: '⬡',
    label: 'Clinical trials',
    desc: 'ClinicalTrials.gov scoring',
    color: 'text-emerald-400',
  },
  {
    icon: '◉',
    label: 'AI synthesis',
    desc: 'Citation-backed insights',
    color: 'text-teal-400',
  },
]

export default function EmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center py-20 px-4 overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-10 w-[600px] h-[300px] bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Emblem */}
      <div className="relative mb-12">

        {/* animated rings */}
        <div className="absolute inset-0 -m-10 rounded-full border border-cyan-500/10 animate-pulse-slow" />
        <div className="absolute inset-0 -m-16 rounded-full border border-cyan-500/5" />

        <div className="
          relative w-24 h-24 rounded-2xl
          bg-gradient-to-br from-slate-800 to-slate-900
          border border-slate-700/60
          flex items-center justify-center
          shadow-[0_0_40px_rgba(34,211,238,0.1)]
        ">
          <span className="text-4xl">🧬</span>
        </div>
      </div>

      {/* Headline */}
      <h2 className="font-display font-semibold text-3xl text-white tracking-tight mb-3 text-center">
        Curalink AI
      </h2>

      <p className="text-sm text-slate-400 text-center max-w-md leading-relaxed mb-12">
        Ask any medical question and instantly synthesize evidence from
        publications, clinical trials, and AI-powered insights.
      </p>

      {/* Capability Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
        {CAPABILITIES.map((cap, i) => (
          <div
            key={i}
            className="
              group
              bg-slate-900/60 backdrop-blur-xl
              border border-slate-800
              rounded-xl p-4
              text-center
              transition-all duration-300
              hover:border-cyan-500/30
              hover:bg-slate-800/60
              hover:-translate-y-1
              shadow-soft hover:shadow-glow
              opacity-0 animate-slide-up
            "
            style={{ animationDelay: `${i * 80 + 200}ms` }}
          >
            <div className={`text-xl mb-2 ${cap.color} transition group-hover:scale-110`}>
              {cap.icon}
            </div>

            <p className={`text-xs font-display font-semibold ${cap.color} mb-1`}>
              {cap.label}
            </p>

            <p className="text-[11px] text-slate-500 leading-snug">
              {cap.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Hint */}
      <p className="mt-10 text-xs font-mono text-slate-600 animate-pulse-slow">
        ↑ Start by entering a research query
      </p>
    </div>
  )
}