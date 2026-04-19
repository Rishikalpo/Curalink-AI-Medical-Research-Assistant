// Header.jsx — FINAL PREMIUM VERSION

export default function Header({ onClear, hasResults, userId }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* Glass layer */}
      <div className="
        backdrop-blur-xl bg-slate-950/80
        border-b border-slate-800/80
        relative
      ">

        {/* Glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Branding */}
          <div className="flex items-center gap-3">

            {/* Icon */}
            <div className="relative flex items-center justify-center w-8 h-8">
              <span className="absolute inset-0 rounded-full border border-cyan-500/30 animate-pulse-slow" />
              <span className="text-lg">🧬</span>
            </div>

            {/* Title */}
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-slate-100 tracking-tight text-sm">
                Cura<span className="text-cyan-400">link</span>
              </span>
              <span className="hidden sm:block text-[10px] font-mono text-slate-600">
                Clinical Intelligence Platform
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            {/* Live sources */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">

              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>

              PubMed · OpenAlex · Trials
            </div>

            {/* Session */}
            <div className="
              hidden sm:block
              text-xs font-mono text-slate-500
              bg-slate-900/60 backdrop-blur
              border border-slate-800
              px-2 py-1 rounded-lg
            ">
              {userId?.slice(-8)}
            </div>

            {/* Clear button */}
            {hasResults && (
              <button
                onClick={onClear}
                className="
                  text-xs font-mono
                  text-slate-500 hover:text-white
                  bg-slate-900/50 hover:bg-slate-800/60
                  border border-slate-800 hover:border-cyan-500/40
                  px-3 py-1.5 rounded-lg
                  transition-all duration-200
                "
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}