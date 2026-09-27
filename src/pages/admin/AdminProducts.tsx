import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Field.tsx'
import { Pagination } from '../../components/ui/Pagination.tsx'
import { ErrorState, Spinner } from '../../components/ui/States.tsx'
import { useToast } from '../../context/toast.ts'
import { clearQueryCache, useQuery } from '../../hooks/useQuery.ts'
import { api, errorMessage, withQuery } from '../../lib/api.ts'
import { cx, img, money } from '../../lib/format.ts'
import type { Paged, Product } from '../../types.ts'
import { ProductForm } from './ProductForm.tsx'

type Editing = { mode: 'new' } | { mode: 'edit'; product: Product } | null

export default function AdminProducts() {
  const { notify } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Editing>(null)
  const path = withQuery('/admin/products', { page, q, limit: 15 })
  const { data, error, loading, reload } = useQuery(path, (signal) => api<Paged<Product>>(path, { signal }), {
    keepPrevious: true,
  })

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setQ(search.trim())
  }

  async function archive(product: Product) {
    try {
      await api(`/admin/products/${product.id}`, { method: 'DELETE' })
      clearQueryCache()
      notify(`${product.name} is hidden from the shop`, 'info')
      reload()
    } catch (err) {
      notify(errorMessage(err), 'error')
    }
  }

  if (editing) {
    return (
      <ProductForm
        key={editing.mode === 'edit' ? editing.product.id : 'new'}
        product={editing.mode === 'edit' ? editing.product : undefined}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          reload()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form onSubmit={submitSearch} className="flex items-end gap-2.5" role="search">
          <Input
            label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={80}
            wrapperClassName="w-[240px]"
          />
          <Button type="submit" size="sm" variant="outline-primary" className="h-[50px]">
            Search
          </Button>
        </form>
        <Button size="sm" className="h-[50px]" onClick={() => setEditing({ mode: 'new' })}>
          Add Product
        </Button>
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          <div className={cx('overflow-x-auto rounded-[5px] border border-gray-2', loading && 'opacity-60')}>
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-gray-1 text-h6 text-ink">
                <tr>
                  <th className="p-3" scope="col">Product</th>
                  <th className="p-3" scope="col">Category</th>
                  <th className="p-3" scope="col">Price</th>
                  <th className="p-3" scope="col">Stock</th>
                  <th className="p-3" scope="col">Status</th>
                  <th className="p-3" scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-2 text-p">
                {data.items.map((product) => (
                  <tr key={product.id}>
                    <td className="p-3">
                      <span className="flex items-center gap-3">
                        <img
                          src={img(product.images[0] ?? '', 80, 80)}
                          alt=""
                          loading="lazy"
                          className="size-10 shrink-0 rounded-[5px] object-cover"
                        />
                        <span className="text-h6 text-ink">{product.name}</span>
                      </span>
                    </td>
                    <td className="p-3">{product.category?.name}</td>
                    <td className="p-3">{money(product.price)}</td>
                    <td className={cx('p-3', product.stock <= 5 && 'font-bold text-alert')}>{product.stock}</td>
                    <td className="p-3">{product.active ? 'Visible' : 'Hidden'}</td>
                    <td className="p-3">
                      <span className="flex justify-end gap-3 text-h6">
                        <button
                          type="button"
                          onClick={() => setEditing({ mode: 'edit', product })}
                          className="text-primary hover:text-primary-hover"
                        >
                          Edit<span className="sr-only"> {product.name}</span>
                        </button>
                        {product.active && (
                          <button type="button" onClick={() => archive(product)} className="text-danger hover:underline">
                            Hide<span className="sr-only"> {product.name}</span>
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.items.length === 0 && <p className="text-p">No products match that search.</p>}
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
