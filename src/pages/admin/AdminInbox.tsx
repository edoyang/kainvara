import { ErrorState, Spinner } from '../../components/ui/States.tsx'
import { useToast } from '../../context/toast.ts'
import { clearQueryCache, useQuery } from '../../hooks/useQuery.ts'
import { api, errorMessage } from '../../lib/api.ts'
import { cx, formatDate, plural } from '../../lib/format.ts'
import type { ContactMessage, Subscriber } from '../../types.ts'

export function AdminMessages() {
  const { notify } = useToast()
  const { data, error, reload } = useQuery('/admin/messages', (signal) =>
    api<ContactMessage[]>('/admin/messages', { signal }),
  )

  async function setRead(message: ContactMessage, read: boolean) {
    try {
      await api(`/admin/messages/${message.id}`, { method: 'PUT', body: { read } })
      clearQueryCache('/admin')
      reload()
    } catch (err) {
      notify(errorMessage(err), 'error')
    }
  }

  if (error && !data) return <ErrorState message={error} onRetry={reload} />
  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }
  if (data.length === 0) return <p className="text-p">No messages yet. They arrive from the contact page.</p>

  return (
    <ul className="flex flex-col gap-4">
      {data.map((message) => (
        <li
          key={message.id}
          className={cx('rounded-[5px] border p-5', message.read ? 'border-gray-2' : 'border-primary bg-primary-faded/20')}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-h5 text-ink">{message.subject || 'No subject'}</p>
              <p className="text-small">
                {message.name} /{' '}
                <a href={`mailto:${message.email}`} className="text-primary hover:text-primary-hover">
                  {message.email}
                </a>{' '}
                / {formatDate(message.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRead(message, !message.read)}
              className="text-h6 text-primary hover:text-primary-hover"
            >
              Mark as {message.read ? 'unread' : 'read'}
            </button>
          </div>
          <p className="mt-3 text-p whitespace-pre-line">{message.message}</p>
        </li>
      ))}
    </ul>
  )
}

export function AdminSubscribers() {
  const { data, error, reload } = useQuery('/admin/subscribers', (signal) =>
    api<Subscriber[]>('/admin/subscribers', { signal }),
  )

  if (error && !data) return <ErrorState message={error} onRetry={reload} />
  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }
  if (data.length === 0) return <p className="text-p">No subscribers yet. They sign up from the footer.</p>

  return (
    <div className="flex flex-col gap-4">
      <p className="text-h6 text-body">{plural(data.length, 'subscriber')}</p>
      <ul className="divide-y divide-gray-2 rounded-[5px] border border-gray-2">
        {data.map((subscriber) => (
          <li key={subscriber.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <a href={`mailto:${subscriber.email}`} className="text-h6 text-ink hover:text-primary">
              {subscriber.email}
            </a>
            <time dateTime={subscriber.createdAt} className="text-small">
              {formatDate(subscriber.createdAt)}
            </time>
          </li>
        ))}
      </ul>
    </div>
  )
}
