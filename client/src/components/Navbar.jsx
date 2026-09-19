import React from 'react'
import icone from "../assets/icone.png";

function Navbar() {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{
                        font-family: "Geist", sans-serif;
                    }
                `}
            </style>
            <nav className="bg-white w-full px-5 pb-4 mb:pb-1 pt-2 md:pt-4 lg:px-10 flex items-center justify-between relative">
                <div className="flex items-center gap-2 lg:gap-4">
                    <a href="https://prebuiltui.com">
                        <img src={icone} alt="Logo" className="h-12 lg:h-18" /> 
                    </a>
                    Noziwild
                    <div className="hidden md:flex items-center px-20 gap-10">
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 text-sm text-zinc-800 cursor-pointer bg-transparent border-0 py-2">
                                All Pages
                                <svg className="transition-transform group-hover:rotate-180" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 4 4 4-4" stroke="#71717b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <a href="#" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Landing Pages</a>
                                <a href="#" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">About Pages</a>
                                <a href="#" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Contact Pages</a>
                                <a href="#" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Blog Pages</a>
                            </div>
                        </div>
                        <a href="#" className="text-sm text-zinc-500 hover:text-zinc-800">Nos Circuits</a>
                        <a href="#" className="text-sm text-zinc-500 hover:text-zinc-800">Pricing</a>
                        <a href="#" className="text-sm text-zinc-500 hover:text-zinc-800">Blogs</a>
                    </div>
                </div>

                <button className="hidden md:flex items-center gap-2.5 bg-[#C49849] text-zinc-50 hover:text-zinc-200 text-sm font-medium pl-5 pr-2 py-2 rounded-full cursor-pointer border-0">
                    Booking
                    <span className="size-7 rounded-full bg-white flex items-center justify-center">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                </button>

                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 cursor-pointer bg-transparent border-0 p-1">
                    <span className={`block w-6 h-0.5 bg-zinc-800 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-zinc-800 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-zinc-800 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>

                {menuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-t border-zinc-200 flex flex-col p-5 gap-1 md:hidden z-50">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm text-zinc-800 hover:bg-zinc-50 bg-transparent border-0 cursor-pointer">
                            All Pages
                            <svg className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 4 4 4-4" stroke="#71717b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        {dropdownOpen && (
                            <div className="flex flex-col pl-4">
                                <a href="#" className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Landing Pages</a>
                                <a href="#" className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">About Pages</a>
                                <a href="#" className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Contact Pages</a>
                                <a href="#" className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Blog Pages</a>
                            </div>
                        )}
                        <a href="#" className="px-4 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Company</a>
                        <a href="#" className="px-4 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Pricing</a>
                        <a href="#" className="px-4 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Blogs</a>
                        <button className="flex items-center justify-center gap-2.5 bg-linear-to-r from-zinc-950 to-zinc-500 text-zinc-50 text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer border-0 mt-3 w-fit">
                            Booking
                            <span className="size-7 rounded-full bg-white flex items-center justify-center">
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                        </button>
                    </div>
                )}
            </nav>
        </>
    )
}

export default Navbar
