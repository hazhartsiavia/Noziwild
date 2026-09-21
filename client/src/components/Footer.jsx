import React from 'react'
import Icone from "../assets/icone.png";

const Footer = () => {
    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{ font-family: "Geist", sans-serif; }
                `}
            </style>

            <footer className='flex flex-col justify-end bg-white pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden w-full'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

                        <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
                            {/* Logo : icone.png + nom */}
                            <a href="/" aria-label="Noziwild home" className="flex items-center gap-3">
                                <img src={Icone} alt="" className="h-10 w-auto object-contain" />
                                <span className="text-3xl font-semibold tracking-tight text-black">Noziwild</span>
                            </a>
                            <div className='w-full max-w-52 h-0.5 mt-8 bg-linear-to-r from-[#24212D] to-[#24212D]/0'></div>
                            <p className='text-sm text-black/60 mt-6 max-w-[350px] leading-relaxed'>Noziwild designs unforgettable trips across Madagascar, with local experts, handpicked stays and easy booking.</p>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-black font-medium'>Important Links</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Home</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>About</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Portfolio</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Contact</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>FAQ</a>
                            </div>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-black font-medium'>Social Links</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Twitter</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Instagram</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Youtube</a>
                                <a href="#" className='text-sm text-black/60 hover:text-black transition-colors'>Linkedin</a>
                            </div>
                        </div>

                        <div className="flex flex-col max-md:items-center max-md:text-start gap-2 items-end">
                            <p className="max-w-60">Making every customer feel valued—no matter the size of your audience.</p>
                            <div className="flex md:items-center gap-4 mt-3">
                                <a href="https://dribbble.com/prebuiltui" target="_blank" rel="noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dribbble size-5 hover:text-[#064434]" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"></path>
                                        <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"></path>
                                        <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"></path>
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/company/prebuiltui" target="_blank" rel="noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin size-5 hover:text-[#064434]" aria-hidden="true">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect width="4" height="12" x="2" y="9"></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                </a>
                                <a href="https://x.com/prebuiltui" target="_blank" rel="noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter size-5 hover:text-[#064434]" aria-hidden="true">
                                        <path
                                            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z">
                                        </path>
                                    </svg>
                                </a>
                                <a href="https://www.youtube.com/@prebuiltui" target="_blank" rel="noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube size-6 hover:text-[#064434]" aria-hidden="true">
                                        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17">
                                        </path>
                                        <path d="m10 15 5-3-5-3z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>

                    </div>

                    <div className='w-full h-0.5 mt-16 mb-4 bg-linear-to-r from-[#24212D]/0 via-[#24212D] to-[#24212D]/0'></div>

                    <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
                        <p className='text-xs text-black/60'>© 2026 Noziwild</p>
                        <div className="flex items-center gap-6 text-right">
                            <a href='#' className='text-xs text-black/60 hover:text-black transition-colors'>Terms & Conditions</a>
                            <div className='w-px h-4 bg-black/20'></div>
                            <a href='#' className='text-xs text-black/60 hover:text-black transition-colors'>Privacy Policy</a>
                        </div>
                    </div>

                    {/* Grand nom en fond : "Noziwild" a moins de lettres que "Prebuiltui", donc la taille max est augmentée */}
                    <div className="w-full flex justify-center mt-6 md:mt-12 md:mb-[-0.5%]">
                        <h1 className="text-center font-extrabold tracking-tighter leading-[0.70] text-zinc-100 text-[clamp(4.5rem,24vw,31rem)] pointer-events-none select-none">
                            Noziwild
                        </h1>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer