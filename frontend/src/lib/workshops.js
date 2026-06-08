import { useEffect, useReducer } from 'react'
import { fetchWorkshop, fetchWorkshops } from './api'

// ---------------------------------------------------------------------------
// Generic fetch state machine
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
// useWorkshops — paginated catalog list
// ---------------------------------------------------------------------------

/**
 * Fetches the paginated public workshop catalog.
 *
 * @param {{ page?: number, perPage?: number, search?: string }} params
 * @returns {{ workshops: Workshop[]|null, meta: PaginationMeta|null, isLoading: boolean, error: Error|null }}
 */
export function useWorkshops({ page = 1, perPage = 12, search = '' } = {}) {
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    fetchWorkshops({ page, perPage, search })
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => {
      cancelled = true
    }
  }, [page, perPage, search])

  return {
    workshops: state.data?.data ?? null,
    meta:      state.data?.meta ?? null,
    isLoading: state.status === 'loading' || state.status === 'idle',
    error:     state.error,
  }
}

// ---------------------------------------------------------------------------
// useWorkshop — single workshop detail
// ---------------------------------------------------------------------------

/**
 * Fetches a single workshop by ID.
 *
 * @param {number|string|null|undefined} id
 * @returns {{ workshop: Workshop|null, isLoading: boolean, error: Error|null }}
 */
export function useWorkshop(id) {
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    dispatch({ type: 'loading' })

    fetchWorkshop(id)
      .then((payload) => {
        if (!cancelled) dispatch({ type: 'success', payload })
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'error', error })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return {
    workshop:  state.data?.data ?? null,
    isLoading: state.status === 'loading' || state.status === 'idle',
    error:     state.error,
  }
}
