// Loader.jsx — FINAL PREMIUM VERSION

const STAGES = [
  { label: 'Expanding query with medical synonyms', delay: 0 },
  { label: 'Fetching PubMed publications', delay: 800 },
  { label: 'Querying OpenAlex database', delay: 1800 },
  { label: 'Searching ClinicalTrials.gov', delay: 2800 },
  { label: 'Running hybrid semantic ranking', delay: 4000 },
  { label: 'Generating AI research synthesis', delay: 5500 },
]

export default function Loader() {
  return (
    <div className="
      relative
      bg-slate-900/60 backdrop-blur-xl
      border border-slate-800
      rounded-2xl p-6
      shadow-soft animate-slide-up
    ">

      {/* Glow */}
      <div className="absolute inset-0 bg-cyan-500/5 blur-2xl rounded-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">

        <div className="relative flex h-8 w-8 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400/20 animate-ping" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-400" />
        </div>

        <div>
          <p className="text-sm font-display font-semibold text-slate-200">
            Processing research query
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Synthesizing data across multiple sources
          </p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="space-y-3 relative z-10">
        {STAGES.map((stage, i) => (
          <PipelineStage key={i} stage={stage} index={i} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 animate-shimmer" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Stage
// ─────────────────────────────────────────
function PipelineStage({ stage, index }) {
  return (
    <div
      className="
        flex items-center gap-3
        opacity-0 animate-slide-up
      "
      style={{ animationDelay: `${stage.delay}ms` }}
    >

      {/* Indicator */}
      <div className="relative w-5 h-5 flex items-center justify-center">

        {/* pulse ring */}
        <span
          className="absolute w-full h-full rounded-full bg-cyan-400/10 animate-ping"
          style={{ animationDelay: `${stage.delay}ms` }}
        />

        {/* dot */}
        <span className="relative w-2 h-2 rounded-full bg-cyan-400" />
      </div>

      {/* Label */}
      <span className="text-xs text-slate-400 font-mono">
        {stage.label}
      </span>

      <div className="flex-1 h-px bg-slate-800/60" />

      {/* Status */}
      <span
        className="text-[10px] font-mono text-cyan-400 opacity-0"
        style={{
          animation: `fadeIn 0.4s ease-out ${stage.delay + 700}ms forwards`,
        }}
      >
        ✓
      </span>
    </div>
  )
}