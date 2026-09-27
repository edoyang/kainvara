import type { Address } from '../../types.ts'
import { Input } from '../ui/Field.tsx'

interface AddressFieldsProps {
  value: Address
  // The second argument is the full key of the field that changed, such as
  // "shippingAddress.city", so the form can clear that field's error.
  onChange: (value: Address, changedKey: string) => void
  // Field errors from the API, keyed like "shippingAddress.city" or "address.city".
  errors: Record<string, string>
  prefix: string
}

export function AddressFields({ value, onChange, errors, prefix }: AddressFieldsProps) {
  const field = (name: keyof Address) => ({
    value: value[name],
    error: errors[`${prefix}.${name}`],
    onChange: (event: { target: { value: string } }) =>
      onChange({ ...value, [name]: event.target.value }, `${prefix}.${name}`),
  })

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input label="Full name" autoComplete="name" required maxLength={80} {...field('fullName')} />
      <Input label="Phone" type="tel" autoComplete="tel" required maxLength={30} {...field('phone')} />
      <Input
        label="Address"
        autoComplete="address-line1"
        required
        maxLength={120}
        wrapperClassName="sm:col-span-2"
        {...field('line1')}
      />
      <Input
        label="Apartment, suite, etc. (optional)"
        autoComplete="address-line2"
        maxLength={120}
        wrapperClassName="sm:col-span-2"
        {...field('line2')}
      />
      <Input label="City" autoComplete="address-level2" required maxLength={80} {...field('city')} />
      <Input label="State or region (optional)" autoComplete="address-level1" maxLength={80} {...field('state')} />
      <Input label="Postal code" autoComplete="postal-code" required maxLength={20} {...field('postalCode')} />
      <Input label="Country" autoComplete="country-name" required maxLength={80} {...field('country')} />
    </div>
  )
}
