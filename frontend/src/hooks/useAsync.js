import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Small async state helper used by pages to drive loading/error/empty UI.
 *
 * The wrapped function is kept in a ref, so inline callbacks do not restart
 * requests on every render.
 *
 * @template T
 * @param {(...args: any[]) => Promise<T>} asyncFn
 * @param {{ immediate?: boolean }} [options]
 */
export function useAsync(asyncFn, { immediate = false } = {}) {
  const [state, setState] = useState({
    status: immediate ? 'loading' : 'idle',
    data: /** @type {T | null} */ (null),
    error: /** @type {Error | null} */ (null),
  })

  const mountedRef = useRef(true)
  const requestRef = useRef(0)
  const asyncFnRef = useRef(asyncFn)

  useEffect(() => {
    asyncFnRef.current = asyncFn
  }, [asyncFn])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args) => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId

    setState((previous) => ({ ...previous, status: 'loading', error: null }))

    try {
      const data = await asyncFnRef.current(...args)

      if (mountedRef.current && requestRef.current === requestId) {
        setState({ status: 'success', data, error: null })
      }

      return data
    } catch (error) {
      if (mountedRef.current && requestRef.current === requestId) {
        setState({ status: 'error', data: null, error })
      }

      return null
    }
  }, [])

  const reset = useCallback(() => {
    requestRef.current += 1
    setState({ status: 'idle', data: null, error: null })
  }, [])

  useEffect(() => {
    if (!immediate) return undefined

    // Initial load runs directly here (rather than through execute) so the
    // effect itself does not set state synchronously. Deferred updates keep
    // React and the hooks linter happy while preserving the loading state.
    let active = true
    const requestId = requestRef.current + 1
    requestRef.current = requestId

    asyncFnRef
      .current()
      .then((data) => {
        if (!active || requestRef.current !== requestId) return
        setState({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (!active || requestRef.current !== requestId) return
        setState({ status: 'error', data: null, error })
      })

    return () => {
      active = false
    }
  }, [immediate])

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  }
}
