import React, { useState } from "react";
import Lemurien from "../assets/images/Lemurien.png";
import Tana from "../assets/images/Tana.png";
import down from "../assets/images/downDirection.png";

function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="w-full mx-auto overflow-hidden  px-2 lg:px-10">
      <div
        className="
          grid
          grid-cols-1 grid-rows-2
          lg:grid-cols-2 lg:grid-rows-1
          w-full
          md:h-[1050px] lg:h-[80vh]
          lg:mt-4
          
        "
      >
        {/* LEFT */}
        <div
          className="
            h-full
            py-10 
            overflow-hidden
            bg-[#123C32]
            flex flex-col justify-center items-start
            rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none py-20 lg:py-5 ld:gap-20
          "
        >
          <div className="w-full px-10 lg:mx-0 md:mt-0 flex flex-col items-start">
            {/* Badge */}
            <a
              href="https://noziwild.com"
              className="
                inline-flex items-center gap-2
                bg-white
                border border-[#C49849]
                rounded-full
                p-1 pr-3
                text-sm
              "
            >
              <span className="bg-[#C49849] text-white text-xs px-3 py-1 rounded-full">
                Noziwild
              </span>

              <p className="flex items-center gap-2 text-[#C49849]">
                <span className="text-sm">
                  MADAGASCAR
                </span>

                <svg
                  width="6"
                  height="9"
                  viewBox="0 0 6 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m1 1 4 3.5L1 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            </a>

            {/* Title */}
            <h1
              className="
                text-white
                text-3xl
                md:text-4xl
                lg:text-[45px]/[1.1]
                font-semibold
                mt-5
                max-w-full
                pr-2 lg:pr-0
                md:leading-[1.2]
              "
            >
              Noziwild Madagascar, Explore the Untamed Beauty of the Island
            </h1>

            {/* Description */}
            <p
              className="
                text-white/75
                text-base leading-7
                max-w-full
                pr-2 lg:pr-8 lg:max-w-full
                mt-5
              "
            >
              Go Beyond the Ordinary: Embark on a Journey to Madagascar&apos;s
              Untamed Beauty, Where Adventure Meets Serenity
            </p>
            <form className='bg-white text-gray-500 rounded-lg px-6 py-4  flex sm:flex-wrap md:flex-wrap-none flex-col flex-row max-md:items-start gap-4 max-md:mx-auto my-6'>

                <div>
                    <div className='flex items-center gap-2'>
                        <svg className="w-4 h-4 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                        </svg>
                        <label htmlFor="destinationInput">Destination</label>
                    </div>
                    <input list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />
                </div>

                <div>
                    <div className='flex items-center gap-2'>
                        <svg className="w-4 h-4 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                        </svg>
                        <label htmlFor="checkIn">Check in</label>
                    </div>
                    <input id="checkIn" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
                </div>
                <div className='flex flex-col items-center'>
                    <label htmlFor="guests">Guests</label>
                    <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
                </div>

                <button className='flex items-center justify-center gap-1 rounded-md bg-[#C49849] py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
                    <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                    </svg>
                    <span>Search</span>
                </button>
            </form>

            {/* Form */}
            <form
              className="
                flex items-center
                gap-2
                border border-white/20
                bg-white/5
                h-13
                max-w-[440px]
                w-full
                rounded-full
                overflow-hidden
                mt-6
              "
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="
                  w-full
                  h-full
                  pl-6
                  outline-none
                  text-sm
                  bg-transparent
                  text-white
                  placeholder:text-white/50
                "
                required
              />

              <button
                type="submit"
                className="
                  bg-indigo-600
                  hover:bg-indigo-500
                  shrink-0
                  w-36 md:w-44
                  h-10
                  rounded-full
                  text-sm
                  text-white
                  cursor-pointer
                  mr-1.5
                "
              >
                Subscribe now
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="
            h-full
            min-h-0
            overflow-hidden
            bg-[#123C32]
            relative
            lg:rounded-r-3xl
            rounded-b-3xl md:rounded-b-none
          "
        >
          <img
            src={Tana}
            alt="Lemurien de Madagascar"
            className="
              absolute inset-0
              w-full h-full
              object-cover
              object-center
            "
          />
        </div>
      </div>
      <div className="w-full h-full  bg-[#FFFFFF] flex items-center justify-center">
        <img
            src={down}
            alt="user"
            className="md:size-40 border border-white/20 object-contain "
          />
      </div>
    </section>
  );
}

export default Hero;
