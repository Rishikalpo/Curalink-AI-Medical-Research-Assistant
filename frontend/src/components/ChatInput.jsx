import { useState, useRef } from 'react'

const EXAMPLE_QUERIES = [
  { disease: "Parkinson's disease", query: "deep brain stimulation outcomes" },
  { disease: "Lung cancer", query: "immunotherapy response rates" },
  { disease: "Alzheimer's disease", query: "early biomarkers for detection" },
  { disease: "Type 2 diabetes", query: "GLP-1 receptor agonist latest trials" },
]

export default function ChatInput({ onSubmit, loading, lastDisease }) {
  const [disease, setDisease] = useState('')
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(null)
  const queryRef = useRef(null)

  const canSubmit = query.trim().length > 0 && !loading

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!canSubmit) return
    onSubmit(disease, query)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  const applyExample = (ex) => {
    setDisease(ex.disease)
    setQuery(ex.query)
    queryRef.current?.focus()
  }

  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/20 via-transparent to-cyan-500/10">

      {/* Glass container */}
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-slate-800 shadow-soft">

        {/* Context */}
        {lastDisease && !disease && (
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-cyan-400/80">context</span>
            <div className="h-px flex-1 bg-slate-800" />
            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
              {lastDisease}
            </span>
            <span className="text-slate-600">auto-applied</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <div className="flex gap-3">

            {/* Disease */}
            <div className="relative w-56">
              <label className="block text-xs font-mono text-slate-500 mb-1 uppercase tracking-wide">
                Disease
              </label>

              <div className={`rounded-xl border transition-all ${
                focused === 'disease'
                  ? 'border-cyan-400/60 shadow-glow'
                  : 'border-slate-700/60'
              }`}>
                <input
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  onFocus={() => setFocused('disease')}
                  onBlur={() => setFocused(null)}
                  placeholder={lastDisease || 'e.g. lung cancer'}
                  disabled={loading}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Query */}
            <div className="flex-1">
              <label className="block text-xs font-mono text-slate-500 mb-1 uppercase tracking-wide">
                Research Query
              </label>

              <div className={`rounded-xl border transition-all ${
                focused === 'query'
                  ? 'border-cyan-400/60 shadow-glow'
                  : 'border-slate-700/60'
              }`}>
                <input
                  ref={queryRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused('query')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. latest treatment options..."
                  disabled={loading}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none pr-24"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-600">
                  ⌘↵
                </span>
              </div>
            </div>

            {/* Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  h-[42px] px-5 rounded-xl font-medium text-sm transition-all
                  ${canSubmit
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-glow hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                `}
              >
                {loading ? <LoadingDots /> : 'Search'}
              </button>
            </div>

          </div>
        </form>

        {/* Examples */}
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((ex, i) => (
            <button
              key={i}
              onClick={() => applyExample(ex)}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-700/50 text-slate-500
                         hover:border-cyan-500/40 hover:text-white hover:bg-cyan-500/10
                         transition-all duration-150 font-mono"
            >
              {ex.disease} · {ex.query}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  )
}