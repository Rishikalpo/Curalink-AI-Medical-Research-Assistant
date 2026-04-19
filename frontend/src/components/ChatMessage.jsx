// ChatMessage.jsx — FINAL PREMIUM VERSION

export default function ChatMessage({ entry }) {
  const time = entry.timestamp
    ? new Date(entry.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="flex items-start gap-3 justify-end animate-slide-up">

      {/* Message */}
      <div className="max-w-lg">

        <div className="
          relative
          bg-slate-900/60 backdrop-blur-xl
          border border-cyan-500/20
          rounded-2xl rounded-tr-sm
          px-4 py-3
          shadow-soft
          hover:shadow-glow
          transition-all duration-200
        ">

          {/* subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">

            {/* Disease */}
            {entry.disease && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest">
                  condition
                </span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  {entry.disease}
                </span>
              </div>
            )}

            {/* Query */}
            <p className="text-sm text-slate-200 leading-relaxed">
              {entry.query}
            </p>

          </div>
        </div>

        {/* Timestamp */}
        <div className="text-right mt-1 text-[10px] font-mono text-slate-600">
          {time}
        </div>
      </div>

      {/* Avatar */}
      <div className="
        flex-shrink-0 w-8 h-8 rounded-full
        bg-gradient-to-br from-cyan-500 to-teal-500
        flex items-center justify-center
        text-xs font-semibold text-slate-950
        shadow-glow
      ">
        U
      </div>
    </div>
  )
}