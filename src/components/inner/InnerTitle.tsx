import { Breadcrumb } from '../ui/Breadcrumb.tsx'

interface InnerTitleProps {
  eyebrow: string
  title: string
  crumb: string
}

// The kit's "desktop-inner-header-3": centred eyebrow, headline and breadcrumb.
export function InnerTitle({ eyebrow, title, crumb }: InnerTitleProps) {
  return (
    <section className="bg-white">
      <div className="container-x flex flex-col items-center gap-4 py-[50px] text-center">
        <p className="text-h5 text-body uppercase">{eyebrow}</p>
        <h1 className="max-w-[788px] text-h2 lg:text-h1">{title}</h1>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: crumb }]} currentClassName="text-body" />
      </div>
    </section>
  )
}
