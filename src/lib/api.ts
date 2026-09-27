export class ApiError extends Error {
  status: number
  fields: Record<string, string>

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

type Query = Record<string, string | number | boolean | null | undefined>

export function withQuery(path: string, query: Query): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      params.set(key, String(value))
    }
  }
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

// Every call goes to the same origin, so the session cookie is sent
// automatically and no token is ever handled in page scripts.
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal: options.signal,
      credentials: 'same-origin',
      headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
      // Writes always carry a JSON body, the API rejects anything else.
      body: method === 'GET' ? undefined : JSON.stringify(options.body ?? {}),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'Could not reach the store. Check your connection and try again.')
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const data = (payload ?? {}) as { error?: string; fields?: Record<string, string> }
    throw new ApiError(response.status, data.error ?? 'Something went wrong. Please try again.', data.fields)
  }
  return payload as T
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}
