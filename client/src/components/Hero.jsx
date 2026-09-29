import React from "react";
import Tana from "../assets/images/Tana.png";
import down from "../assets/images/downDirection.png";

function Hero() {
  return (
    <>
      <div className="w-[95vw] lg:max-w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[600px] rounded-3xl overflow-hidden">

          {/* LEFT : contenu texte + formulaires */}
          <div className="relative bg-[#123C32] flex flex-col justify-center items-start py-16 lg:py-10 px-6 md:px-10 rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none">

            {/* Badge */}
            <a
              href="https://noziwild.com"
              className="inline-flex items-center gap-2 bg-white border border-[#C49849] rounded-full p-1 pr-3 text-sm"
            >
              <span className="bg-[#C49849] text-white text-xs px-3 py-1 rounded-full">
                Noziwild
              </span>
              <p className="flex items-center gap-2 text-[#C49849]">
                <span className="text-sm">MADAGASCAR</span>
                <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </a>

            {/* Titre */}
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[45px]/[1.1] font-semibold mt-5 max-w-full md:leading-[1.2]">
              Noziwild Madagascar, Explore the Untamed Beauty of the Island
            </h1>

            {/* Description */}
            <p className="text-white/75 text-sm sm:text-base leading-7 max-w-full lg:max-w-[90%] mt-5">
              Go Beyond the Ordinary: Embark on a Journey to Madagascar&apos;s Untamed Beauty, Where Adventure Meets Serenity
            </p>

            {/* Formulaire de recherche */}
            <form className="bg-white text-gray-500 rounded-lg px-4 sm:px-6 py-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4 w-full sm:w-auto my-6">

              <div className="flex flex-col w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                  </svg>
                  <label htmlFor="destinationInput" className="text-sm">Destination</label>
                </div>
                <input
                  list="destinations"
                  id="destinationInput"
                  type="text"
                  className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full"
                  placeholder="Type here"
                  required
                />
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                  </svg>
                  <label htmlFor="checkIn" className="text-sm">Check in</label>
                </div>
                <input
                  id="checkIn"
                  type="date"
                  className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full"
                />
              </div>

              <div className="flex flex-col items-start sm:items-center">
                <label htmlFor="guests" className="text-sm">Guests</label>
                <input
                  min={1}
                  max={4}
                  id="guests"
                  type="number"
                  className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16"
                  placeholder="0"
                />
              </div>

              <button className="flex items-center justify-center gap-1 rounded-md bg-[#C49849] py-3 px-4 text-white cursor-pointer w-full sm:w-auto sm:my-auto">
                <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                </svg>
                <span>Search</span>
              </button>
            </form>

            {/* Formulaire newsletter */}
            <form className="flex items-center gap-2 border border-white/20 bg-white/5 h-13 max-w-[440px] w-full rounded-full overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-full pl-6 outline-none text-sm bg-transparent text-white placeholder:text-white/50"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 shrink-0 w-32 sm:w-36 md:w-44 h-10 rounded-full text-sm text-white cursor-pointer mr-1.5"
              >
                Subscribe now
              </button>
            </form>

          </div>

          {/* RIGHT : image */}
          <div className="relative min-h-[300px] lg:min-h-full">
            <img
              src={Tana}
              alt="Madagascar landscape"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

        </div>
      </div>
    </>
  );
}

export default Hero;