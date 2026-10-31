import React from 'react'
import { Link } from '../i18n/router'
import Icone from "../assets/icone.png";
import { useT } from "../i18n/LanguageContext";

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
    return (
        <>
            <footer className='flex flex-col justify-end bg-white pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden w-full'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

                        <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
                            {/* Logo : icone.png + nom */}
                            <Link to="/" aria-label={t('home')} className="flex items-center gap-3">
                                <img src={Icone} alt="" className="h-10 w-auto object-contain" />
                                <span className="text-3xl font-semibold tracking-tight text-black">Noziwild</span>
                            </Link>
                            <div className='w-full max-w-52 h-0.5 mt-8 bg-linear-to-r from-[#24212D] to-[#24212D]/0'></div>
                            <p className='text-sm text-black/60 mt-6 max-w-[350px] leading-relaxed'>{t('tagline')}</p>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-forest font-medium'>{t('importantLinks')}</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                {LINKS.map(({ to, key }) => (
                                    <Link key={key} to={to} className='text-sm text-black/60 hover:text-black transition-colors'>{t(`links.${key}`)}</Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col max-md:items-center max-md:text-start gap-2 items-end">
                            <p className="max-w-60">{t('promise')}</p>
                        </div>

                    </div>

                    <div className='w-full h-0.5 mt-16 mb-4 bg-linear-to-r from-[#24212D]/0 via-[#24212D] to-[#24212D]/0'></div>

                    <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
                        <p className='text-xs text-black/60'>© 2026 Noziwild</p>
                    </div>

                    {/* Grand nom en fond : "Noziwild" a moins de lettres que "Prebuiltui", donc la taille max est augmentée */}
                    <div className="w-full flex justify-center mt-6 md:mt-12 md:mb-[-0.5%]">
                        <h1 className="font-sans text-center font-extrabold tracking-tighter leading-[0.70] text-zinc-100 text-[clamp(4.5rem,24vw,31rem)] pointer-events-none select-none">
                            Noziwild
                        </h1>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer