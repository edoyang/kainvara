import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/auth.ts'
import { useToast } from '../../context/toast.ts'
import { api, ApiError, errorMessage } from '../../lib/api.ts'
import { Button } from '../ui/Button.tsx'
import { Input, Textarea } from '../ui/Field.tsx'
import { SectionHeading } from '../ui/SectionHeading.tsx'

export function ContactForm() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setFields({})
    try {
      await api('/contact', { method: 'POST', body: { name, email, subject, message } })
      setSent(true)
      setSubject('')
      setMessage('')
      notify('Thanks, your message is on its way to us')
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields)
      else notify(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="bg-gray-1" id="message">
      <div className="container-x flex flex-col gap-12 py-20">
        <SectionHeading
          eyebrow="Write to us"
          eyebrowTone="primary"
          title="Send us a message"
          size="h2"
          text="Tell us what you need and we will get back to you as soon as we can."
        />
        <form
          onSubmit={submit}
          className="mx-auto grid w-full max-w-[692px] gap-5 rounded-[5px] bg-white p-[25px] shadow-light sm:grid-cols-2 sm:p-10"
          noValidate
        >
          {sent && (
            <p className="rounded-[5px] border border-success bg-success/10 p-3 text-h6 text-ink sm:col-span-2" role="status">
              Message received. We will be in touch soon.
            </p>
          )}
          <Input
            label="Name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={fields.name}
          />
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
            label="Subject (optional)"
            maxLength={120}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            error={fields.subject}
            wrapperClassName="sm:col-span-2"
          />
          <Textarea
            label="Message"
            required
            maxLength={2000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            error={fields.message}
            wrapperClassName="sm:col-span-2"
          />
          <Button type="submit" loading={busy} className="sm:col-span-2 sm:justify-self-start">
            Send Message
          </Button>
        </form>
      </div>
    </section>
  )
}
