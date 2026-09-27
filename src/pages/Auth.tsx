import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Field.tsx'
import { PageLoader } from '../components/ui/States.tsx'
import { useAuth } from '../context/auth.ts'
import { useToast } from '../context/toast.ts'
import { ApiError, errorMessage } from '../lib/api.ts'
import { img, imgSet } from '../lib/format.ts'
import { media, pageTitle, site } from '../lib/site.ts'

// Only same-site paths are accepted, so a crafted link cannot send a visitor
// to another website after they sign in.
function safeNext(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account'
}

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { user, loading, login, register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const isLogin = mode === 'login'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  if (loading) return <PageLoader />
  if (user && !busy) return <Navigate to={next} replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setFields({})
    setFormError('')
    if (!isLogin && password !== confirm) {
      setFields({ confirm: 'The two passwords do not match' })
      return
    }
    setBusy(true)
    try {
      const signedIn = isLogin ? await login(email, password) : await register(name, email, password)
      notify(isLogin ? `Welcome back, ${signedIn.name}` : `Welcome to ${site.name}, ${signedIn.name}`)
      navigate(next, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields)
      else setFormError(errorMessage(err))
      setBusy(false)
    }
  }

  const switchTo = `${isLogin ? '/register' : '/login'}${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <section className="bg-gray-1">
      <title>{pageTitle(isLogin ? 'Sign in' : 'Create account')}</title>
      <div className="container-x py-12 lg:py-20">
        <div className="grid overflow-hidden rounded-[5px] bg-white shadow-accent lg:grid-cols-2">
          <div className="px-6 py-10 sm:px-12 lg:py-[60px]">
            <p className="text-h6 text-primary">{isLogin ? 'WELCOME BACK' : 'JOIN US'}</p>
            <h1 className="mt-2.5 text-h2">{isLogin ? 'Sign in' : 'Create account'}</h1>
            <p className="mt-2.5 text-p">
              {isLogin
                ? 'Sign in to check out faster, track orders and keep your wishlist.'
                : 'It takes less than a minute, and your cart comes with you.'}
            </p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
              {formError && (
                <p className="rounded-[5px] border border-danger bg-danger/5 p-3 text-h6 text-danger" role="alert">
                  {formError}
                </p>
              )}
              {!isLogin && (
                <Input
                  label="Name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  error={fields.name}
                />
              )}
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fields.email}
              />
              <Input
                label="Password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={fields.password}
                hint={isLogin ? undefined : 'At least 8 characters'}
              />
              {!isLogin && (
                <Input
                  label="Repeat password"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  error={fields.confirm}
                />
              )}
              <Button type="submit" loading={busy} block>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-h6 text-body">
              {isLogin ? `New to ${site.name}?` : 'Already have an account?'}{' '}
              <Link to={switchTo} className="text-primary hover:text-primary-hover">
                {isLogin ? 'Create an account' : 'Sign in'}
              </Link>
            </p>
          </div>

          <div className="relative hidden min-h-[560px] lg:block">
            <img
              src={img(media.authSide, 700, 900)}
              srcSet={imgSet(media.authSide, 700, 900)}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-dark/55" />
            <div className="absolute inset-x-12 bottom-12 text-white">
              <p className="text-h3 text-white">Members get more</p>
              <ul className="mt-4 flex flex-col gap-2 text-h6">
                <li>Faster checkout with a saved address</li>
                <li>Order history and live status</li>
                <li>A wishlist that follows you between devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
