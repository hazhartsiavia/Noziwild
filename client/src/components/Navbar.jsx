
import React, { useRef, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import icone from '../assets/icone.png'
import { Link } from '../i18n/router'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../context/TripContext'
import Avatar from './Avatar'
import LanguageSwitcher, { LanguageRow } from './LanguageSwitcher'
import { useT } from '../i18n/LanguageContext'

/* ============================================================
   ÉPAULE COURBE
============================================================ */
const Fillet = ({ side, fRef }) => (
  <svg
    ref={fRef}
    className="hidden md:block h-6 w-6 shrink-0 fill-current text-white"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d={
        side === 'left'
          ? 'M0 0H24V24A24 24 0 0 0 0 0Z'
          : 'M24 0H0V24A24 24 0 0 1 24 0Z'
      }
    />
  </svg>
)

/* ============================================================
   CHEVRON
============================================================ */
const Chevron = ({ className = '' }) => (
  <svg
    className={className}
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="m1 1 4 4 4-4"
      stroke="#71717b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function Navbar() {
  const { user, loading } = useAuth()
  const t = useT('nav')
  const tt = useT('trip')
  // Bouton devis : mène à la sélection « Mon voyage », avec le nombre d'offres mises de côté
  const { count: tripCount } = useTrip()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)

  const navRef = useRef(null)

  const filletLeftRef = useRef(null)
  const filletRightRef = useRef(null)
  const tabRef = useRef(null)
  const logoRef = useRef(null)
  const linksRef = useRef(null)
  const ctaRef = useRef(null)

  const mobileMenuRef = useRef(null)

  const travelDropdownRef = useRef(null)
  const servicesDropdownRef = useRef(null)

  /* ============================================================
     TRAVEL
  ============================================================ */
  const travelLinks = [
    [t('links.activities'), '/activities'],
    [t('links.circuits'), '/circuits'],
    [t('links.excursions'), '/excurssions'],
    [t('links.cruise'), '/cruise-excurssion'],
    [t('links.longStay'), '/longstay'],
    [t('links.tailorMade'), '/tailor-made'],
  ]

  /* ============================================================
     SERVICES
  ============================================================ */
  const serviceLinks = [
    [t('links.accommodation'), '/hosting'],
    [t('links.transport'), '/transport'],
    [t('links.guides'), '/guide'],
    [t('links.food'), '/food-dining'],
    [t('links.equipment'), '/equipment-rentals'],
    [t('links.photography'), '/photography'],
    [t('links.planning'), '/travel-planning'],
    [t('links.tickets'), '/ticket-reservation'],
  ]

  /* ============================================================
     FERMER MENU
  ============================================================ */
  const closeMenu = () => {
    setMenuOpen(false)
    setMobileSection(null)
  }

  /* ============================================================
     ANIMATION D'ENTRÉE
  ============================================================ */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(tabRef.current, {
        y: -40,
        opacity: 0,
      })

      gsap.set(
        [filletLeftRef.current, filletRightRef.current],
        {
          opacity: 0,
          scale: 0.6,
        }
      )

      gsap.set(logoRef.current, {
        opacity: 0,
        scale: 0.85,
      })

      gsap.set(ctaRef.current, {
        opacity: 0,
        y: -10,
      })

      const navLinks = linksRef.current
        ? linksRef.current.querySelectorAll('.nav-link-item')
        : []

      gsap.set(navLinks, {
        opacity: 0,
        y: -8,
      })

      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
        delay: 0.1,
      })

      tl.to(tabRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.7,
      })

        .to(
          [filletLeftRef.current, filletRightRef.current],
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.8)',
          },
          '-=0.4'
        )

        .to(
          logoRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.6)',
          },
          '-=0.45'
        )

        .to(
          navLinks,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.07,
          },
          '-=0.3'
        )

        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
          },
          '-=0.25'
        )
    }, navRef)

    return () => ctx.revert()
  }, [])

  /* ============================================================
     MENU MOBILE
  ============================================================ */
  useLayoutEffect(() => {
    const el = mobileMenuRef.current

    if (!el) return

    if (menuOpen) {
      gsap.set(el, {
        display: 'block',
        height: 'auto',
      })

      const fullHeight = el.offsetHeight

      gsap.fromTo(
        el,
        {
          height: 0,
          opacity: 0,
        },
        {
          height: fullHeight,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
        }
      )
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(el, {
            display: 'none',
          })
        },
      })
    }
  }, [menuOpen])

  /* ============================================================
     DROPDOWN
     
     IMPORTANT :
     - petit délai avant fermeture
     - la zone du dropdown reste accessible
  ============================================================ */
  const openDropdown = (ref) => {
    if (!ref.current) return

    gsap.killTweensOf(ref.current)

    gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.25,
      ease: 'power3.out',
    })
  }

  const closeDropdown = (ref) => {
    if (!ref.current) return

    gsap.killTweensOf(ref.current)

    gsap.to(ref.current, {
      opacity: 0,
      y: -8,
      pointerEvents: 'none',
      duration: 0.2,
      delay: 0.2,
      ease: 'power3.in',
    })
  }

  /* ============================================================
     CTA
  ============================================================ */
  const handleCtaEnter = () => {
    gsap.to(ctaRef.current, {
      scale: 1.04,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  const handleCtaLeave = () => {
    gsap.to(ctaRef.current, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  /* ============================================================
     MOBILE SECTIONS
  ============================================================ */
  const toggleMobileSection = (section) => {
    setMobileSection((current) =>
      current === section ? null : section
    )
  }

  /* ============================================================
     STYLE PRINCIPAL
  ============================================================ */
  const link =
    'text-[15px] text-zinc-500 transition hover:text-zinc-900'

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Main"
        className="relative z-50 flex w-full justify-center md:mb-10"
      >
        <div className="flex items-start">

          {/* ======================================================
              FILLET GAUCHE
          ====================================================== */}
          <Fillet
            side="left"
            fRef={filletLeftRef}
          />

          {/* ======================================================
              NAVBAR
          ====================================================== */}
          <div
            ref={tabRef}
            className="
              relative
              flex
              w-[calc(100vw-3rem)]
              items-center
              justify-between
              gap-6
              rounded-b-[1.75rem]
              md:bg-white
              px-5
              py-3
              md:w-auto
              md:justify-start
              md:gap-5
              md:px-5
              lg:gap-8
              lg:px-8
            "
          >

            {/* ==================================================
                LOGO
            ================================================== */}
            <Link
              ref={logoRef}
              to="/"
              aria-label={t('home')}
              className="flex items-center gap-2.5"
            >
              <img
                src={icone}
                alt={t('logo')}
                className="h-9 w-auto lg:h-10"
              />
            </Link>

            {/* ==================================================
                DESKTOP MENU
            ================================================== */}
            <div
              ref={linksRef}
              className="
                hidden
                items-center
                gap-4
                md:flex
                lg:gap-7
              "
            >

              {/* =================================================
                  DESTINATIONS
              ================================================= */}
              <Link
                to="/destinations"
                className={`nav-link-item ${link}`}
              >
                {t('destinations')}
              </Link>

              {/* =================================================
                  TRAVEL
              ================================================= */}
              <div
                className="relative nav-link-item"
                onMouseEnter={() =>
                  openDropdown(travelDropdownRef)
                }
                onMouseLeave={() =>
                  closeDropdown(travelDropdownRef)
                }
              >
                <Link
                  to="/activities"
                  className="
                    flex
                    items-center
                    gap-1.5
                    py-2
                    text-[15px]
                    text-zinc-500
                    transition
                    hover:text-zinc-900
                  "
                >
                  {t('travel')}

                  <Chevron />
                </Link>

                {/* ---------------------------------------------
                    ZONE DROPDOWN
                --------------------------------------------- */}
                <div
                  ref={travelDropdownRef}
                  style={{
                    opacity: 0,
                    pointerEvents: 'none',
                    transform: 'translateY(-8px)',
                  }}
                  className="
                    absolute
                    left-1/2
                    top-full
                    z-50
                    w-56
                    -translate-x-1/2
                    pt-2
                  "
                >
                  <div
                    className="
                      rounded-xl
                      border
                      border-zinc-200
                      bg-white
                      py-2
                      shadow-lg
                    "
                  >
                    {travelLinks.map(([label, path]) => (
                      <Link
                        key={path}
                        to={path}
                        className="
                          block
                          px-4
                          py-2.5
                          text-[14px]
                          text-zinc-600
                          transition
                          hover:bg-zinc-50
                          hover:text-zinc-900
                        "
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================
                  SERVICES
              ================================================= */}
              <div
                className="relative nav-link-item"
                onMouseEnter={() =>
                  openDropdown(servicesDropdownRef)
                }
                onMouseLeave={() =>
                  closeDropdown(servicesDropdownRef)
                }
              >
                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-1.5
                    py-2
                    text-[15px]
                    text-zinc-500
                    transition
                    hover:text-zinc-900
                  "
                >
                  {t('services')}

                  <Chevron />
                </button>

                {/* ---------------------------------------------
                    ZONE DROPDOWN
                --------------------------------------------- */}
                <div
                  ref={servicesDropdownRef}
                  style={{
                    opacity: 0,
                    pointerEvents: 'none',
                    transform: 'translateY(-8px)',
                  }}
                  className="
                    absolute
                    left-1/2
                    top-full
                    z-50
                    w-64
                    -translate-x-1/2
                    pt-2
                  "
                >
                  <div
                    className="
                      rounded-xl
                      border
                      border-zinc-200
                      bg-white
                      py-2
                      shadow-lg
                    "
                  >
                    {serviceLinks.map(([label, path]) => (
                      <Link
                        key={path}
                        to={path}
                        className="
                          block
                          px-4
                          py-2.5
                          text-[14px]
                          text-zinc-600
                          transition
                          hover:bg-zinc-50
                          hover:text-zinc-900
                        "
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================
                  ABOUT
              ================================================= */}
              <Link
                to="/about"
                className={`nav-link-item ${link}`}
              >
                {t('about')}
              </Link>

              {/* =================================================
                  BLOG
              ================================================= */}
              <Link
                to="/blog"
                className={`nav-link-item ${link}`}
              >
                {t('blog')}
              </Link>

            </div>

            {/* ==================================================
                LANGUE
            ================================================== */}
            <LanguageSwitcher className="hidden md:block" />

            {/* ==================================================
                COMPTE (connexion / profil)
            ================================================== */}
            {loading ? (
              <span className="hidden h-9 w-9 md:block" aria-hidden="true" />
            ) : user ? (
              <Link
                to="/account"
                aria-label={t('myAccount')}
                className="hidden items-center gap-2 text-[15px] text-zinc-700 transition hover:text-zinc-900 md:flex"
              >
                <Avatar user={user} className="h-9 w-9 text-sm" />
                <span className="hidden max-w-[8rem] truncate lg:inline">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={`hidden whitespace-nowrap md:inline ${link}`}
              >
                {t('login')}
              </Link>
            )}

            {/* ==================================================
                CTA
            ================================================== */}
            <Link
              ref={ctaRef}
              to="/my-trip"
              aria-label={tripCount > 0 ? `${tt('navLabel')} (${tripCount})` : undefined}
              onMouseEnter={handleCtaEnter}
              onMouseLeave={handleCtaLeave}
              className="
                hidden
                items-center
                gap-2
                whitespace-nowrap
                rounded-full
                border
                border-zinc-900
                px-5
                py-2
                text-[15px]
                font-medium
                text-zinc-900
                md:inline-flex
              "
            >
              {tripCount > 0 ? (
                <>
                  {tt('navLabel')}
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C49849] px-1.5 text-xs font-semibold text-white tabular-nums">{tripCount}</span>
                </>
              ) : t('quote')}

              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="m1 1 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* ==================================================
                BOUTON MOBILE
            ================================================== */}
            <button
              type="button"
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
              aria-label={
                menuOpen
                  ? t('closeMenu')
                  : t('openMenu')
              }
              aria-expanded={menuOpen}
              className="
                flex
                flex-col
                gap-1.5
                rounded-md
                bg-transparent
                p-1
                md:hidden
              "
            >
              <span
                className={`
                  block
                  h-0.5
                  w-6
                  bg-zinc-900
                  transition-transform
                  ${
                    menuOpen
                      ? 'translate-y-2 rotate-45'
                      : ''
                  }
                `}
              />

              <span
                className={`
                  block
                  h-0.5
                  w-6
                  bg-zinc-900
                  transition-opacity
                  ${
                    menuOpen
                      ? 'opacity-0'
                      : ''
                  }
                `}
              />

              <span
                className={`
                  block
                  h-0.5
                  w-6
                  bg-zinc-900
                  transition-transform
                  ${
                    menuOpen
                      ? '-translate-y-2 -rotate-45'
                      : ''
                  }
                `}
              />
            </button>

            {/* ==================================================
                MOBILE MENU
            ================================================== */}
            <div
              ref={mobileMenuRef}
              style={{
                height: 0,
                opacity: 0,
                overflow: 'hidden',
                display: 'none',
              }}
              className="
                absolute
                inset-x-0
                top-full
                mt-2
                rounded-2xl
                border
                border-zinc-200
                bg-white
                p-4
                shadow-lg
                md:hidden
              "
            >
              <div className="flex flex-col gap-1">

                {/* DESTINATIONS */}
                <Link
                  to="/destinations"
                  onClick={closeMenu}
                  className="
                    rounded-lg
                    px-4
                    py-2.5
                    text-[15px]
                    text-zinc-800
                    hover:bg-zinc-50
                  "
                >
                  {t('destinations')}
                </Link>

                {/* =================================================
                    TRAVEL MOBILE
                ================================================= */}
                <button
                  type="button"
                  onClick={() =>
                    toggleMobileSection('travel')
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    px-4
                    py-2.5
                    text-[15px]
                    text-zinc-800
                    hover:bg-zinc-50
                  "
                >
                  {t('travel')}

                  <Chevron
                    className={`
                      transition-transform
                      ${
                        mobileSection === 'travel'
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {mobileSection === 'travel' && (
                  <div className="flex flex-col pl-4">
                    {travelLinks.map(([label, path]) => (
                      <Link
                        key={path}
                        to={path}
                        onClick={closeMenu}
                        className="
                          rounded-lg
                          px-4
                          py-2
                          text-[14px]
                          text-zinc-500
                          hover:bg-zinc-50
                          hover:text-zinc-900
                        "
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* =================================================
                    SERVICES MOBILE
                ================================================= */}
                <button
                  type="button"
                  onClick={() =>
                    toggleMobileSection('services')
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    px-4
                    py-2.5
                    text-[15px]
                    text-zinc-800
                    hover:bg-zinc-50
                  "
                >
                  {t('services')}

                  <Chevron
                    className={`
                      transition-transform
                      ${
                        mobileSection === 'services'
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {mobileSection === 'services' && (
                  <div className="flex flex-col pl-4">
                    {serviceLinks.map(([label, path]) => (
                      <Link
                        key={path}
                        to={path}
                        onClick={closeMenu}
                        className="
                          rounded-lg
                          px-4
                          py-2
                          text-[14px]
                          text-zinc-500
                          hover:bg-zinc-50
                          hover:text-zinc-900
                        "
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* ABOUT */}
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className="
                    rounded-lg
                    px-4
                    py-2.5
                    text-[15px]
                    text-zinc-800
                    hover:bg-zinc-50
                  "
                >
                  {t('about')}
                </Link>

                {/* BLOG */}
                <Link
                  to="/blog"
                  onClick={closeMenu}
                  className="
                    rounded-lg
                    px-4
                    py-2.5
                    text-[15px]
                    text-zinc-800
                    hover:bg-zinc-50
                  "
                >
                  {t('blog')}
                </Link>

                {/* COMPTE MOBILE */}
                {!loading && (
                  <Link
                    to={user ? '/account' : '/login'}
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-4
                      py-2.5
                      text-[15px]
                      text-zinc-800
                      hover:bg-zinc-50
                    "
                  >
                    {user ? (
                      <>
                        <Avatar user={user} className="h-7 w-7 text-xs" />
                        {t('myAccount')}
                      </>
                    ) : (
                      t('login')
                    )}
                  </Link>
                )}

                {/* LANGUE MOBILE */}
                <LanguageRow onChange={closeMenu} />

                {/* CTA MOBILE */}
                <Link
                  to="/my-trip"
                  onClick={closeMenu}
                  className="
                    mt-3
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-zinc-900
                    px-5
                    py-2
                    text-[15px]
                    font-medium
                    text-zinc-900
                  "
                >
                  {tripCount > 0 ? (
                    <>
                      {tt('navLabel')}
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C49849] px-1.5 text-xs font-semibold text-white tabular-nums">{tripCount}</span>
                    </>
                  ) : t('quote')}

                  <svg
                    width="7"
                    height="12"
                    viewBox="0 0 7 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="m1 1 5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

              </div>
            </div>

          </div>

          {/* ======================================================
              FILLET DROIT
          ====================================================== */}
          <Fillet
            side="right"
            fRef={filletRightRef}
          />

        </div>
      </nav>
    </>
  )
}

export default Navbar
