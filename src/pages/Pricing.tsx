import { useState } from 'react'
import { BsCheck, BsChevronRight } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { InnerTitle } from '../components/inner/InnerTitle.tsx'
import { TrialCta } from '../components/inner/Sections.tsx'
import { PromiseRow } from '../components/layout/StorePromises.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { SectionHeading } from '../components/ui/SectionHeading.tsx'
import { cx } from '../lib/format.ts'
import { pageTitle } from '../lib/site.ts'

const YEARLY_DISCOUNT = 0.25

const FEATURES = [
  'Free standard delivery',
  'Early access to new drops',
  'Members only prices',
  'Free express delivery',
  'Personal stylist by email and chat',
]

const PLANS = [
  { name: 'FREE', price: 0, included: 2, featured: false, summary: 'Everything you need to start shopping' },
  { name: 'STANDARD', price: 9.99, included: 3, featured: true, summary: 'For regulars who order most months' },
  { name: 'PREMIUM', price: 19.99, included: 5, featured: false, summary: 'For wardrobes that never stand still' },
]

const FAQS = [
  {
    question: 'Can I cancel my membership at any time?',
    answer:
      'Yes. You can cancel from your account whenever you like and you keep your benefits until the end of the period you have paid for.',
  },
  {
    question: 'Do I need a membership to shop?',
    answer:
      'No. Anyone can order from the store. A membership simply adds perks such as free delivery and early access to sales.',
  },
  {
    question: 'How does the yearly discount work?',
    answer:
      'Yearly plans are billed once for twelve months and cost 25% less than paying month by month over the same time.',
  },
  {
    question: 'Which payment methods do you accept?',
    answer:
      'Card payments are being added to the store. Until then orders are reserved without charge and no card details are taken.',
  },
  {
    question: 'Can I change plan later?',
    answer:
      'You can move up or down a plan at any point. The change applies from your next billing date and nothing is lost.',
  },
  {
    question: 'Are paid memberships open yet?',
    answer:
      'Not yet. This page shows the planned tiers. A free account is open today and already gives you a saved address, a wishlist and your order history.',
  },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      <title>{pageTitle('Membership pricing')}</title>
      <InnerTitle eyebrow="Pricing" title="Simple Pricing" crumb="Pricing" />

      {/* The kit's "desktop-pricing-3" */}
      <section className="bg-gray-1">
        <div className="container-x flex flex-col items-center gap-12 py-20 lg:py-[112px]">
          <SectionHeading
            title="Pricing"
            size="h2"
            text="Shopping is free for everyone. Membership adds perks for people who order often."
          />

          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-h5 text-ink">Monthly</span>
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              aria-label="Bill yearly"
              onClick={() => setYearly((value) => !value)}
              className={cx(
                'relative h-[25px] w-[45px] rounded-[16px] border border-primary transition-colors',
                yearly ? 'bg-primary' : 'bg-white',
              )}
            >
              <span
                className={cx(
                  'absolute top-[2px] size-[19px] rounded-full transition-all',
                  yearly ? 'left-[22px] bg-white' : 'left-[3px] bg-primary-faded',
                )}
              />
            </button>
            <span className="text-h5 text-ink">Yearly</span>
            <span className="rounded-[37px] bg-primary-faded px-5 py-2.5 text-h6 text-primary">Save 25%</span>
          </div>

          <ul className="grid w-full max-w-[985px] items-center md:grid-cols-3">
            {PLANS.map((plan) => {
              const price = yearly ? plan.price * (1 - YEARLY_DISCOUNT) : plan.price
              return (
                <li
                  key={plan.name}
                  className={cx(
                    'flex flex-col items-center gap-[35px] rounded-[10px] border border-primary px-10 text-center',
                    plan.featured ? 'bg-dark py-[70px]' : 'bg-white py-[50px]',
                  )}
                >
                  <h3 className={cx('text-h3', plan.featured && 'text-white')}>{plan.name}</h3>
                  <p className={cx('max-w-[190px] text-h5', plan.featured ? 'text-white' : 'text-body')}>
                    {plan.summary}
                  </p>
                  <p className="flex items-center gap-2.5 text-primary">
                    <span className="text-h2">{price === 0 ? '0' : price.toFixed(2)}</span>
                    <span className="flex flex-col text-left">
                      <span className="text-h3">$</span>
                      <span className="text-h6 text-disabled">Per Month</span>
                    </span>
                  </p>
                  <ul className="flex w-full max-w-[247px] flex-col gap-[15px] text-left">
                    {FEATURES.map((feature, index) => {
                      const included = index < plan.included
                      return (
                        <li key={feature} className="flex items-center gap-2.5">
                          <span
                            className={cx(
                              'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
                              included ? 'bg-success' : 'bg-muted',
                            )}
                            aria-hidden
                          >
                            <BsCheck size={22} />
                          </span>
                          <span className={cx('text-h6', plan.featured ? 'text-white' : 'text-ink')}>
                            <span className="sr-only">{included ? 'Included: ' : 'Not included: '}</span>
                            {feature}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <ButtonLink to="/register" variant={plan.featured ? 'primary' : 'dark'} block className="max-w-[246px]">
                    Join for free
                  </ButtonLink>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* The layout of the kit's "desktop-clients-2" */}
      <section className="bg-gray-1">
        <div className="container-x flex flex-col items-center gap-6 pb-[50px]">
          <p className="text-h4 text-ink">Included With Every Order, On Every Plan</p>
          <PromiseRow className="w-full" />
        </div>
      </section>

      {/* The kit's "desktop-faq-5" */}
      <section className="bg-white">
        <div className="container-x flex flex-col gap-[50px] py-20">
          <div className="py-[45px]">
            <SectionHeading title="Pricing FAQs" size="h2" />
            <p className="mx-auto mt-2.5 max-w-[552px] text-center text-h4">
              Short answers to the questions we hear most about membership
            </p>
          </div>
          <dl className="grid gap-[30px] lg:grid-cols-2">
            {FAQS.map((item) => (
              <div key={item.question} className="flex items-start gap-5 rounded-[9px] p-[25px]">
                <BsChevronRight size={16} className="mt-1 shrink-0 text-primary" aria-hidden />
                <div className="flex flex-col gap-[5px]">
                  <dt className="text-h5 text-ink">{item.question}</dt>
                  <dd className="text-p">{item.answer}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="text-center text-h4">
            Haven't got your answer?{' '}
            <Link to="/contact" className="text-primary hover:text-primary-hover">
              Contact our support
            </Link>
          </p>
        </div>
      </section>

      <TrialCta spacious />
    </>
  )
}
