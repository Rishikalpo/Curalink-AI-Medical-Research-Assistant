// SourcesList.jsx — FINAL FIXED (robust + premium UI)

export default function SourcesList({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) return null

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-600/20 to-slate-500/20 border border-slate-600/20 flex items-center justify-center text-sm">
          🔗
        </div>

        <span className="text-sm font-display font-semibold text-slate-200">
          Sources
        </span>

        <div className="flex-1 h-px bg-slate-800" />

        <span className="text-xs font-mono text-slate-500">
          {sources.length} references
        </span>
      </div>

      {/* Container */}
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-soft">

        {/* Glow */}
        <div className="absolute inset-0 bg-slate-500/5 blur-xl rounded-xl pointer-events-none" />

        <ol className="space-y-3 relative z-10">
          {sources.map((src, i) => {
            const title = src?.title || "Untitled research article"
            const year = src?.year
            const source = src?.source
            const url = typeof src?.url === "string" ? src.url : null

            return (
              <li
                key={i}
                className="flex items-start gap-3 group opacity-0 animate-slide-up"
                style={{ animationDelay: `${60 + i * 50}ms` }}
              >

                {/* Index */}
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 flex items-center justify-center mt-0.5 group-hover:border-cyan-500/30 transition">
                  <span className="text-[10px] font-mono text-slate-400">
                    {src?.index || i + 1}
                  </span>
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">

                  {/* Title + Link */}
                  <div className="flex items-start gap-2">

                    <p className="text-sm text-slate-200 leading-snug group-hover:text-white transition-colors">
                      {title}
                    </p>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-xs font-mono text-cyan-500/60 hover:text-cyan-400 transition opacity-70 hover:opacity-100"
                        title="Open source"
                      >
                        ↗
                      </a>
                    )}
                  </div>

                  {/* Meta */}
                  {(year || source) && (
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500">
                      {year && <span>{year}</span>}

                      {year && source && (
                        <span className="text-slate-700">·</span>
                      )}

                      {source && (
                        <span className="text-slate-400">{source}</span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}