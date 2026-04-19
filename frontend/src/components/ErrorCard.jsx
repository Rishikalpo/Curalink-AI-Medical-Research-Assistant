// ErrorCard.jsx — FINAL PREMIUM VERSION

export default function ErrorCard({ message }) {
  return (
    <div className="relative animate-slide-up">

      {/* Glow background */}
      <div className="absolute inset-0 bg-rose-500/5 blur-xl rounded-xl pointer-events-none" />

      {/* Card */}
      <div className="
        relative
        bg-slate-900/70 backdrop-blur-xl
        border border-rose-500/20
        rounded-xl p-4
        shadow-soft hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]
        transition-all duration-300
      ">
        <div className="flex items-start gap-3">

          {/* Icon */}
          <div className="
            flex-shrink-0 w-7 h-7 rounded-full
            bg-gradient-to-br from-rose-500/20 to-rose-600/10
            border border-rose-500/30
            flex items-center justify-center
            text-xs text-rose-400 font-bold
          ">
            ✕
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* Title */}
            <p className="text-sm font-semibold text-rose-400 mb-1">
              Request Failed
            </p>

            {/* Message */}
            <p className="text-xs text-slate-400 font-mono leading-relaxed break-words">
              {message}
            </p>

            {/* Hint */}
            <p className="text-xs text-slate-500 mt-2">
              Check if backend is running at{' '}
              <span className="font-mono text-slate-400">
                localhost:5000
              </span>{' '}
              and Ollama is active.
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}