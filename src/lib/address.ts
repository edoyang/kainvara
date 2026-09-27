import type { Address } from '../types.ts'

export const emptyAddress: Address = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

export function addressLines(address: Address): string[] {
  return [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.country,
    address.phone,
  ].filter(Boolean)
}
