import { useEffect, useReducer } from 'react'
import { useAppAuth } from '../auth/AuthContext'
import { fetchTeacherParticipants, fetchTeacherStats, fetchTeacherWorkshops } from './api'

// ---------------------------------------------------------------------------
// Generic fetch state machine (same pattern as workshops.js)
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
// useTeacherWorkshops
// ---------------------------------------------------------------------------

/**
 * Fetches the authenticated teacher's own workshops (paginated).
 *
 * @param {{ page?: number, perPage?: number }} params
 * @returns {{ workshops, meta, isLoading, error }}
 */
export function useTeacherWorkshops({ page = 1, perPage = 12 } = {}) {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchTeacherWorkshops({ token, page, perPage }))
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => { cancelled = true }
  }, [getToken, isSignedIn, page, perPage])

  return {
    workshops: state.data?.data ?? null,
    meta:      state.data?.meta ?? null,
    isLoading: state.status === 'loading' || state.status === 'idle',
    error:     state.error,
  }
}

// ---------------------------------------------------------------------------
// useTeacherStats
// ---------------------------------------------------------------------------

/**
 * Fetches aggregated stats for the authenticated teacher.
 *
 * @returns {{ stats, isLoading, error }}
 */
export function useTeacherStats() {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchTeacherStats({ token }))
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

// ---------------------------------------------------------------------------
// useTeacherParticipants
// ---------------------------------------------------------------------------

/**
 * Fetches participants for one teacher-owned workshop.
 *
 * @param {{ workshopId?: string|number, refreshKey?: number }} params
 * @returns {{ participants, isLoading, error }}
 */
export function useTeacherParticipants({ workshopId, refreshKey = 0 } = {}) {
  const { getToken, isSignedIn } = useAppAuth()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!isSignedIn || !workshopId) return
    let cancelled = false
    dispatch({ type: 'loading' })

    getToken()
      .then((token) => fetchTeacherParticipants({ token, workshopId }))
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => { cancelled = true }
  }, [getToken, isSignedIn, refreshKey, workshopId])

  return {
    participants: state.data?.data ?? null,
    isLoading:    state.status === 'loading' || state.status === 'idle',
    error:        state.error,
  }
}
