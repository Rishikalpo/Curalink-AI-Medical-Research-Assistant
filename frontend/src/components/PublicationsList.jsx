// PublicationsList.jsx — FINAL PREMIUM VERSION

import { useState } from 'react'

const SOURCE_CONFIG = {
  pubmed:   { label: 'PubMed',    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  openalex: { label: 'OpenAlex', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
}

const getSourceConfig = (source) => {
  if (!source) return SOURCE_CONFIG.openalex
  const key = source.toLowerCase().replace(/\s+/g, '')
  return SOURCE_CONFIG[key] || {
    label: source,
    color: 'text-slate-400',
    bg: 'bg-slate-700/40',
    border: 'border-slate-600/30',
  }
}

export default function PublicationsList({ publications }) {
  const [expanded, setExpanded] = useState(null)

  if (!publications?.length) return null

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center text-sm">
          📚
        </div>

        <span className="text-sm font-display font-semibold text-slate-200">
          Top Publications
        </span>

        <div className="flex-1 h-px bg-slate-800" />

        <span className="text-xs font-mono text-slate-500">
          {publications.length} ranked
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {publications.map((pub, i) => (
          <PublicationRow
            key={pub.pmid || pub.doi || i}
            pub={pub}
            index={i}
            isExpanded={expanded === i}
            onToggle={() => setExpanded(expanded === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Row
// ─────────────────────────────────────────
function PublicationRow({ pub, index, isExpanded, onToggle }) {
  const sc = getSourceConfig(pub.source)
  const score = pub._debugScores?.final

  return (
    <div
      className="
        relative
        bg-slate-900/60 backdrop-blur-xl
        border border-slate-800
        rounded-xl
        transition-all duration-300
        hover:border-cyan-500/30
        hover:shadow-glow
        overflow-hidden
        opacity-0 animate-slide-up
      "
      style={{ animationDelay: `${60 + index * 60}ms` }}
    >

      {/* Rank bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400/70" />

      <button onClick={onToggle} className="w-full text-left p-4">

        <div className="flex items-start gap-3">

          {/* Rank */}
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-xs font-mono text-slate-400">
              #{index + 1}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Title */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-slate-100 leading-snug">
                {pub.title}
              </h4>
              <ChevronIcon isOpen={isExpanded} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap text-xs">

              <span className={`px-2 py-0.5 rounded-full ${sc.bg} ${sc.color} ${sc.border}`}>
                {sc.label}
              </span>

              {pub.year > 0 && (
                <span className="text-slate-500 font-mono">
                  {pub.year}
                </span>
              )}

              {pub.authors?.length > 0 && (
                <span className="text-slate-600 truncate max-w-[200px]">
                  {pub.authors.slice(0, 2).join(', ')}
                </span>
              )}

              {score !== undefined && (
                <span className="ml-auto text-slate-500 font-mono">
                  {score.toFixed(2)}
                </span>
              )}
            </div>

            {/* Tags */}
            {pub.ranking_explanation?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pub.ranking_explanation.map((tag, j) => (
                  <span
                    key={j}
                    className="
                      text-[10px] font-mono px-2 py-0.5 rounded-full
                      bg-cyan-500/10 border border-cyan-500/20 text-cyan-400
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Expanded */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-800">

          {/* Abstract */}
          {pub.abstract && (
            <div className="mt-3">
              <p className="text-xs font-mono text-slate-500 uppercase mb-1.5">
                Abstract
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {pub.abstract}
              </p>
            </div>
          )}

          {/* Score bars */}
          {pub._debugScores && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {Object.entries(pub._debugScores)
                .filter(([k]) => k !== 'final')
                .map(([key, val]) => (
                  <div key={key}>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                      {key}
                    </div>
                    <ScoreBar value={val} />
                  </div>
                ))}
            </div>
          )}

          {/* Link */}
          {pub.url && (
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-xs text-cyan-400 hover:text-cyan-300 font-mono"
            >
              View full paper →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Score bar
// ─────────────────────────────────────────
function ScoreBar({ value }) {
  return (
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  )
}

// ─────────────────────────────────────────
// Chevron
// ─────────────────────────────────────────
function ChevronIcon({ isOpen }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-600 transition-transform ${
        isOpen ? 'rotate-180' : ''
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}