import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { BsCheckCircleFill, BsExclamationCircleFill, BsInfoCircleFill, BsX } from 'react-icons/bs'
import { cx } from '../lib/format.ts'
import { ToastContext, type ToastTone } from './toast.ts'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

const TONES: Record<ToastTone, { bar: string; icon: ReactNode }> = {
  success: { bar: 'border-l-success', icon: <BsCheckCircleFill className="text-success" /> },
  error: { bar: 'border-l-danger', icon: <BsExclamationCircleFill className="text-danger" /> },
  info: { bar: 'border-l-primary', icon: <BsInfoCircleFill className="text-primary" /> },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-3), { id, message, tone }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              'pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-[5px] border border-l-4 border-line bg-white py-3 pr-2 pl-4 shadow-accent',
              TONES[toast.tone].bar,
            )}
          >
            <span className="mt-0.5 text-base">{TONES[toast.tone].icon}</span>
            <p className="flex-1 text-h6 font-medium text-ink">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-xl text-muted hover:text-ink"
              aria-label="Dismiss notification"
            >
              <BsX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
