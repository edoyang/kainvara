import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PageLoader } from '../ui/States.tsx'
import { Footer } from './Footer.tsx'
import { Header, type HeaderVariant, type TopBarTone } from './Header.tsx'

interface Chrome {
  variant: HeaderVariant
  topBar: TopBarTone
  footer: 'light' | 'dark'
}

const INNER_PAGES = ['/about', '/team', '/contact', '/pricing']

// The kit uses three header styles: dark top bar on the home pages, green on
// the shop pages, and a plain navbar on the inner pages.
function chromeFor(pathname: string): Chrome {
  if (pathname === '/' || pathname === '/home-2') return { variant: 'shop', topBar: 'dark', footer: 'light' }
  if (pathname === '/home-3') return { variant: 'shop', topBar: 'none', footer: 'dark' }
  if (INNER_PAGES.includes(pathname)) return { variant: 'inner', topBar: 'none', footer: 'light' }
  return { variant: 'shop', topBar: 'green', footer: 'light' }
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

export function Layout() {
  const { pathname } = useLocation()
  const chrome = chromeFor(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-[5px] focus:bg-primary focus:px-5 focus:py-2.5 focus:text-h6 focus:text-white"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Header variant={chrome.variant} topBar={chrome.topBar} />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer tone={chrome.footer} />
    </div>
  )
}
