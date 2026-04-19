// App.jsx — ELITE PRODUCTION VERSION

import { useEffect, useRef } from 'react'
import { useResearch } from './hooks/useResearch'

import Header from './components/Header'
import ChatInput from './components/ChatInput'
import ChatMessage from './components/ChatMessage'
import ResultPanel from './components/ResultPanel'
import ErrorCard from './components/ErrorCard'
import Loader from './components/Loader'
import EmptyState from './components/EmptyState'

export default function App() {
  const {
    conversation,
    loading,
    error,
    lastDisease,
    search,
    clearConversation,
    userId,
  } = useResearch()

  const bottomRef = useRef(null)
  const firstRender = useRef(true)

  // ✅ Smart auto-scroll (no jump on first render)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [conversation.length, loading])

  const hasContent = conversation.length > 0 || loading

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Background glow */}
      <div className="fixed inset-0 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <Header
        onClear={clearConversation}
        hasResults={hasContent}
        userId={userId}
      />

      {/* Main */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-12">

        {/* Sticky Input */}
        <div className="
          sticky top-16 z-40 py-3
          backdrop-blur-xl bg-slate-950/80
          border-b border-slate-800/80
        ">
          <ChatInput
            onSubmit={search}
            loading={loading}
            lastDisease={lastDisease}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 animate-slide-up">
            <ErrorCard message={error} />
          </div>
        )}

        {/* Content */}
        <div className="mt-6 space-y-10">

          {/* Empty */}
          {!hasContent && <EmptyState />}

          {/* Conversation */}
          {conversation.map((entry) => (
            <ConversationEntry key={entry.id} entry={entry} />
          ))}

          {/* Loader */}
          {loading && (
            <div className="animate-slide-up">
              <Loader />
            </div>
          )}

          {/* Anchor */}
          <div ref={bottomRef} />
        </div>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────
// Conversation Entry
// ─────────────────────────────────────────
function ConversationEntry({ entry }) {
  if (entry.type === 'query') {
    return <ChatMessage entry={entry} />
  }

  if (entry.type === 'error') {
    return <ErrorCard message={entry.message} />
  }

  if (entry.type === 'result') {
    return (
      <div className="space-y-5 animate-fade-in">

        {/* AI Header */}
        <div className="flex items-center gap-2">

          <div className="
            w-7 h-7 rounded-full
            bg-gradient-to-br from-slate-700 to-slate-800
            border border-slate-600/50
            flex items-center justify-center text-xs
          ">
            🧬
          </div>

          <span className="text-xs font-mono text-slate-400">
            MedResearch AI
          </span>

          <div className="flex-1 h-px bg-slate-800" />

          <span className="text-xs font-mono text-slate-500">
            {entry.timestamp
              ? new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
        </div>

        {/* Results */}
        <ResultPanel entry={entry} />
      </div>
    )
  }

  return null
}