import { useState, useCallback, useRef } from 'react'
import { submitQuery } from '../lib/api'

// ✅ persistent user ID
const getUserId = () => {
  const stored = localStorage.getItem('med_user_id')
  if (stored) return stored

  const id = 'user_' + Math.random().toString(36).slice(2, 9)
  localStorage.setItem('med_user_id', id)
  return id
}

const USER_ID = getUserId()

export const useResearch = () => {
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastDisease, setLastDisease] = useState('')

  const requestIdRef = useRef(0)
  const abortRef = useRef(null) // 🔥 cancel previous requests

  const addEntry = useCallback((entry) => {
    setConversation((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), ...entry }
    ])
  }, [])

  const search = useCallback(async (disease, query) => {
    if (!query.trim()) return

    setError(null)
    setLoading(true)

    const currentRequestId = ++requestIdRef.current

    // 🔥 cancel previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    const effectiveDisease = disease.trim() || lastDisease

    // Add user message
    addEntry({
      type: 'query',
      disease: effectiveDisease,
      query: query.trim(),
      timestamp: new Date().toISOString(),
    })

    try {
      const data = await submitQuery({
        userId: USER_ID,
        disease: effectiveDisease,
        query: query.trim(),
        signal: abortRef.current.signal, // 👈 pass to axios
      })

      // Ignore outdated responses
      if (currentRequestId !== requestIdRef.current) return

      if (!data.success) {
        const msg = data.error || 'Request failed'
        setError(msg)

        addEntry({
          type: 'error',
          query: query.trim(),
          message: msg,
          timestamp: new Date().toISOString(),
        })

        return
      }

      // Update disease context
      if (effectiveDisease) setLastDisease(effectiveDisease)
      if (data.meta?.disease) setLastDisease(data.meta.disease)

      // Add result
      addEntry({
        type: 'result',
        disease: data.meta?.disease || effectiveDisease,
        query: query.trim(),
        data,
        timestamp: new Date().toISOString(),
      })

    } catch (err) {
      // Ignore abort errors
      if (err.name === 'CanceledError' || err.name === 'AbortError') return

      const msg =
        err.response?.data?.error ||
        err.message ||
        'Network error'

      setError(msg)

      addEntry({
        type: 'error',
        query: query.trim(),
        message: msg,
        timestamp: new Date().toISOString(),
      })
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }

  }, [lastDisease, addEntry])

  const clearConversation = useCallback(() => {
    setConversation([])
    setLastDisease('')
    setError(null)
  }, [])

  return {
    conversation,
    loading,
    error,
    lastDisease,
    search,
    clearConversation,
    userId: USER_ID,
  }
}