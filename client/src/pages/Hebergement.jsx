import React, { useRef, useLayoutEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CTA from "../components/Cta";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import AdvantagesBg from "../assets/images/AdvantagesBg.png";
import transportBg from "../assets/images/transportBg.jpg";
import transport1 from "../assets/images/transport1.png";
import transport2 from "../assets/images/transport2.png";
import transport3 from "../assets/images/transport3.png";
import transport4 from "../assets/images/transport4.png";
import transport5 from "../assets/images/transport5.png";
import FAQIllust from "../assets/images/FAQ.png";
import transportVideo from "../assets/videos/video.mp4";

gsap.registerPlugin(ScrollTrigger);


/* ====================================================================
   GENERAL CONTENT
==================================================================== */

const content = {
  title: "Creating Unforgettable Journeys, Together",

  text: "From the first idea to the last sunset, our team plans every detail so you can simply enjoy the journey.",

  label: "Our Promise",

  image: AdvantagesBg,

  imageAlt: "A traveler jumping with a backpack",

  video: transportVideo,
};


/* ====================================================================
   ICON BOX
==================================================================== */

const IconBox = ({ children, className = "" }) => (
  <div
    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#C49849] text-white shadow-sm ${className}`}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {children}
    </svg>
  </div>
);


/* ====================================================================
   FEATURE ICONS
==================================================================== */

const RouteIcon = () => (
  <IconBox>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </IconBox>
);


const LuggageIcon = () => (
  <IconBox>
    <path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2" />
    <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
    <path d="M10 20v2" />
    <path d="M14 20v2" />
  </IconBox>
);


const HotelIcon = () => (
  <IconBox>
    <path d="M10 22v-6.57" />
    <path d="M14 15.43V22" />
    <path d="M15 16a5 5 0 0 0-6 0" />
    <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
    <rect x="4" y="2" width="16" height="20" rx="2" />
  </IconBox>
);


const CompassIcon = () => (
  <IconBox>
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
  </IconBox>
);


/* ====================================================================
   WHY CHOOSE US FEATURES
==================================================================== */

const features = [
  {
    id: 1,
    title: "Numerous Routes",
    text: "Explore a wide range of routes across Madagascar.",
    icon: RouteIcon,
  },

  {
    id: 2,
    title: "Easy Booking",
    text: "Book your transport easily and plan your journey with confidence.",
    icon: LuggageIcon,
  },

  {
    id: 3,
    title: "Accommodation",
    text: "Discover carefully selected places to stay along your journey.",
    icon: HotelIcon,
  },

  {
    id: 4,
    title: "Local Guidance",
    text: "Get helpful guidance from people who know Madagascar.",
    icon: CompassIcon,
  },
];


/* ====================================================================
   HOW IT WORKS DATA
==================================================================== */

const howItWorks = [
  {
    number: "01",
    title: "Choose Your Destination",
    text: "Select your destination and tell us where your journey begins.",
  },

  {
    number: "02",
    title: "Select Your Vehicle",
    text: "Explore our transport options and choose the one that best suits your needs.",
  },

  {
    number: "03",
    title: "Customize Your Trip",
    text: "Choose your travel date, departure time and any additional services you need.",
  },

  {
    number: "04",
    title: "Confirm Your Booking",
    text: "Review your choices and confirm your transport to get ready for your journey.",
  },
];


/* ====================================================================
   ACCOMMODATION DATA
==================================================================== */

const accommodationTypes = [
  {
    id: 1,

    image: transport1,

    category: "Beach & Island",

    title: "Beachfront Escapes",

    text: "Wake up by the ocean and enjoy the beauty of Madagascar's coastline.",
  },

  {
    id: 2,

    image: transport2,

    category: "Nature",

    title: "Lodges & Retreats",

    text: "Stay close to nature in peaceful places surrounded by Madagascar's landscapes.",
  },

  {
    id: 3,

    image: transport3,

    category: "Boutique",

    title: "Boutique Stays",

    text: "Discover charming places designed for comfort, character and memorable moments.",
  },

  {
    id: 4,

    image: transport4,

    category: "Unique Stays",

    title: "Exceptional Places",

    text: "Make your journey special with accommodations that are part of the experience.",
  },
];


/* ====================================================================
   FAQ
==================================================================== */

function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: "How can I book my transport?",
      answer:
        "Choose your destination, select the transport option that suits your journey, customize your trip and confirm your booking.",
    },

    {
      question: "What types of transport are available?",
      answer:
        "We offer a variety of land and sea transport options, including 4x4 vehicles, quads, vans, motorbikes, bicycles, catamarans, speedboats and boats.",
    },

    {
      question: "Can I book accommodation with my transport?",
      answer:
        "Yes. Accommodation options can be part of your travel planning, allowing you to combine transport and places to stay for a smoother journey.",
    },

    {
      question: "Can I customize my journey?",
      answer:
        "Yes. You can choose your destination, travel date, departure time and additional services according to your needs.",
    },
  ];

  return (
    <section className="w-full px-5 py-16 sm:px-8 lg:px-10 lg:py-24">

      <div className="mx-auto flex max-w-7xl flex-col items-start justify-center gap-8 md:flex-row">

        {/* IMAGE */}

        <img
          className="h-[450px] w-full max-w-sm rounded-xl object-cover"
          src={FAQIllust}
          alt="Travel illustration"
        />


        {/* CONTENT */}

        <div className="w-full max-w-2xl">

          <p className="text-md font-medium text-[#074536]">
            FAQ's
          </p>

          <h2 className="text-4xl font-semibold text-[#0F172B]">
            Looking for answers?
          </h2>

          <p className="mt-2 pb-4 text-md text-slate-500">
            Everything you need to know about planning your journey across Madagascar.
          </p>


          {faqs.map((faq, index) => (

            <div
              className="cursor-pointer border-b border-slate-200 py-4"
              key={index}
              onClick={() =>
                setOpenIndex(
                  openIndex === index ? null : index
                )
              }
            >

              <div className="flex items-center justify-between gap-5">

                <h3 className="text-md font-medium text-[#1D293D]">
                  {faq.question}
                </h3>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    openIndex === index
                      ? "rotate-180"
                      : ""
                  } shrink-0 transition-all duration-500 ease-in-out`}
                >
                  <path
                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke="#1D293D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>


              <p
                className={`
                  max-w-lg
                  overflow-hidden
                  text-md
                  text-slate-500
                  transition-all
                  duration-500
                  ease-in-out

                  ${
                    openIndex === index
                      ? "max-h-[300px] translate-y-0 pt-4 opacity-100"
                      : "max-h-0 -translate-y-2 opacity-0"
                  }
                `}
              >
                {faq.answer}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}


/* ====================================================================
   OPTIONAL ICON
==================================================================== */

function Icon({ name, className = "w-8 h-8" }) {

  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {

    case "brain":

      return (
        <svg {...common}>

          <path d="M9 3.5a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10a3 3 0 0 0 1.5 2.6V13a3 3 0 0 0 3 3h.5" />

          <path d="M15 3.5a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 10a3 3 0 0 1-1.5 2.6V13a3 3 0 0 1-3 3h-.5" />

          <path d="M9 3.5v17M15 3.5v17" />

        </svg>
      );

    default:
      return null;
  }
}


/* ====================================================================
   HERO DATA
==================================================================== */

const defaultImages = [
  {
    url: transport1,
    alt: "Madagascar travel landscape",
  },

  {
    url: transport2,
    alt: "Madagascar nature landscape",
  },

  {
    url: transport4,
    alt: "Traveler in Madagascar",
  },

  {
    url: transport3,
    alt: "Madagascar coastal landscape",
  },

  {
    url: transport5,
    alt: "Madagascar coastline",
  },
];


const defaultHeights = [
  "h-40 sm:h-44 lg:h-52",

  "h-48 sm:h-56 lg:h-64",

  "h-56 sm:h-64 lg:h-72 -mt-6",

  "h-48 sm:h-56 lg:h-64",

  "h-40 sm:h-44 lg:h-52",
];


const META_TEXT = "text-xs sm:text-sm";


/* ====================================================================
   TRANSPORT DATA
==================================================================== */

const transportTypes = [

  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=700&q=80",
    category: "Land",
    duration: "Roads & trails",
    title: "4×4",
  },

  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&q=80",
    category: "Land",
    duration: "Difficult terrain",
    title: "Quad",
  },

  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&q=80",
    category: "Land",
    duration: "Groups & comfort",
    title: "Vans",
  },

  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=700&q=80",
    category: "Land",
    duration: "Freedom & speed",
    title: "Motorbike",
  },

  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=700&q=80",
    category: "Land",
    duration: "Relaxed rides",
    title: "Bicycle",
  },

  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80",
    category: "Sea",
    duration: "Islands & coastline",
    title: "Catamaran",
  },

  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=700&q=80",
    category: "Sea",
    duration: "Fast journeys",
    title: "Speedboat",
  },

  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1500627964684-141351970a7e?w=700&q=80",
    category: "Sea",
    duration: "Crossings & fishing",
    title: "Boat",
  },

];


/* ====================================================================
   FEATURE CARD
==================================================================== */

function FeatureCard({ feature }) {

  const IconComponent = feature.icon;

  return (

    <div
      className="
        why-card
        flex
        h-full
        flex-col
        justify-between
        rounded-2xl
        border
        border-white/10
        bg-white/10
        p-4
        text-left
        shadow-[0_16px_40px_rgba(15,23,42,0.12)]
        backdrop-blur-sm
        sm:p-5
      "
    >

      <div className="mb-4">
        <IconComponent />
      </div>

      <h3 className="text-lg font-medium text-white sm:text-xl">
        {feature.title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
        {feature.text}
      </p>

    </div>
  );
}


/* ====================================================================
   WHY CHOOSE US
==================================================================== */

function WhyChooseUs() {

  const sectionRef = useRef(null);

  const bgBoxRef = useRef(null);

  const labelRef = useRef(null);

  const textColRef = useRef(null);


  useLayoutEffect(() => {

    const ctx = gsap.context(() => {

      const cards = gsap.utils.toArray(".why-card");

      const bgBox = bgBoxRef.current;


      gsap.set(labelRef.current, {
        opacity: 0,
        y: 20,
      });


      gsap.set(cards, {
        y: 60,
        opacity: 0,
      });


      const tl = gsap.timeline({

        scrollTrigger: {

          trigger: sectionRef.current,

          start: "top bottom",

          end: "bottom bottom",

          scrub: 1,

          invalidateOnRefresh: true,
        },
      });


      /* TEXT */

      if (textColRef.current) {

        tl.to(
          textColRef.current,
          {
            opacity: 0,
            x: -60,
            ease: "power2.in",
            duration: 3,
          },
          0
        );

      }


      /* BACKGROUND BOX */

      tl.to(
        bgBox,
        {
          width: "calc(100vw - 80px)",

          height: "calc(100vh - 80px)",

          borderRadius: 10,

          ease: "power2.inOut",

          duration: 5,
        },
        0
      );


      /* LABEL */

      tl.to(
        labelRef.current,
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.8,
        },
        1.6
      );


      /* CARDS */

      tl.to(
        cards,
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power2.out",
          duration: 1,
        },
        1.8
      );


      const onLoad = () => {
        ScrollTrigger.refresh();
      };


      window.addEventListener("load", onLoad);


      return () => {
        window.removeEventListener("load", onLoad);
      };

    }, sectionRef);


    return () => ctx.revert();

  }, []);


  return (

    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        height: "150vh",
      }}
    >

      <div className="sticky top-0 h-screen w-full overflow-hidden">


        {/* ============================================================
            BACKGROUND BOX
        ============================================================ */}

        <div
          ref={bgBoxRef}
          className="
            absolute
            left-1/2
            z-20
            flex
            -translate-x-1/2
            overflow-hidden
            rounded-3xl
            bg-slate-900
          "
          style={{
            width: "95vw",

            height: "150px",

            willChange:
              "width, height, border-radius",
          }}
        >

          <img
            src={content.image}
            alt={content.imageAlt}
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />


          {/* DARK OVERLAY */}

          <div className="absolute inset-0 bg-black/30" />


          <div
            ref={textColRef}
            className="
              relative
              z-10
              flex
              h-full
              w-full
              flex-col
              justify-between
              p-5
              md:p-8
            "
          >

            {/* LABEL */}

            <p
              ref={labelRef}
              className="
                flex
                items-start
                gap-2
                text-lg
                font-medium
                text-white
                md:text-xl
              "
            >

              <span
                className="
                  mt-2
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-white
                "
                aria-hidden="true"
              />

              {content.label}

            </p>


            {/* FEATURES */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
                md:grid-cols-4
                md:gap-5
              "
            >

              {features.map((feature) => (

                <FeatureCard
                  key={feature.id}
                  feature={feature}
                />

              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


/* ====================================================================
   ACCOMMODATION CARD
==================================================================== */

function AccommodationCard({ accommodation }) {

  return (

    <article
      className="
        accommodation-card
        group
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-sm
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-xl
      "
    >

      <div className="relative aspect-[4/5] overflow-hidden">

        <img
          src={accommodation.image}
          alt={accommodation.title}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-105
          "
        />


        {/* OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/80
            via-black/20
            to-transparent
          "
        />


        {/* CATEGORY */}

        <span
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-white/90
            px-3
            py-1.5
            text-[11px]
            font-medium
            text-slate-800
            backdrop-blur-sm
          "
        >
          {accommodation.category}
        </span>


        {/* CARD CONTENT */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            p-5
            text-white
          "
        >

          <h3
            className="
              text-xl
              font-medium
              leading-tight
              sm:text-2xl
            "
          >
            {accommodation.title}
          </h3>


          <p
            className="
              mt-2
              max-w-[280px]
              text-sm
              leading-relaxed
              text-white/80
            "
          >
            {accommodation.text}
          </p>


          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              text-sm
              font-medium
            "
          >

            <span>
              Discover more
            </span>

            <span
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              ↗
            </span>

          </div>

        </div>

      </div>

    </article>
  );
}


/* ====================================================================
   ACCOMMODATION
==================================================================== */

function Accommodation() {

  const sectionRef = useRef(null);


  useLayoutEffect(() => {

    const ctx = gsap.context(() => {

      const cards = gsap.utils.toArray(
        ".accommodation-card"
      );


      gsap.fromTo(
        cards,

        {
          y: 50,
          opacity: 0,
        },

        {
          y: 0,
          opacity: 1,

          duration: 0.8,

          stagger: 0.12,

          ease: "power3.out",

          scrollTrigger: {

            trigger: sectionRef.current,

            start: "top 80%",

            toggleActions:
              "play none none reverse",
          },
        }
      );


      const refresh = () => {
        ScrollTrigger.refresh();
      };


      window.addEventListener("load", refresh);


      return () => {
        window.removeEventListener("load", refresh);
      };

    }, sectionRef);


    return () => ctx.revert();

  }, []);


  return (

    <section
      ref={sectionRef}
      className="
        w-full
        bg-white
        px-5
        py-16
        sm:px-8
        lg:px-10
        lg:py-24
      "
    >

      <div className="mx-auto max-w-[1440px]">


        {/* ============================================================
            HEADER
        ============================================================ */}

        <div
          className="
            mb-10
            flex
            flex-col
            gap-5
            md:mb-14
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div className="max-w-2xl">

            <p
              className="
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#C49849]
              "
            >
              Stay your way
            </p>


            <h2
              className="
                text-3xl
                font-medium
                leading-[1.05]
                tracking-[-0.04em]
                text-[#0F172B]
                sm:text-4xl
                lg:text-5xl
              "
            >
              Find a place to stay,
              <br />
              make it part of the journey.
            </h2>

          </div>


          <p
            className="
              max-w-md
              text-sm
              leading-relaxed
              text-slate-500
              sm:text-base
            "
          >
            From tropical escapes to peaceful retreats,
            discover accommodation options that complement
            every journey across Madagascar.
          </p>

        </div>


        {/* ============================================================
            CARDS
        ============================================================ */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          {accommodationTypes.map(
            (accommodation) => (

              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
              />

            )
          )}

        </div>

      </div>

    </section>
  );
}


/* ====================================================================
   HOW IT WORKS
==================================================================== */

function HowItWorks() {

  const sectionRef = useRef(null);


  useLayoutEffect(() => {

    const ctx = gsap.context(() => {

      const items =
        gsap.utils.toArray(".how-step");


      gsap.fromTo(
        items,

        {
          y: 60,
          opacity: 0,
        },

        {
          y: 0,
          opacity: 1,

          duration: 1.7,

          stagger: 0.35,

          ease: "power3.out",

          scrollTrigger: {

            trigger: sectionRef.current,

            start: "50% bottom",

            toggleActions:
              "play none none reverse",
          },
        }
      );

    }, sectionRef);


    return () => ctx.revert();

  }, []);


  return (

    <section
      ref={sectionRef}
      className="
        w-full
        px-5
        py-16
        sm:px-8
        lg:px-10
        lg:py-20
      "
    >

      <div className="mx-auto max-w-[1440px]">


        {/* TITLE */}

        <div className="mb-12 max-w-3xl lg:mb-8">

          <h2
            className="
              text-3xl
              font-medium
              leading-[0.98]
              tracking-[-0.04em]
              text-[#0F0F0F]
              sm:text-4xl
            "
          >
            How it works?
          </h2>

        </div>


        {/* STEPS */}

        <div
          className="
            grid
            grid-cols-1
            gap-px
            overflow-hidden
            rounded-[28px]
            bg-[#D8D6D1]
            md:grid-cols-2
            lg:grid-cols-4
          "
        >

          {howItWorks.map((step) => (

            <article
              key={step.number}
              className="
                how-step
                group
                flex
                min-h-[340px]
                flex-col
                justify-between
                bg-[#D5E8E2]
                p-7
                sm:p-8
                lg:p-9
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    text-lg
                    font-semibold
                    text-[#53615D]
                  "
                >
                  {step.number}
                </span>


                <span
                  className="
                    text-2xl
                    text-[#111]
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                >
                  ↗
                </span>

              </div>


              <div className="mt-5 md:mt-16">

                <h3
                  className="
                    max-w-[280px]
                    text-lg
                    font-semibold
                    uppercase
                    leading-[1.3]
                    tracking-[0.06em]
                    text-[#26332F]
                    sm:text-xl
                    lg:text-[22px]
                  "
                >
                  {step.title}
                </h3>


                <p
                  className="
                    mt-1
                    max-w-[300px]
                    text-base
                    leading-relaxed
                    text-[#53615D]
                    md:mt-5
                  "
                >
                  {step.text}
                </p>

              </div>

            </article>

          ))}

        </div>

      </div>

    </section>
  );
}


/* ====================================================================
   TRANSPORT CARD
==================================================================== */

function TransportCard({ transport }) {

  return (

    <a
      href="#"
      className="
        group
        flex
        flex-col
        overflow-hidden
        rounded-xl
        bg-white
        text-slate-800
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >

      <div className="aspect-[4/3] overflow-hidden">

        <img
          src={transport.image}
          alt={transport.title}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
        />

      </div>


      <div className="px-5 pb-6 pt-5">

        <p
          className="
            flex
            items-center
            gap-3
            text-xs
            text-[#0F172B]
            sm:text-sm
          "
        >

          <span>
            {transport.category}
          </span>

          <span className="h-4 w-px bg-slate-300" />

          <span>
            {transport.duration}
          </span>

        </p>


        <h3
          className="
            mt-3
            text-xl
            font-medium
            leading-snug
            text-[#0F172B]
            md:text-2xl
          "
        >
          {transport.title}
        </h3>

      </div>

    </a>
  );
}


/* ====================================================================
   TRANSPORT GRID
==================================================================== */

function TransportGrid({
  transports = transportTypes,
}) {

  const [activeFilter, setActiveFilter] =
    React.useState("All");


  const sectionRef = useRef(null);


  const filters = [

    {
      id: "All",
      label: "All transport",
    },

    {
      id: "Land",
      label: "Land",
    },

    {
      id: "Sea",
      label: "Sea",
    },

  ];


  const filteredTransports =
    activeFilter === "All"
      ? transports
      : transports.filter(
          (transport) =>
            transport.category ===
            activeFilter
        );


  useLayoutEffect(() => {

    const ctx = gsap.context(() => {

      const cards =
        gsap.utils.toArray(
          ".transport-card"
        );


      gsap.fromTo(
        cards,

        {
          y: 40,
          opacity: 0,
        },

        {
          y: 0,
          opacity: 1,

          duration: 0.6,

          stagger: 0.08,

          ease: "power3.out",
        }
      );

    }, sectionRef);


    return () => ctx.revert();

  }, [activeFilter]);


  return (

    <section
      ref={sectionRef}
      className="w-full bg-[#D5E8E2]"
    >


      {/* TOP CURVE */}

      <div
        className="
          mb-5
          h-10
          w-full
          rounded-b-4xl
          bg-white
          md:mb-16
        "
      />


      <div
        className="
          mx-auto
          max-w-[1300px]
          px-6
        "
      >


        {/* ============================================================
            FILTERS
        ============================================================ */}

        <div className="relative mb-12">


          {/* DESKTOP LINE */}

          <div
            className="
              absolute
              left-0
              right-0
              top-[54px]
              hidden
              h-[2px]
              bg-slate-300
              sm:block
            "
          />


          {/* ACTIVE LINE */}

          <div
            className="
              absolute
              left-0
              top-[54px]
              hidden
              h-[2px]
              bg-[#C39649]
              transition-all
              duration-500
              sm:block
            "
            style={{
              width:
                activeFilter === "All"
                  ? "33.33%"
                  : activeFilter === "Land"
                  ? "66.66%"
                  : "100%",
            }}
          />


          {/* MOBILE FILTERS */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:hidden
            "
          >

            {filters.map((filter) => {

              const active =
                activeFilter ===
                filter.id;


              return (

                <button
                  key={filter.id}
                  onClick={() =>
                    setActiveFilter(
                      filter.id
                    )
                  }
                  className={`
                    flex
                    min-h-[60px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-3
                    text-center
                    text-sm
                    font-medium
                    transition-all
                    duration-300

                    ${
                      active
                        ? "border-slate-300 bg-white text-[#0F172B] shadow-sm"
                        : "border-slate-300 bg-transparent text-[#0F172B]"
                    }
                  `}
                >
                  {filter.label}
                </button>

              );
            })}

          </div>


          {/* DESKTOP FILTERS */}

          <div
            className="
              relative
              hidden
              grid-cols-3
              sm:grid
            "
          >

            {filters.map((filter) => {

              const active =
                activeFilter ===
                filter.id;


              return (

                <button
                  key={filter.id}
                  onClick={() =>
                    setActiveFilter(
                      filter.id
                    )
                  }
                  className="
                    group
                    relative
                    flex
                    flex-col
                    items-center
                    pb-8
                  "
                >

                  <span
                    className={`
                      text-sm
                      font-medium
                      transition-colors
                      duration-300
                      md:text-base

                      ${
                        active
                          ? "text-[#0F172B]"
                          : "text-slate-500 group-hover:text-slate-800"
                      }
                    `}
                  >
                    {filter.label}
                  </span>


                  <span
                    className={`
                      absolute
                      top-[48px]
                      z-10
                      rounded-full
                      transition-all
                      duration-300

                      ${
                        active
                          ? "h-5 w-5 border-2 border-[#C39649] bg-[#D5E8E2]"
                          : "h-3 w-3 bg-slate-300"
                      }
                    `}
                  >

                    {active && (

                      <span
                        className="
                          absolute
                          left-1/2
                          top-1/2
                          h-2
                          w-2
                          -translate-x-1/2
                          -translate-y-1/2
                          rounded-full
                          bg-[#C39649]
                        "
                      />

                    )}

                  </span>

                </button>

              );
            })}

          </div>

        </div>


        {/* ============================================================
            TRANSPORT CARDS
        ============================================================ */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            sm:grid-cols-2
            lg:grid-cols-4
            lg:gap-8
          "
        >

          {filteredTransports.map(
            (transport, i) => {

              const offset =
                i % 4 === 1 ||
                i % 4 === 3
                  ? "lg:mt-10"
                  : "";


              return (

                <div
                  className={`transport-card ${offset}`}
                  key={transport.id}
                >

                  <TransportCard
                    transport={
                      transport
                    }
                  />

                </div>

              );
            }
          )}

        </div>

      </div>


      {/* BOTTOM CURVE */}

      <div
        className="
          mt-5
          h-10
          w-full
          rounded-t-4xl
          bg-white
          sm:mt-10
        "
      />

    </section>
  );
}


/* ====================================================================
   HERO + COMPLETE PAGE
==================================================================== */

export default function TravelHero({

  eyebrow = "One journey. Many ways.",

  title = "Explore Madagascar, your way.",

  images = defaultImages,

  heights = defaultHeights,

  centerIndex,

  bgColor = "#123C32",

}) {

  const resolvedCenterIndex =
    centerIndex ??
    Math.floor(
      images.length / 2
    );


  const bgRef = useRef(null);

  const labelRef = useRef(null);

  const titleRef = useRef(null);

  const imagesContainerRef =
    useRef(null);

  const imgRefs = useRef([]);


  /* ================================================================
     HERO ANIMATION
  ================================================================ */

  useLayoutEffect(() => {

    const items =
      imgRefs.current.filter(Boolean);


    if (!items.length) return;


    const centerEl =
      imgRefs.current[
        resolvedCenterIndex
      ];


    if (!centerEl) return;


    const ctx = gsap.context(() => {

      const centerRect =
        centerEl.getBoundingClientRect();


      const centerX =
        centerRect.left +
        centerRect.width / 2;


      const centerY =
        centerRect.top +
        centerRect.height / 2;


      const deltas =
        items.map((el) => {

          const rect =
            el.getBoundingClientRect();


          const elX =
            rect.left +
            rect.width / 2;


          const elY =
            rect.top +
            rect.height / 2;


          return {

            x: centerX - elX,

            y: centerY - elY,

            scale:
              centerRect.height /
              rect.height,
          };
        });


      /* INITIAL STATES */

      gsap.set(
        bgRef.current,
        {
          xPercent: -100,
        }
      );


      gsap.set(
        imagesContainerRef.current,
        {
          y: 80,
          opacity: 0,
        }
      );


      gsap.set(
        [
          labelRef.current,
          titleRef.current,
        ],
        {
          opacity: 0,
          y: 24,
        }
      );


      items.forEach((el, i) => {

        gsap.set(
          el,
          {

            x: deltas[i].x,

            y: deltas[i].y,

            scale:
              deltas[i].scale *
              0.9,

            opacity:
              i ===
              resolvedCenterIndex
                ? 1
                : 0,

            zIndex:
              items.length -
              Math.abs(
                i -
                  resolvedCenterIndex
              ),
          }
        );

      });


      /* TIMELINE */

      const tl =
        gsap.timeline({
          delay: 0.15,
        });


      /* BACKGROUND */

      tl.to(
        bgRef.current,
        {
          xPercent: 0,

          duration: 0.8,

          ease: "power3.out",
        }
      );


      /* IMAGES */

      tl.to(
        imagesContainerRef.current,
        {
          y: 0,

          opacity: 1,

          duration: 0.7,

          ease: "power3.out",
        },
        "-=0.35"
      );


      /* TEXT */

      tl.to(
        [
          labelRef.current,
          titleRef.current,
        ],
        {
          opacity: 1,

          y: 0,

          duration: 0.6,

          stagger: 0.15,

          ease: "power2.out",
        },
        "-=0.3"
      );


      /* IMAGE ORDER */

      const order =
        [...Array(items.length).keys()]
          .sort(
            (a, b) =>
              Math.abs(
                a -
                  resolvedCenterIndex
              ) -
              Math.abs(
                b -
                  resolvedCenterIndex
              )
          );


      order.forEach(
        (i, seq) => {

          if (
            i ===
            resolvedCenterIndex
          )
            return;


          tl.to(
            items[i],
            {

              x: 0,

              y: 0,

              scale: 1,

              opacity: 1,

              duration: 0.85,

              ease: "power3.out",

            },

            seq === 1
              ? "+=0.1"
              : "-=0.55"
          );

        }
      );


      /* CENTER IMAGE */

      tl.fromTo(

        items[
          resolvedCenterIndex
        ],

        {
          scale:
            deltas[
              resolvedCenterIndex
            ].scale * 0.9,
        },

        {
          scale: 1,

          duration: 0.6,

          ease: "back.out(1.7)",
        },

        "<"
      );

    });


    return () =>
      ctx.revert();

  }, [
    images,
    resolvedCenterIndex,
  ]);


  /* ================================================================
     COMPLETE PAGE
  ================================================================ */

  return (

    <>

      {/* ============================================================
          NAVBAR
      ============================================================ */}

      <Navbar />


      {/* ============================================================
          HERO
      ============================================================ */}

      <section
        className="
          relative
          mx-auto
          w-[95vw]
          overflow-hidden
          rounded-4xl
          px-6
          pt-10
          sm:px-10
          lg:px-16
          md:my-1
        "
        style={{
          backgroundColor:
            bgColor,
        }}
      >

        {/* HERO BACKGROUND */}

        <div
          ref={bgRef}
          className="
            absolute
            inset-0
            bg-cover
            bg-center
          "
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(0,0,0,0.45),
                rgba(0,0,0,0.45)
              ),
              url(${transportBg})
            `,
          }}
        >

          <div
            className="
              pointer-events-none
              absolute
              -top-10
              left-0
              h-64
              w-64
              rounded-full
              bg-white/5
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-1/4
              top-0
              h-40
              w-96
              rounded-full
              bg-white/5
              blur-2xl
            "
          />

        </div>


        {/* HERO CONTENT */}

        <div
          className="
            relative
            mx-auto
            max-w-5xl
            text-center
            xl:max-w-7xl
          "
        >

          {/* EYEBROW */}

          <p
            ref={labelRef}
            className="
              text-xs
              font-extrabold
              tracking-[0.2em]
              text-white
              xl:text-sm
            "
          >
            {eyebrow}
          </p>


          {/* TITLE */}

          <h1
            ref={titleRef}
            className="
              mt-4
              text-4xl
              font-extrabold
              leading-[1.05]
              text-white
              sm:text-5xl
              lg:text-6xl
              xl:text-7xl
            "
          >
            {title}
          </h1>


          {/* HERO IMAGES */}

          <div
            ref={imagesContainerRef}
            className="
              mt-14
              flex
              items-end
              justify-center
              gap-3
              sm:gap-4
            "
          >

            {images.map((img, i) => (

              <div
                key={
                  img.url + i
                }
                ref={(el) =>
                  (imgRefs.current[i] =
                    el)
                }
                className={`
                  w-1/3
                  overflow-hidden
                  rounded-t-2xl
                  sm:w-1/5

                  ${
                    i >= 3
                      ? "hidden sm:block"
                      : ""
                  }

                  ${
                    heights[i] ??
                    "h-48"
                  }
                `}
                style={{
                  willChange:
                    "transform, opacity",
                }}
              >

                <img
                  src={img.url}
                  alt={img.alt}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ============================================================
          TRANSPORT
      ============================================================ */}

      <TransportGrid />


      {/* ============================================================
          ACCOMMODATION
      ============================================================ */}

      <Accommodation />


      {/* ============================================================
          WHY CHOOSE US
      ============================================================ */}

      <WhyChooseUs />


      {/* ============================================================
          HOW IT WORKS
      ============================================================ */}

      <HowItWorks />


      {/* ============================================================
          FAQ
      ============================================================ */}

      <FAQ />


      {/* ============================================================
          CTA
      ============================================================ */}

      <CTA />


      {/* ============================================================
          FOOTER
      ============================================================ */}

      <Footer />

    </>

  );
}