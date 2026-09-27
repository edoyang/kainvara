import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button.tsx'
import { Input, Select, Textarea } from '../../components/ui/Field.tsx'
import { useToast } from '../../context/toast.ts'
import { useCategories } from '../../hooks/useCatalog.ts'
import { clearQueryCache } from '../../hooks/useQuery.ts'
import { api, ApiError, errorMessage } from '../../lib/api.ts'
import type { Product } from '../../types.ts'

interface ProductFormProps {
  // Omitted when creating a new product.
  product?: Product
  onSaved: () => void
  onCancel: () => void
}

const lines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const list = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const dollars = (cents: number | null | undefined) => (cents === null || cents === undefined ? '' : (cents / 100).toFixed(2))
const cents = (value: string) => Math.round(Number(value) * 100)

export function ProductForm({ product, onSaved, onCancel }: ProductFormProps) {
  const { notify } = useToast()
  const categories = useCategories()
  const [form, setForm] = useState({
    name: product?.name ?? '',
    department: product?.department ?? '',
    categoryId: product?.category.id ?? '',
    summary: product?.summary ?? '',
    description: product?.description ?? '',
    highlights: product?.highlights.join('\n') ?? '',
    price: dollars(product?.price),
    compareAtPrice: dollars(product?.compareAtPrice),
    images: product?.images.join('\n') ?? '',
    colors: product?.colors.map((color) => `${color.name}: ${color.hex}`).join('\n') ?? '',
    sizes: product?.sizes.join(', ') ?? '',
    stock: String(product?.stock ?? 0),
    tags: product?.tags.join(', ') ?? '',
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    active: product?.active ?? true,
  })
  const [busy, setBusy] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  // Field errors for list values come back as "images.0", "colors.1.hex" and so on.
  const errorFor = (key: string) =>
    fields[key] ?? Object.entries(fields).find(([field]) => field.startsWith(`${key}.`))?.[1]

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setFields({})
    setFormError('')
    const body = {
      name: form.name,
      department: form.department,
      categoryId: form.categoryId,
      summary: form.summary,
      description: form.description,
      highlights: lines(form.highlights),
      price: cents(form.price),
      compareAtPrice: form.compareAtPrice.trim() ? cents(form.compareAtPrice) : null,
      images: lines(form.images),
      colors: lines(form.colors).map((line) => {
        const [name, hex = ''] = line.split(':').map((part) => part.trim())
        return { name, hex }
      }),
      sizes: list(form.sizes),
      stock: Number(form.stock),
      tags: list(form.tags),
      featured: form.featured,
      bestseller: form.bestseller,
      active: form.active,
    }
    try {
      await api(product ? `/admin/products/${product.id}` : '/admin/products', {
        method: product ? 'PUT' : 'POST',
        body,
      })
      clearQueryCache()
      notify(product ? 'Product updated' : 'Product created')
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setFields(err.fields)
        setFormError('Please check the highlighted fields.')
      } else {
        setFormError(errorMessage(err))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-[5px] border border-gray-2 p-[25px]" noValidate>
      <h2 className="text-h3">{product ? `Edit ${product.name}` : 'New product'}</h2>
      {formError && (
        <p className="rounded-[5px] border border-danger bg-danger/5 p-3 text-h6 text-danger" role="alert">
          {formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name" required maxLength={120} value={form.name} onChange={(e) => set('name', e.target.value)} error={errorFor('name')} />
        <Input label="Department" maxLength={80} value={form.department} onChange={(e) => set('department', e.target.value)} error={errorFor('department')} />
        <Select label="Category" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} error={errorFor('categoryId')}>
          <option value="">Choose a category</option>
          {(categories.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Input label="Stock" type="number" min={0} step={1} required value={form.stock} onChange={(e) => set('stock', e.target.value)} error={errorFor('stock')} />
        <Input label="Price (USD)" type="number" min={0} step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} error={errorFor('price')} />
        <Input
          label="Original price (USD, optional)"
          type="number"
          min={0}
          step="0.01"
          value={form.compareAtPrice}
          onChange={(e) => set('compareAtPrice', e.target.value)}
          error={errorFor('compareAtPrice')}
          hint="Shown crossed out next to the price"
        />
      </div>

      <Input label="Summary" maxLength={300} value={form.summary} onChange={(e) => set('summary', e.target.value)} error={errorFor('summary')} />
      <Textarea label="Description" maxLength={4000} value={form.description} onChange={(e) => set('description', e.target.value)} error={errorFor('description')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Textarea
          label="Image URLs"
          required
          rows={4}
          value={form.images}
          onChange={(e) => set('images', e.target.value)}
          error={errorFor('images')}
          hint="One https link per line, the first is the cover"
        />
        <Textarea
          label="Highlights"
          rows={4}
          value={form.highlights}
          onChange={(e) => set('highlights', e.target.value)}
          error={errorFor('highlights')}
          hint="One per line"
        />
        <Textarea
          label="Colours"
          rows={4}
          value={form.colors}
          onChange={(e) => set('colors', e.target.value)}
          error={errorFor('colors')}
          hint="One per line, for example Sky Blue: #23A6F0"
        />
        <div className="flex flex-col gap-5">
          <Input label="Sizes" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} error={errorFor('sizes')} hint="Separated by commas" />
          <Input label="Tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} error={errorFor('tags')} hint="Separated by commas" />
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-6">
        <legend className="sr-only">Visibility</legend>
        {(
          [
            ['active', 'Visible in the shop'],
            ['featured', 'Featured'],
            ['bestseller', 'Bestseller'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center gap-2.5 text-h6 text-ink">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => set(key, e.target.checked)}
              className="size-[18px] cursor-pointer accent-primary"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2.5">
        <Button type="submit" size="sm" loading={busy}>
          {product ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button size="sm" variant="outline-primary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
