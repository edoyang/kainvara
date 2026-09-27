import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../lib/api.ts'

interface State<T> {
  key: string | null
  data?: T
  error: string | null
}

// Last good response per key, shown straight away when a page is revisited
// while the fresh copy loads in the background.
const cache = new Map<string, unknown>()

export function clearQueryCache(prefix?: string) {
  for (const key of [...cache.keys()]) {
    if (!prefix || key.startsWith(prefix)) cache.delete(key)
  }
}

interface QueryOptions {
  // Keep showing the previous result while a new key loads (paging, filters).
  keepPrevious?: boolean
}

export function useQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: QueryOptions = {},
) {
  const [state, setState] = useState<State<T>>({ key: null, error: null })
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    if (key === null) return
    const controller = new AbortController()
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        cache.set(key, data)
        setState({ key, data, error: null })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => ({ key, data: previous.key === key ? previous.data : undefined, error: errorMessage(err) }))
      },
    )
    return () => controller.abort()
  }, [key, version])

  const reload = useCallback(() => setVersion((value) => value + 1), [])
  const current = state.key === key ? state : null
  const cached = key === null ? undefined : (cache.get(key) as T | undefined)

  const previous = options.keepPrevious && key !== null ? state.data : undefined

  return {
    data: current?.data ?? cached ?? previous,
    error: current?.error ?? null,
    loading: key !== null && current === null,
    reload,
  }
}
