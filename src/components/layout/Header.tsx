import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  BsArrowRight,
  BsCart,
  BsChevronDown,
  BsHeart,
  BsList,
  BsPerson,
  BsSearch,
  BsX,
} from 'react-icons/bs'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth.ts'
import { useCart } from '../../context/cart.ts'
import { useToast } from '../../context/toast.ts'
import { useWishlist } from '../../context/wishlist.ts'
import { useCategories } from '../../hooks/useCatalog.ts'
import { cx } from '../../lib/format.ts'
import { ButtonLink } from '../ui/Button.tsx'
import { Brand } from './Brand.tsx'
import { TopBar } from './TopBar.tsx'

export type HeaderVariant = 'shop' | 'inner'
export type TopBarTone = 'dark' | 'green' | 'none'

const PAGE_LINKS = [
  { label: 'Home classic', to: '/' },
  { label: 'Home modern', to: '/home-2' },
  { label: 'Home market', to: '/home-3' },
  { label: 'Team', to: '/team' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Wishlist', to: '/wishlist' },
]

const navLink = ({ isActive }: { isActive: boolean }) =>
  cx('text-h6 transition-colors hover:text-primary', isActive ? 'text-ink' : 'text-body')

interface DropdownProps {
  label: ReactNode
  buttonClassName?: string
  align?: 'left' | 'right'
  children: ReactNode
}

function Dropdown({ label, buttonClassName, align = 'left', children }: DropdownProps) {
  const location = useLocation()
  // Tied to the location key, so any navigation closes the menu by itself.
  const [openKey, setOpenKey] = useState<string | null>(null)
  const open = openKey === location.key
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpenKey(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenKey(null)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpenKey(location.key)}
      onMouseLeave={() => setOpenKey(null)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpenKey(location.key)}
        className={buttonClassName}
      >
        {label}
      </button>
      {open && (
        <div className={cx('absolute top-full z-50 pt-2', align === 'right' ? 'right-0' : 'left-0')}>
          <div className="min-w-[210px] animate-fade-in rounded-[5px] border border-line bg-white py-3 shadow-accent">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="block px-6 py-2 text-h6 text-body hover:bg-gray-1 hover:text-primary">
      {children}
    </Link>
  )
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const q = term.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    onClose()
  }

  return (
    <div className="absolute inset-x-0 top-full z-40 animate-fade-in border-t border-line bg-white shadow-accent">
      <form onSubmit={submit} className="container-x flex items-center gap-3 py-4" role="search">
        <BsSearch className="shrink-0 text-primary" size={18} aria-hidden />
        <input
          autoFocus
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search for products, departments or tags"
          aria-label="Search products"
          maxLength={80}
          className="h-[50px] w-full bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none"
        />
        <button type="submit" className="rounded-[5px] bg-primary px-5 py-2.5 text-h6 text-white hover:bg-primary-hover">
          Search
        </button>
        <button type="button" onClick={onClose} aria-label="Close search" className="p-2 text-2xl text-body hover:text-ink">
          <BsX />
        </button>
      </form>
    </div>
  )
}

interface HeaderProps {
  variant: HeaderVariant
  topBar: TopBarTone
}

export function Header({ variant, topBar }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { count: cartCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { notify } = useToast()
  const categories = useCategories()

  const [menuKey, setMenuKey] = useState<string | null>(null)
  const [searchKey, setSearchKey] = useState<string | null>(null)
  const menuOpen = menuKey === location.key
  const searchOpen = searchKey === location.key

  async function signOut() {
    try {
      await logout()
      notify('You are signed out', 'info')
      navigate('/')
    } catch {
      notify('Could not sign out, please try again', 'error')
    }
  }

  const shopMenu = (
    <>
      <MenuLink to="/shop">All products</MenuLink>
      {(categories.data ?? []).map((category) => (
        <MenuLink key={category.id} to={`/shop/${category.slug}`}>
          {category.name}
        </MenuLink>
      ))}
      <MenuLink to="/shop?sale=1">On sale</MenuLink>
    </>
  )

  const accountMenu = user && (
    <>
      <p className="truncate px-6 pb-2 text-small text-muted">{user.email}</p>
      <MenuLink to="/account">My account</MenuLink>
      <MenuLink to="/account/orders">My orders</MenuLink>
      <MenuLink to="/wishlist">Wishlist</MenuLink>
      {user.role === 'admin' && <MenuLink to="/admin">Store admin</MenuLink>}
      <button
        type="button"
        onClick={signOut}
        className="block w-full px-6 py-2 text-left text-h6 text-danger hover:bg-gray-1"
      >
        Sign out
      </button>
    </>
  )

  const iconButton = 'flex items-center gap-[5px] rounded-[37px] p-[15px] text-primary hover:bg-gray-1'

  return (
    <header className="relative z-40 bg-white">
      {topBar !== 'none' && <TopBar tone={topBar} />}

      <div className={variant === 'shop' ? 'px-[35px] lg:px-[38px]' : 'container-x'}>
        <div
          className={cx(
            'flex items-center justify-between gap-6',
            variant === 'shop' ? 'min-h-[104px] lg:min-h-[78px]' : 'min-h-[104px] lg:min-h-[91px]',
          )}
        >
          <div className="flex items-center gap-10 xl:gap-[118px]">
            <Brand />

            <nav aria-label="Main" className="hidden lg:block">
              {variant === 'shop' ? (
                <ul className="flex items-center gap-[15px]">
                  <li>
                    <NavLink to="/" end className={navLink}>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <Dropdown
                      buttonClassName="flex items-center gap-2.5 px-1.5 text-[14px] leading-7 font-medium text-ink hover:text-primary"
                      label={
                        <>
                          Shop <BsChevronDown size={10} aria-hidden />
                        </>
                      }
                    >
                      {shopMenu}
                    </Dropdown>
                  </li>
                  <li>
                    <NavLink to="/about" className={navLink}>
                      About
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/blog" className={navLink}>
                      Blog
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/contact" className={navLink}>
                      Contact
                    </NavLink>
                  </li>
                  <li>
                    <Dropdown buttonClassName="text-h6 text-body hover:text-primary" label="Pages">
                      {PAGE_LINKS.map((link) => (
                        <MenuLink key={link.to} to={link.to}>
                          {link.label}
                        </MenuLink>
                      ))}
                    </Dropdown>
                  </li>
                </ul>
              ) : (
                <ul className="flex items-center gap-[21px]">
                  <li>
                    <NavLink to="/" end className={navLink}>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/shop" className={navLink}>
                      Product
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/pricing" className={navLink}>
                      Pricing
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/contact" className={navLink}>
                      Contact
                    </NavLink>
                  </li>
                </ul>
              )}
            </nav>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center lg:flex">
            {variant === 'shop' ? (
              <>
                {user ? (
                  <Dropdown
                    align="right"
                    buttonClassName={cx(iconButton, 'text-h6')}
                    label={
                      <>
                        <BsPerson size={14} aria-hidden />
                        <span className="max-w-[140px] truncate">{user.name}</span>
                        <BsChevronDown size={10} aria-hidden />
                      </>
                    }
                  >
                    {accountMenu}
                  </Dropdown>
                ) : (
                  <Link to="/login" className={cx(iconButton, 'text-h6')}>
                    <BsPerson size={14} aria-hidden />
                    Login / Register
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setSearchKey(searchOpen ? null : location.key)}
                  aria-label="Search"
                  aria-expanded={searchOpen}
                  className={iconButton}
                >
                  <BsSearch size={16} />
                </button>
                <Link to="/cart" className={iconButton} aria-label={`Cart, ${cartCount} items`}>
                  <BsCart size={16} aria-hidden />
                  <span className="text-small">{cartCount}</span>
                </Link>
                <Link to="/wishlist" className={iconButton} aria-label={`Wishlist, ${wishlistCount} items`}>
                  <BsHeart size={16} aria-hidden />
                  <span className="text-small">{wishlistCount}</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-6 xl:gap-[45px]">
                <Link to="/cart" className="flex items-center gap-[5px] text-primary" aria-label={`Cart, ${cartCount} items`}>
                  <BsCart size={16} aria-hidden />
                  <span className="text-small">{cartCount}</span>
                </Link>
                {user ? (
                  <Dropdown
                    align="right"
                    buttonClassName="flex items-center gap-2 text-btn text-primary"
                    label={
                      <>
                        <span className="max-w-[140px] truncate">{user.name}</span>
                        <BsChevronDown size={10} aria-hidden />
                      </>
                    }
                  >
                    {accountMenu}
                  </Dropdown>
                ) : (
                  <Link to="/login" className="text-btn text-primary hover:text-primary-hover">
                    Login
                  </Link>
                )}
                <ButtonLink to={user ? '/shop' : '/register'} className="gap-[15px] px-[25px]">
                  {user ? 'Shop the collection' : 'Become a member'}
                  <BsArrowRight size={14} aria-hidden />
                </ButtonLink>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-6 text-ink lg:hidden">
            <button
              type="button"
              onClick={() => setSearchKey(searchOpen ? null : location.key)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <BsSearch size={22} />
            </button>
            <Link to="/cart" className="relative" aria-label={`Cart, ${cartCount} items`}>
              <BsCart size={24} aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] leading-[18px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuKey(menuOpen ? null : location.key)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <BsX size={30} /> : <BsList size={30} />}
            </button>
          </div>
        </div>
      </div>

      {searchOpen && <SearchBar onClose={() => setSearchKey(null)} />}

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="animate-fade-in border-t border-line bg-white pt-[60px] pb-[70px] lg:hidden">
          <ul className="flex flex-col items-center gap-[30px] text-menu text-body">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/shop">Product</Link>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/wishlist">Wishlist{wishlistCount > 0 && ` (${wishlistCount})`}</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/account" className="text-primary">
                    My account
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li>
                    <Link to="/admin" className="text-primary">
                      Store admin
                    </Link>
                  </li>
                )}
                <li>
                  <button type="button" onClick={signOut} className="text-danger">
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="text-primary">
                  Login / Register
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
