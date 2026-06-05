import { useEffect, useReducer } from 'react'
import { useAppAuth } from '../auth/AuthContext'
import { fetchAttenderRegistrations, fetchAttenderStats } from './api'

// ---------------------------------------------------------------------------
// Generic fetch state machine (same pattern across all data hooks)
// ---------------------------------------------------------------------------

const initialState = { status: 'idle', data: null, error: null }

function fetchReducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { status: 'loading', data: null, error: null }
    case 'success':
      return { status: 'success', data: action.payload, error: null }
    case 'error':
      return { status: 'error', data: null, error: action.error }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// useAttenderRegistrations
// ---------------------------------------------------------------------------

/**
 * Fetches the authenticated professor's registrations.
 *
 * @param {{ page?: number, perPage?: number, status?: string }} params
 * @returns {{ registrations, meta, isLoading, error }}
 */
export function useAttenderRegistrations({ page = 1, perPage = 12, status } = {}) {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchAttenderRegistrations({ token, page, perPage, status }))
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => { cancelled = true }
  }, [getToken, isSignedIn, page, perPage, status])

  return {
    registrations: state.data?.data ?? null,
    meta:          state.data?.meta ?? null,
    isLoading:     state.status === 'loading' || state.status === 'idle',
    error:         state.error,
  }
}

// ---------------------------------------------------------------------------
// useAttenderStats
// ---------------------------------------------------------------------------

/**
 * Fetches aggregated stats for the authenticated professor.
 *
 * @returns {{ stats, isLoading, error }}
 */
export function useAttenderStats() {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchAttenderStats({ token }))
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => { cancelled = true }
  }, [getToken, isSignedIn])

  return {
    stats:     state.data ?? null,
    isLoading: state.status === 'loading' || state.status === 'idle',
    error:     state.error,
  }
}
