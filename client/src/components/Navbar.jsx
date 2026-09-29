import React from 'react'
import icone from '../assets/icone.png'
import { Link } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
          * { font-family: "Geist", sans-serif; }
        `}
      </style>

      <nav className="relative z-50 w-full px-4 pb-4 pt-2 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-4">
            <Link to="/" aria-label="Accueil Noziwild" className="flex items-center gap-2 lg:gap-3">
              <img src={icone} alt="Logo Noziwild" className="h-11 w-auto lg:h-12" />
            </Link>
            <span className="text-base font-medium text-zinc-800 sm:text-lg">Noziwild</span>

            <div className="hidden items-center gap-8 pl-10 md:flex">
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 border-0 bg-transparent py-2 text-sm text-zinc-800 hover:text-zinc-950"
                >
                  Activities
                  <svg
                    className="transition-transform group-hover:rotate-180"
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m1 1 4 4 4-4" stroke="#71717b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="invisible absolute left-0 top-full z-50 mt-1 w-44 rounded-xl border border-zinc-200 bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  <Link to="/" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Accueil</Link>
                  <Link to="/about" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">About Pages</Link>
                  <Link to="/equipment-rentals" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Equipment Rentals</Link>
                  <Link to="/contact" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Contact Pages</Link>
                  <Link to="/blog" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Blog Pages</Link>
                </div>
              </div>

              <Link to="/about" className="text-sm text-zinc-500 transition hover:text-zinc-800">Nos Circuits</Link>
              <Link to="/blog" className="text-sm text-zinc-500 transition hover:text-zinc-800">Circuits</Link>
              <Link to="/contact" className="text-sm text-zinc-500 transition hover:text-zinc-800">Contact</Link>
            </div>
          </div>

          <div className="hidden items-center md:flex">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#C49849] px-5 py-2.5 text-sm font-medium text-zinc-50 transition hover:text-zinc-200"
            >
              Booking
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-800">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Ouvrir le menu"
            className="flex flex-col gap-1.5 rounded-md bg-transparent p-1 md:hidden"
          >
            <span className={`block h-0.5 w-6 bg-zinc-800 transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-zinc-800 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-zinc-800 transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {menuOpen && (
          <div className="mt-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50"
              >
                All Pages
                <svg
                  className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m1 1 4 4 4-4" stroke="#71717b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="flex flex-col pl-4">
                  <Link to="/" className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50">Landing Pages</Link>
                  <Link to="/about" className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50">About Pages</Link>
                  <Link to="/equipment-rentals" className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50">Equipment Rentals</Link>
                  <Link to="/contact" className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50">Contact Pages</Link>
                  <Link to="/blog" className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50">Blog Pages</Link>
                </div>
              )}

              <Link to="/about" className="rounded-lg px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-50">Company</Link>
              <Link to="/contact" className="rounded-lg px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-50">Pricing</Link>
              <Link to="/blog" className="rounded-lg px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-50">Blogs</Link>

              <button
                type="button"
                className="mt-3 inline-flex w-fit items-center gap-2.5 rounded-full bg-[#C49849] px-5 py-2.5 text-sm font-medium text-zinc-50"
              >
                Booking
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-800">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
