import {
  BsArrowCounterclockwise,
  BsBoxSeam,
  BsLightningCharge,
  BsShieldLock,
  BsTag,
  BsTruck,
} from 'react-icons/bs'
import { cx } from '../../lib/format.ts'

const PROMISES = [
  { label: 'Free delivery over $50', Icon: BsTruck },
  { label: 'Express in 1 to 2 days', Icon: BsLightningCharge },
  { label: '30 day returns', Icon: BsArrowCounterclockwise },
  { label: 'Secure checkout', Icon: BsShieldLock },
  { label: 'Discount codes', Icon: BsTag },
  { label: 'Live order status', Icon: BsBoxSeam },
]

// Takes the place of the kit's "desktop-clients-1" logo row. The kit shows
// logos of real companies there, this store shows what it offers instead.
export function PromiseRow({ className }: { className?: string }) {
  return (
    <ul
      className={cx(
        'grid grid-cols-2 gap-x-[30px] gap-y-10 py-[50px] text-body sm:grid-cols-3 lg:grid-cols-6',
        className,
      )}
      aria-label="What every order includes"
    >
      {PROMISES.map(({ label, Icon }) => (
        <li key={label} className="flex flex-col items-center gap-3 text-center">
          <Icon size={44} aria-hidden />
          <span className="text-h6">{label}</span>
        </li>
      ))}
    </ul>
  )
}

export function PromiseStrip() {
  return (
    <section className="bg-gray-1">
      <div className="container-x">
        <PromiseRow />
      </div>
    </section>
  )
}
