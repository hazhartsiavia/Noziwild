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
            <footer className='w-full bg-[#D5E8E2] p-3 md:p-5'>
                <div className='w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-[#074636] text-white px-5 sm:px-8 lg:px-14 pt-12 md:pt-16'>
                    <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

                        <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
                            {/* Logo officiel, version blanc et or pour le fond vert */}
                            <Link to="/" aria-label={t('home')} className="block">
                                <img src={LogoPrincipal} alt="" className="h-40 md:h-44 w-auto" />
                            </Link>
                            <div className='w-full max-w-52 h-0.5 mt-8 bg-linear-to-r from-[#C49849] to-[#C49849]/0'></div>
                            <p className='text-sm text-white/75 mt-6 max-w-[350px] leading-relaxed'>{t('tagline')}</p>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-[#E6C58A] font-medium'>{t('importantLinks')}</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                {LINKS.filter(({ to }) => !isHidden(to)).map(({ to, key }) => (
                                    <Link key={key} to={to} className='text-sm text-white/80 hover:text-white transition-colors'>{t(`links.${key}`)}</Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col max-md:items-center max-md:text-start gap-2 items-end">
                            <p className="max-w-60">{t('promise')}</p>
                        </div>

                    </div>

                    <div className='w-full h-px mt-12 md:mt-16 mb-4 bg-white/20'></div>

                    <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
                        <p className='text-xs text-white/70'>© 2026 Noziwild</p>
                    </div>

                    {/* Grand nom en fond : les lettres du logo officiel, en blanc très léger */}
                    <div className="w-full mt-6 md:mt-12 pb-6 md:pb-10">
                        <img src={Wordmark} alt="" draggable="false" className="w-full opacity-10 pointer-events-none select-none" />
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer