import React, { useState } from "react";
import Lemurien from "../assets/images/Lemurien.png";
import Tana from "../assets/images/Tana.png";

function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="w-full mx-auto overflow-hidden rounded-3xl px-10">
      <div
        className="
          grid
          grid-cols-1 grid-rows-2
          md:grid-cols-2 md:grid-rows-1
          w-full
          h-[760px] md:h-[650px]
          min-h-0
        "
      >
        {/* LEFT */}
        <div
          className="
            h-full
            min-h-0
            overflow-hidden
            bg-[#123C32]
            px-8 py-10
            md:px-12 lg:px-16
            flex flex-col justify-center
            rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none
          "
        >
          <div className="w-full max-w-[610px] mx-auto lg:mx-0">
            {/* Badge */}
            <a
              href="#"
              className="
                inline-flex items-center gap-2
                bg-indigo-50
                border border-indigo-200
                rounded-full
                p-1 pr-3
                text-sm
              "
            >
              <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                NEW
              </span>

              <p className="flex items-center gap-2 text-indigo-600">
                <span className="text-sm">
                  Try 30 days free trial option
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
                text-4xl
                md:text-5xl
                lg:text-[52px]/[1.1]
                font-semibold
                mt-5
                max-w-[610px]
              "
            >
              MADAGASCAR, WILDLY YOURS
            </h1>

            {/* Description */}
            <p
              className="
                text-white/75
                text-base leading-7
                max-w-md
                mt-5
              "
            >
              Go Beyond the Ordinary: Embark on a Journey to Madagascar&apos;s
              Untamed Beauty, Where Adventure Meets Serenity
            </p>

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

            {/* Avatars + Stars */}
            <div className="flex items-center mt-8">
              <div className="flex -space-x-3 pr-3">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
                  alt="user"
                  className="size-9 object-cover rounded-full border-2 border-[#123C32]"
                />

                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                  alt="user"
                  className="size-9 object-cover rounded-full border-2 border-[#123C32]"
                />

                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                  alt="user"
                  className="size-9 object-cover rounded-full border-2 border-[#123C32]"
                />

                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
                  alt="user"
                  className="size-9 object-cover rounded-full border-2 border-[#123C32]"
                />
              </div>

              <div>
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#FF8F20"
                        stroke="#FF8F20"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.123 2.123 0 0 0 1.597-1.16z" />
                      </svg>
                    ))}
                </div>

                <p className="text-xs text-white/60">
                  Used by 10,000+ users
                </p>
              </div>
            </div>
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
    </section>
  );
}

export default Hero;
