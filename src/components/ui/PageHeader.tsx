import { Breadcrumb, type Crumb } from './Breadcrumb.tsx'

interface PageHeaderProps {
  title: string
  crumbs: Crumb[]
}

// The grey title strip used at the top of the shop pages.
export function PageHeader({ title, crumbs }: PageHeaderProps) {
  return (
    <section className="bg-gray-1">
      <div className="container-x flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <h1 className="text-h3">{title}</h1>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, ...crumbs]} />
      </div>
    </section>
  )
}
