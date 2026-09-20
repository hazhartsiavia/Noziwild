import React from 'react'
import NosyIranja from "../assets/images/NosyIranja.png";

/* Constantes partagées : mêmes valeurs que dans Explore.jsx et Choose.jsx */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[95vw]"
const META_TEXT = "text-xs sm:text-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full"

// Contenu de la bannière : à modifier ici
const banner = {
  image: NosyIranja,
  title: 'Create your perfect Madagascar getaway.',
  subtitle: 'Send us an email, contact us on WhatsApp, or call us directly to start planning your tailor-made journey.',
  cta: 'Request a Quote',
  terms: '*T&C Apply',
  label: 'sponsored',
  logo: null,            // ex: import PartnerLogo from "../assets/images/partner.svg" puis logo: PartnerLogo
  logoAlt: 'Partner logo',
}


function Testimaonials() {
  return (
    <div> 
            
        <div className="flex flex-col items-center justify-center ">
        <div className="w-[90vw] lg:max-w-[95vw] mt-2 mb-2 md:mb-4 text-end">
            <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-[35px] font-medium text-slate-900 leading-[1.15] tracking-tight mb-3 md:mb-5">
            A tailor-made trip to Madagascar?
            </h2>
        </div>
        <div className={`${SECTION_WIDTH} relative overflow-hidden rounded-2xl bg-slate-950 text-white`}>

            {/* Image de fond assombrie */}
            <img
            src={banner.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />

            {/* Pastille "sponsored" */}
            <span className="absolute top-3 right-4 md:top-4 md:right-6 z-10 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-medium leading-tight text-slate-800">
            {banner.label}
            </span>

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 px-6 pt-12 pb-7 md:px-14 md:py-10 md:min-h-[187px]">

            {/* Texte */}
            <div className="max-w-full md:max-w-[62%]">
                <h2 className="text-2xl md:text-3xl font-medium tracking-tight leading-[1.25]">
                {banner.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base font-medium">
                {banner.subtitle}
                </p>
            </div>

            {/* Bouton + logo partenaire */}
            <div className="flex items-center gap-6 md:gap-10 shrink-0 md:pt-4">
                <div className="flex flex-col items-center gap-2.5">
                <button className={`bg-[#C49849] hover:bg-white hover:text-slate-900 active:scale-95 transition text-white ${BUTTON}`}>
                    {banner.cta}
                </button>
                <span className={`${META_TEXT} font-medium`}>{banner.terms}</span>
                </div>

                {banner.logo ? (
                <img src={banner.logo} alt={banner.logoAlt} className="h-9 md:h-10 w-auto" />
                ) : (
                <div className="flex flex-col leading-none" aria-label={banner.logoAlt}>
                    <span className="text-3xl font-extrabold tracking-tight">logo</span>
                    <span className="mt-0.5 self-end text-[9px] text-white/70">by partner</span>
                </div>
                )}
            </div>

            </div>
        </div>
        </div>      
    </div>
  )
}

export default Testimaonials
