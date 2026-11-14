import React from 'react'
import { Link } from '../i18n/router'
import LogoPrincipal from "../assets/logo/principal-sur-vert.svg";
import Wordmark from "../assets/logo/wordmark-blanc.svg";
import { useT } from "../i18n/LanguageContext";
import { useSitePages } from "../context/SitePagesContext";

// Liens du pied de page : routes de App.jsx, libellés dans locales/<langue>/footer.json
const LINKS = [
    { to: '/', key: 'home' },
    { to: '/about', key: 'about' },
    { to: '/circuits', key: 'circuits' },
    { to: '/destinations', key: 'destinations' },
    { to: '/contact', key: 'contact' },
]

const Footer = () => {
    const t = useT('footer')
    const { isHidden } = useSitePages()
    return (
        <>
            <footer className='w-full bg-[#072a1f] text-white flex justify-center'>
                <div className='w-[90vw] max-w-[1360px] pt-16 md:pt-24'>
                    <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

                        <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
                            {/* Logo officiel, version blanc et or pour le fond vert */}
                            <Link to="/" aria-label={t('home')} className="block">
                                <img src={LogoPrincipal} alt="" className="h-32 md:h-36 w-auto" />
                            </Link>
                            <div className='w-10 h-px mt-8 bg-[#b08d4f]'></div>
                            <p className='text-sm text-white/65 mt-6 max-w-[350px] leading-relaxed'>{t('tagline')}</p>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6C58A]'>{t('importantLinks')}</h3>
                            <div className="flex flex-col gap-3 mt-6">
                                {LINKS.filter(({ to }) => !isHidden(to)).map(({ to, key }) => (
                                    <Link key={key} to={to} className='text-sm text-white/75 hover:text-white transition-colors'>{t(`links.${key}`)}</Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col max-md:items-center max-md:text-start gap-2 items-end">
                            <p className="max-w-72 font-display text-2xl md:text-3xl leading-tight text-[#F4F1EA]">{t('promise')}</p>
                        </div>

                    </div>

                    <div className='w-full h-px mt-14 md:mt-20 mb-5 bg-white/15'></div>

                    <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
                        <p className='text-xs text-white/55'>© 2026 Noziwild</p>
                    </div>

                    {/* Grand nom en fond : les lettres du logo officiel, en blanc très léger */}
                    <div className="w-full mt-6 md:mt-12 pb-6 md:pb-10">
                        <img src={Wordmark} alt="" draggable="false" className="w-full opacity-[0.07] pointer-events-none select-none" />
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer