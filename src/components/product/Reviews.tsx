import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/auth.ts'
import { useToast } from '../../context/toast.ts'
import { useQuery } from '../../hooks/useQuery.ts'
import { api, ApiError, errorMessage } from '../../lib/api.ts'
import { formatDate, plural } from '../../lib/format.ts'
import type { Product, Review } from '../../types.ts'
import { Button } from '../ui/Button.tsx'
import { Input, Textarea } from '../ui/Field.tsx'
import { Stars, StarInput } from '../ui/Stars.tsx'
import { ErrorState, Spinner } from '../ui/States.tsx'

interface ReviewsProps {
  product: Product
  // Called after a review is saved so the page can refresh rating and count.
  onChange: () => void
}

export function Reviews({ product, onChange }: ReviewsProps) {
  const { user } = useAuth()
  const { notify } = useToast()
  const location = useLocation()
  const path = `/products/${product.slug}/reviews`
  const { data, error, reload } = useQuery(path, (signal) => api<Review[]>(path, { signal }))

  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setFields({})
    try {
      await api(path, { method: 'POST', body: { rating, title, comment } })
      setTitle('')
      setComment('')
      notify('Thank you, your review is live')
      reload()
      onChange()
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields)
      else notify(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-[30px] lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-h2 text-ink">{product.rating.toFixed(1)}</p>
          <div className="flex flex-col gap-1">
            <Stars rating={product.rating} />
            <p className="text-h6 text-body">Based on {plural(product.reviewCount, 'review')}</p>
          </div>
        </div>

        {error && !data ? (
          <ErrorState message={error} onRetry={reload} className="py-8" />
        ) : !data ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <p className="text-p">No reviews yet. Be the first to share what you think.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-2">
            {data.map((review) => (
              <li key={review.id} className="flex flex-col gap-2 py-5 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={review.rating} size={16} />
                  <time dateTime={review.createdAt} className="text-small">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                {review.title && <h4 className="text-h5">{review.title}</h4>}
                <p className="text-p">{review.comment}</p>
                <p className="text-h6 text-ink">{review.userName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-fit rounded-[9px] bg-gray-1 p-[25px]">
        <h3 className="text-h3">Write a review</h3>
        {user ? (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-5" noValidate>
            <div>
              <p className="mb-1 text-h6 text-ink">Your rating</p>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <Input
              label="Title (optional)"
              value={title}
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              error={fields.title}
              className="bg-white"
            />
            <Textarea
              label="Your review"
              value={comment}
              maxLength={1000}
              required
              onChange={(event) => setComment(event.target.value)}
              error={fields.comment}
              className="bg-white"
            />
            <Button type="submit" size="sm" loading={busy} className="self-start">
              Post review
            </Button>
            <p className="text-small">Posting again replaces your earlier review of this product.</p>
          </form>
        ) : (
          <p className="mt-4 text-p">
            <Link
              to={`/login?next=${encodeURIComponent(location.pathname)}`}
              className="font-bold text-primary hover:text-primary-hover"
            >
              Sign in
            </Link>{' '}
            to share your thoughts on this product.
          </p>
        )}
      </div>
    </div>
  )
}
