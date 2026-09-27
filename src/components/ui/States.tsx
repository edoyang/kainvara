import type { ReactNode } from 'react'
import { BsExclamationTriangle } from 'react-icons/bs'
import { cx } from '../../lib/format.ts'
import { Button } from './Button.tsx'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(
        'inline-block size-8 animate-spin rounded-full border-[3px] border-primary border-r-transparent',
        className,
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-[5px] bg-gray-2', className)} aria-hidden />
}

interface MessageProps {
  title: string
  message?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function EmptyState({ title, message, action, icon, className }: MessageProps) {
  return (
    <div className={cx('flex flex-col items-center gap-4 px-6 py-16 text-center', className)}>
      {icon && <div className="text-5xl text-primary">{icon}</div>}
      <h2 className="text-h3">{title}</h2>
      {message && <p className="max-w-md text-p">{message}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      className={className}
      icon={<BsExclamationTriangle className="text-alert" />}
      title="That did not load"
      message={message}
      action={
        onRetry && (
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  )
}
