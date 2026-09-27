import { ButtonLink } from '../components/ui/Button.tsx'
import { pageTitle } from '../lib/site.ts'

export default function NotFound() {
  return (
    <section className="bg-gray-1">
      <title>{pageTitle('Page not found')}</title>
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
        <p className="text-h5 text-primary">ERROR 404</p>
        <h1 className="text-h2 lg:text-h1">Page not found</h1>
        <p className="max-w-[376px] text-h4">
          The page you are looking for has moved or no longer exists.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <ButtonLink to="/">Back to home</ButtonLink>
          <ButtonLink to="/shop" variant="outline-primary">
            Browse the shop
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
