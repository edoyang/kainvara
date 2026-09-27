import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { pageTitle, site } from '../lib/site.ts'

const SECTIONS = [
  {
    id: 'shipping',
    title: 'Shipping',
    body: [
      'Standard delivery takes 3 to 5 business days and is free on orders over $50. Below that it costs $4.99.',
      'Express delivery takes 1 to 2 business days and costs $14.99.',
      'You can follow the status of every order from the Orders tab of your account.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns',
    body: [
      'You can return unworn items in their original packaging within 30 days of delivery for a full refund.',
      'An order that has not been paid for yet can be cancelled from its order page. The items go straight back on sale.',
      'Refunds are made to the original payment method within 5 business days of the return reaching us.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    body: [
      'We store the details needed to run your account and deliver your orders: your name, email address, delivery address and order history.',
      'Your password is stored only as a one way hash, and your session is kept in a secure cookie that page scripts cannot read.',
      'Your cart and wishlist are saved in your browser so they are still there when you come back. We do not sell or share personal data.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    body: [
      'Prices are shown in US dollars and can change without notice. The price that applies is the one shown when you place your order.',
      'Stock is reserved when an order is placed. If an item cannot be supplied we will tell you and cancel that part of the order.',
      'This store is a portfolio project by Edoardo (Edo Yang). Orders placed here are demonstrations, no payment is taken and no goods are shipped.',
    ],
  },
]

export default function Policies() {
  return (
    <>
      <title>{pageTitle('Store policies')}</title>
      <PageHeader title="Store Policies" crumbs={[{ label: 'Policies' }]} />

      <section className="bg-white">
        <div className="container-x grid gap-[30px] py-12 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Policies" className="h-fit rounded-[5px] bg-gray-1 p-[25px] lg:sticky lg:top-6">
            <ul className="flex flex-col gap-2.5">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-h6 text-body hover:text-primary">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex max-w-[760px] flex-col gap-12">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-6">
                <h2 className="text-h3">{section.title}</h2>
                <div className="mt-4 flex flex-col gap-4 text-p">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-p">
              Questions about any of this? <Link to="/contact" className="font-bold text-primary">Contact us</Link> or
              write to <a href={`mailto:${site.email}`} className="font-bold text-primary">{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
