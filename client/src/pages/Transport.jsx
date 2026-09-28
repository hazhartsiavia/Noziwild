import React, { useRef, useLayoutEffect } from "react";
import Footer from '../components/Footer'
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AdvantagesBg from "../assets/images/AdvantagesBg.png";
import Navbar from "../components/Navbar";
import transportBg from '../assets/images/transportBg.jpg'
import transport1 from '../assets/images/transport1.png'
import transport2 from '../assets/images/transport2.png'
import transport3 from '../assets/images/transport3.png'
import transport4 from '../assets/images/transport4.png'
import transport5 from '../assets/images/transport5.png'
import FAQIllust from '../assets/images/FAQ.png'
import transportVideo from '../assets/videos/video.mp4' 
gsap.registerPlugin(ScrollTrigger);

/* ====================================================================
   DONNÉES
==================================================================== */
const content = {
  title: 'Creating Unforgettable Journeys, Together',
  text: 'From the first idea to the last sunset, our team plans every detail so you can simply enjoy the journey.',
  label: 'Our Promise',
  image: AdvantagesBg,
  imageAlt: 'A traveler jumping with a backpack',
  video: transportVideo,
}

const IconBox = ({ children, className = "" }) => (
  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#C49849] text-white shadow-sm ${className}`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      {children}
    </svg>
  </div>
)

const RouteIcon = () => (
  <IconBox>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </IconBox>
)

const LuggageIcon = () => (
  <IconBox>
    <path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2" />
    <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
    <path d="M10 20v2" />
    <path d="M14 20v2" />
  </IconBox>
)

const HotelIcon = () => (
  <IconBox>
    <path d="M10 22v-6.57" />
    <path d="M14 15.43V22" />
    <path d="M15 16a5 5 0 0 0-6 0" />
    <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
    <rect x="4" y="2" width="16" height="20" rx="2" />
  </IconBox>
)

const CompassIcon = () => (
  <IconBox>
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
  </IconBox>
)

const features = [
  { id: 1, title: 'Numerous Routes', text: 'Des itinéraires variés à travers toute l’île.', icon: RouteIcon },
  { id: 2, title: 'Easy Booking', text: 'Réservez votre transport en quelques clics.', icon: LuggageIcon },
  { id: 3, title: 'Accommodation', text: 'Des hébergements sélectionnés pour vous.', icon: HotelIcon },
  { id: 4, title: 'Best Tour Guidance', text: 'Des guides qui connaissent Madagascar.', icon: CompassIcon },
]

const ADVANTAGE_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"

const howItWorks = [
  {
    number: "01",
    title: "Choose Your Destination",
    text: "Select your destination and tell us where your journey begins."
  },
  {
    number: "02",
    title: "Select Your Vehicle",
    text: "Explore our transport options and choose the one that best suits your needs."
  },
  {
    number: "03",
    title: "Customize Your Trip",
    text: "Choose your travel date, departure time and any additional services you need."
  },
  {
    number: "04",
    title: "Confirm Your Booking",
    text: "Review your choices and confirm your transport to get ready for your journey."
  }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = React.useState(null);

    const faqs = [
        {
            question: "How to use this component?",
            answer: "To use this component, you need to import it in your project and use it in your JSX code. Here's an example of how to use it:",
        },
        {
            question: "Are there any other components available?",
            answer: "Yes, there are many other components available in this library. You can find them in the 'Components' section of the website.",
        },
        {
            question: "Are components responsive?",
            answer: "Yes, all components are responsive and can be used on different screen sizes.",
        },
        {
            question: "Can I customize the components?",
            answer: "Yes, you can customize the components by passing props to them. You can find more information about customizing components in the 'Customization' section of the website.",
        },
    ];
    return (
        <>
            <div className="max-w-7xl mx-auto mt-16 flex flex-col md:flex-row items-start justify-center gap-8 px-4 md:px-0">
                <img
                    className="max-w-sm  rounded-xl h-[450px]"
                    src= {FAQIllust}
                    alt=""
                />
                <div>
                    <p className="text-[#074536] text-md font-medium">FAQ's</p>
                    <h1 className="text-4xl font-semibold">Looking for answer?</h1>
                    <p className="text-md text-slate-500 mt-2 pb-4">
                        Ship Beautiful Frontends Without the Overhead — Customizable, Scalable and Developer-Friendly UI Components.
                    </p>
                    {faqs.map((faq, index) => (
                        <div className="border-b border-slate-200 py-4 cursor-pointer" key={index} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-medium">
                                    {faq.question}
                                </h3>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}>
                                    <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="#1D293D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className={`text-md text-slate-500 transition-all duration-500 ease-in-out max-w-lg ${openIndex === index ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"}`} >
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};


/* ====================================================================
   ICÔNES SVG
==================================================================== */



function Icon({ name, className = "w-8 h-8" }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "brain":
      return (
        <svg {...common}>
          <path d="M9 3.5a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10a3 3 0 0 0 1.5 2.6V13a3 3 0 0 0 3 3h.5" />
          <path d="M15 3.5a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 10a3 3 0 0 1-1.5 2.6V13a3 3 0 0 1-3 3h-.5" />
          <path d="M9 3.5v17M15 3.5v17" />
        </svg>
      );
    default: return null;
  }
}

const defaultImages = [
  { url: transport1, alt: "Torii gate on the water, Japan" },
  { url: transport2, alt: "Lakeside castle tower in the mountains" },
  { url: transport4, alt: "Woman relaxing by an infinity pool" },
  { url: transport3, alt: "Couple reading a map by the harbor" },
  { url: transport5, alt: "Sea stacks along a rocky coastline" },
];

const defaultHeights = [
  "h-40 sm:h-44 lg:h-52",
  "h-48 sm:h-56 lg:h-64",
  "h-56 sm:h-64 lg:h-72 -mt-6",
  "h-48 sm:h-56 lg:h-64",
  "h-40 sm:h-44 lg:h-52",
];

const META_TEXT = "text-xs sm:text-sm";

const transportTypes = [
  { id: 1, image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=700&q=80", category: "Terrestre", duration: "Pistes & routes", title: "4×4" },
  { id: 2, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&q=80", category: "Terrestre", duration: "Terrains difficiles", title: "Quad" },
  { id: 3, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&q=80", category: "Terrestre", duration: "Groupes & confort", title: "Vans" },
  { id: 4, image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=700&q=80", category: "Terrestre", duration: "Liberté & rapidité", title: "Moto" },
  { id: 5, image: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=700&q=80", category: "Terrestre", duration: "Balade tranquille", title: "Bicyclette" },
  { id: 6, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80", category: "Maritime", duration: "Îles & côtes", title: "Catamaran" },
  { id: 7, image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=700&q=80", category: "Maritime", duration: "Trajets rapides", title: "Vedette" },
  { id: 8, image: "https://images.unsplash.com/photo-1500627964684-141351970a7e?w=700&q=80", category: "Maritime", duration: "Traversées & pêche", title: "Bateau" },
];



function FeatureCard({ feature }) {
  const IconComponent = feature.icon;
  return (
    <div className="why-card flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/6 p-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-5">
      <div className="mb-4"><IconComponent /></div>
      <h3 className="text-lg font-medium text-white sm:text-xl">{feature.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
        {feature.text || "A tailored experience for your trip across Madagascar."}
      </p>
    </div>
  );
}

/* ====================================================================
   SECTION : WHY CHOOSE US
   ─ Boîte ancrée au VIEWPORT (right-10 = 40px du bord droit)
   ─ Ancrage VERTICAL au TOP de la boîte (pas de translateY)
   ─ La boîte s'étend VERS LE BAS + VERS LA GAUCHE
   ─ Jamais vers le haut → le label reste toujours visible
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

      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(cards, { y: 60, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Texte s'efface
      tl.to(textColRef.current, {
        opacity: 0,
        x: -60,
        ease: "power2.in",
        duration: 3,
      }, 0);

      // 2. Boîte s'étend en width ET height
      //    Positionnée avec top: X (fixe) → elle grandit vers le BAS
      //    et avec right: 40px → elle grandit vers la GAUCHE
      tl.to(
        bgBox,
        {
          width: "calc(100vw - 80px)",
          height: "calc(100vh - 80px)",   // 40px de marge en haut + 40px en bas
          borderRadius: 10,
          ease: "power2.inOut",
          duration: 5,
        },
        0
      );

      // 3. Label
      tl.to(labelRef.current, { opacity: 1, y: 0, ease: "power2.out", duration: 0.8 }, 1.6);

      // 4. Cartes
      tl.to(cards, { y: 0, opacity: 1, stagger: 0.15, ease: "power2.out", duration: 1 }, 1.8);

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      return () => window.removeEventListener("load", onLoad);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "150vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ============================================================
            LA BOÎTE — ancrée au viewport
            top-10 = 40px du haut (point d'ancrage fixe)
            right-10 = 40px du bord droit
            → Elle grandit uniquement VERS LE BAS et VERS LA GAUCHE
            ============================================================ */}
        <div
          ref={bgBoxRef}
          className="absolute top-2 left-1/2 -translate-x-1/2 overflow-hidden rounded-3xl bg-slate-900 z-20 flex"
          style={{
            width: "98%",
            height: "150px",
            willChange: "width, height, border-radius",


          }}
        >
          <img
            src={content.image}
            alt={content.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-8">
            <p
              ref={labelRef}
              className="flex items-start gap-2 text-lg md:text-xl font-medium text-white"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" aria-hidden="true" />
              {content.label}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {features.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   BLOC "TRAVEL WITH EASE"
==================================================================== */
/* ====================================================================
   HOW IT WORKS
==================================================================== */

function HowItWorks() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(".how-step");

      gsap.fromTo(
        items,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.7,
          stagger: 0.35,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "50% bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full px-5 sm:px-8 lg:px-10 py-16 lg:py-0"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 lg:mb-8 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-medium leading-[0.98] tracking-[-0.04em] text-[#0F0F0F]">
            How it works?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-[28px] bg-[#D8D6D1]">
          {howItWorks.map((step) => (
            <article
              key={step.number}
              className="how-step group min-h-[340px] bg-[#D5E8E2] p-7 sm:p-8 lg:p-9 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#53615D]">
                  {step.number}
                </span>

                <span className="text-2xl text-[#111] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </div>

              <div className="mt-5 md:mt-16">
                <h3 className="max-w-[280px] text-lg sm:text-xl lg:text-[22px] font-semibold uppercase tracking-[0.06em] leading-[1.3] text-[#26332F]">
                  {step.title}
                </h3>

                <p className="mt-1 md:mt-5 max-w-[300px] text-base sm:text-md leading-relaxed text-[#53615D]">
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
   TRANSPORT GRID
==================================================================== */

function TransportCard({ transport }) {
  return (
    <a href="#" className="group flex flex-col rounded-xl bg-white p-3 text-slate-800">
      <div className="aspect-[4/3] overflow-hidden rounded-md">
        <img src={transport.image} alt={transport.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="px-3 pt-6 pb-6">
        <p className={`flex items-center gap-3 ${META_TEXT} text-[#0F172B]`}>
          <span>{transport.category}</span>
          <span className="w-px h-4 bg-slate-700" />
          <span>{transport.duration}</span>
        </p>
        <h3 className="mt-4 text-xl md:text-2xl leading-snug group-hover:underline">{transport.title}</h3>
      </div>
    </a>
  );
}

function TransportGrid({ transports = transportTypes }) {
  const sectionRef = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".transport-card");
      cards.forEach((card) => {
        gsap.fromTo(card, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 90%", end: "top 45%", scrub: 0.8 } });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [transports]);

  return (
    <section ref={sectionRef} className="w-full mx-auto bg-[#D5E8E2] sm:px-0 lg:px-0">
      <div className="bg-white rounded-b-4xl h-10 w-full mb-10" />
      <div className="mx-auto grid px-5 md:px-10 grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-10">
        {transports.map((transport, i) => {
          const offset = i % 4 === 1 || i % 4 === 3 ? "lg:mt-10" : "";
          return (
            <div className={`transport-card ${offset}`} key={transport.id}>
              <TransportCard transport={transport} />
            </div>
          );
        })}
      </div>
      <div className="bg-white mt-10 rounded-t-4xl h-10 w-full " />
    </section>
  );
}

/* ====================================================================
   TRAVEL HERO + ASSEMBLAGE
==================================================================== */

export default function TravelHero({
  eyebrow = "One journey. Many ways.",
  title = "Explore Madagascar, your way.",
  images = defaultImages,
  heights = defaultHeights,
  centerIndex,
  bgColor = "#123C32",
}) {
  const resolvedCenterIndex = centerIndex ?? Math.floor(images.length / 2);
  const bgRef = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);
  const imagesContainerRef = useRef(null);
  const imgRefs = useRef([]);

  useLayoutEffect(() => {
    const items = imgRefs.current.filter(Boolean);
    if (!items.length) return;
    const centerEl = imgRefs.current[resolvedCenterIndex];

    const ctx = gsap.context(() => {
      const centerRect = centerEl.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const centerY = centerRect.top + centerRect.height / 2;

      const deltas = items.map((el) => {
        const rect = el.getBoundingClientRect();
        const elX = rect.left + rect.width / 2;
        const elY = rect.top + rect.height / 2;
        return { x: centerX - elX, y: centerY - elY, scale: centerRect.height / rect.height };
      });

      gsap.set(bgRef.current, { xPercent: -100 });
      gsap.set(imagesContainerRef.current, { y: 80, opacity: 0 });
      gsap.set([labelRef.current, titleRef.current], { opacity: 0, y: 24 });

      items.forEach((el, i) => {
        gsap.set(el, { x: deltas[i].x, y: deltas[i].y, scale: deltas[i].scale * 0.9, opacity: i === resolvedCenterIndex ? 1 : 0, zIndex: items.length - Math.abs(i - resolvedCenterIndex) });
      });

      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(bgRef.current, { xPercent: 0, duration: 0.8, ease: "power3.out" });
      tl.to(imagesContainerRef.current, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.35");
      tl.to([labelRef.current, titleRef.current], { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }, "-=0.3");

      const order = [...Array(items.length).keys()].sort((a, b) => Math.abs(a - resolvedCenterIndex) - Math.abs(b - resolvedCenterIndex));
      order.forEach((i, seq) => {
        if (i === resolvedCenterIndex) return;
        tl.to(items[i], { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.85, ease: "power3.out" }, seq === 1 ? "+=0.1" : "-=0.55");
      });

      tl.fromTo(items[resolvedCenterIndex], { scale: deltas[resolvedCenterIndex].scale * 0.9 }, { scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "<");
    });

    return () => ctx.revert();
  }, [images, resolvedCenterIndex]);

  return (
    <>
      <Navbar />

      <section className="relative rounded-4xl mx-auto w-[95vw] px-6 pt-10 md:my-1 overflow-hidden sm:px-10 lg:px-16">
        <div ref={bgRef} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${transportBg})` }}>
          <div className="pointer-events-none absolute -top-10 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute top-0 right-1/4 h-40 w-96 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center xl:max-w-7xl">
          <p ref={labelRef} className="text-xs font-semibold tracking-[0.2em] text-[#ffffff] font-extrabold xl:text-sm">{eyebrow}</p>
          <h1 ref={titleRef} className="mt-4 text-4xl font-extrabold leading-[1.05] text-[#ffffff] sm:text-5xl lg:text-6xl xl:text-7xl">{title}</h1>

          <div ref={imagesContainerRef} className="mt-14 flex items-end justify-center gap-3 sm:gap-4">
            {images.map((img, i) => (
              <div
                key={img.url + i}
                ref={(el) => (imgRefs.current[i] = el)}
                className={`w-1/3 overflow-hidden rounded-t-2xl sm:w-1/5 ${i >= 3 ? "hidden sm:block" : ""} ${heights[i] ?? "h-48"}`}
                style={{ willChange: "transform, opacity" }}
              >
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <TransportGrid />

      <WhyChooseUs />
      <HowItWorks />
      <FAQ/>
      <Footer/>
    </>
  );
}