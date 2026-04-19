import axios from 'axios'

// ✅ Smart base URL
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 180000, // 3 min (LLM-safe)
  headers: { 'Content-Type': 'application/json' },
})

// ─────────────────────────────────────────
// 🔥 Global error handler
// ─────────────────────────────────────────
const handleError = (error) => {
  // Cancelled request (important for UX)
  if (axios.isCancel(error) || error.name === 'CanceledError') {
    return { success: false, canceled: true }
  }

  console.error('[API ERROR]', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  })

  return {
    success: false,
    error:
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      'Something went wrong',
  }
}

// ─────────────────────────────────────────
// Submit research query
// ─────────────────────────────────────────
export const submitQuery = async ({
  userId,
  disease,
  query,
  signal, // 🔥 support abort
}) => {
  try {
    const payload = {
      userId,
      query,
      ...(disease?.trim() && { disease: disease.trim() }),
    }

    const { data } = await api.post('/query', payload, { signal })
    return data

  } catch (err) {
    return handleError(err)
  }
}

// ─────────────────────────────────────────
// Fetch chat history
// ─────────────────────────────────────────
export const fetchHistory = async (userId, page = 1, limit = 20) => {
  try {
    const { data } = await api.get(`/history/${userId}`, {
      params: { page, limit },
    })
    return data
  } catch (err) {
    return handleError(err)
  }
}

// ─────────────────────────────────────────
// Clear history
// ─────────────────────────────────────────
export const clearHistory = async (userId) => {
  try {
    const { data } = await api.delete(`/history/${userId}`)
    return data
  } catch (err) {
    return handleError(err)
  }
}

export default api