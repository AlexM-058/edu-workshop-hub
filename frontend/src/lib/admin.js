import { useEffect, useReducer } from 'react'
import { useAppAuth } from '../auth/AuthContext'
import { fetchAdminStats, fetchAdminUsers } from './api'

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
// useAdminUsers
// ---------------------------------------------------------------------------

/**
 * Fetches all platform users (paginated, optional role filter).
 *
 * @param {{ page?: number, perPage?: number, role?: string }} params
 * @returns {{ users, meta, isLoading, error }}
 */
export function useAdminUsers({ page = 1, perPage = 20, role } = {}) {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchAdminUsers({ token, page, perPage, role }))
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => { cancelled = true }
  }, [getToken, isSignedIn, page, perPage, role])

  return {
    users:     state.data?.data ?? null,
    meta:      state.data?.meta ?? null,
    isLoading: state.status === 'loading' || state.status === 'idle',
    error:     state.error,
  }
}

// ---------------------------------------------------------------------------
// useAdminStats
// ---------------------------------------------------------------------------

/**
 * Fetches platform-wide aggregated stats.
 *
 * @returns {{ stats, isLoading, error }}
 */
export function useAdminStats() {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchAdminStats({ token }))
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
