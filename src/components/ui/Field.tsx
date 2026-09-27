import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/format.ts'
import { fieldClass } from './fieldClass.ts'

interface WrapperProps {
  id: string
  label?: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

function Wrapper({ id, label, error, hint, children, className }: WrapperProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-2.5 block text-h6 text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-small text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-small text-body">{hint}</p>
      )}
    </div>
  )
}

interface CommonProps {
  label?: string
  error?: string
  hint?: string
  wrapperClassName?: string
}

export function Input({
  label,
  error,
  hint,
  wrapperClassName,
  className,
  id,
  ...rest
}: CommonProps & InputHTMLAttributes<HTMLInputElement>) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <input
        id={fieldId}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cx(fieldClass, 'h-[50px]', error && 'border-danger', className)}
      />
    </Wrapper>
  )
}

export function Textarea({
  label,
  error,
  hint,
  wrapperClassName,
  className,
  id,
  ...rest
}: CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        id={fieldId}
        rows={5}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cx(fieldClass, 'py-3', error && 'border-danger', className)}
      />
    </Wrapper>
  )
}

export function Select({
  label,
  error,
  hint,
  wrapperClassName,
  className,
  id,
  children,
  ...rest
}: CommonProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <select
        id={fieldId}
        {...rest}
        aria-invalid={error ? true : undefined}
        className={cx(fieldClass, 'h-[50px] cursor-pointer pr-9 text-body', error && 'border-danger', className)}
      >
        {children}
      </select>
    </Wrapper>
  )
}
