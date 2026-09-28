import { BsInfoCircle } from 'react-icons/bs'
import { cx } from '../../lib/format.ts'

// Shown while the store runs on Stripe test keys, so visitors can try the
// whole checkout. The card number is the one Stripe publishes for testing.
export function TestModeNote({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-start gap-3 rounded-[5px] border border-alert bg-alert/10 p-4', className)}>
      <BsInfoCircle size={20} className="mt-0.5 shrink-0 text-alert" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-h6 text-ink">Test mode, no real money is taken</p>
        <p className="text-p">
          Pay with the test card <span className="font-bold whitespace-nowrap text-ink">4242 4242 4242 4242</span>,
          any future expiry date and any three digit security code.
        </p>
      </div>
    </div>
  )
}
