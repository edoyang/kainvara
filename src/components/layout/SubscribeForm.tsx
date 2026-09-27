import { useId, useState, type FormEvent } from 'react'
import { useToast } from '../../context/toast.ts'
import { api, errorMessage } from '../../lib/api.ts'
import { cx } from '../../lib/format.ts'

interface SubscribeFormProps {
  tone?: 'light' | 'dark'
  hint?: string
  className?: string
}

// The kit's "custom-form-group-subscribe": field and button share one border.
export function SubscribeForm({ tone = 'light', hint, className }: SubscribeFormProps) {
  const { notify } = useToast()
  const id = useId()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/newsletter', { method: 'POST', body: { email } })
      setEmail('')
      notify('You are subscribed. Welcome to the list!')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={className} noValidate>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className="flex">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your Email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cx(
            'h-[58px] min-w-0 flex-1 rounded-l-[5px] border border-r-0 border-line bg-field px-5 text-[14px] leading-7 text-ink',
            'placeholder:text-body focus:border-primary focus:bg-white focus:outline-none',
            error && 'border-danger',
          )}
        />
        <button
          type="submit"
          disabled={busy}
          className="h-[58px] shrink-0 rounded-r-[5px] border border-line bg-primary px-[22px] text-[14px] leading-7 text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? 'Sending' : 'Subscribe'}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="pt-1 text-small leading-7 text-danger">
          {error}
        </p>
      ) : (
        hint && <p className={cx('pl-0.5 text-[12px] leading-7', tone === 'dark' ? 'text-white/80' : 'text-body')}>{hint}</p>
      )}
    </form>
  )
}
