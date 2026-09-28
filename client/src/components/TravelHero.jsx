import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import Navbar from '../components/Navbar'

const defaultImages = [
  {
    url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    alt: "Torii gate on the water, Japan",
  },
  {
    url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80",
    alt: "Lakeside castle tower in the mountains",
  },
  {
    url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
    alt: "Woman relaxing by an infinity pool",
  },
  {
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    alt: "Couple reading a map by the harbor",
  },
  {
    url: "https://images.unsplash.com/photo-1518877593221-1f28583780b4?w=600&q=80",
    alt: "Sea stacks along a rocky coastline",
  },
];

// hauteurs par défaut pour 5 images (arc vers le centre)
const defaultHeights = [
  "h-40 sm:h-44 lg:h-52",
  "h-48 sm:h-56 lg:h-64",
  "h-56 sm:h-64 lg:h-72 -mt-6",
  "h-48 sm:h-56 lg:h-64",
  "h-40 sm:h-44 lg:h-52",
];

export default function TravelHero({
  eyebrow = "MOVE THROUGH MADAGASCAR",
  title = "One journey. Many ways.",
  images = defaultImages,
  heights = defaultHeights,
  centerIndex, // si non fourni, calculé automatiquement (image du milieu)
  bgColor = "#123C32",
}) {
  const resolvedCenterIndex =
    centerIndex ?? Math.floor(images.length / 2);

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
      // --- Mesures AVANT toute transformation ---
      const centerRect = centerEl.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const centerY = centerRect.top + centerRect.height / 2;

      const deltas = items.map((el) => {
        const rect = el.getBoundingClientRect();
        const elX = rect.left + rect.width / 2;
        const elY = rect.top + rect.height / 2;
        return {
          x: centerX - elX,
          y: centerY - elY,
          scale: centerRect.height / rect.height,
        };
      });

      // --- États initiaux ---
      gsap.set(bgRef.current, { xPercent: -100 });
      gsap.set(imagesContainerRef.current, { y: 80, opacity: 0 });
      gsap.set([labelRef.current, titleRef.current], { opacity: 0, y: 24 });

      items.forEach((el, i) => {
        gsap.set(el, {
          x: deltas[i].x,
          y: deltas[i].y,
          scale: deltas[i].scale * 0.9,
          opacity: i === resolvedCenterIndex ? 1 : 0,
          zIndex: items.length - Math.abs(i - resolvedCenterIndex),
        });
      });

      // --- Timeline principale ---
      const tl = gsap.timeline({ delay: 0.15 });

      // 1) Fond depuis la gauche
      tl.to(bgRef.current, {
        xPercent: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // 2) Bloc d'images depuis le bas
      tl.to(
        imagesContainerRef.current,
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
        "-=0.35"
      );

      // 3) Texte
      tl.to(
        [labelRef.current, titleRef.current],
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" },
        "-=0.3"
      );

      // 4) Déploiement des images une à une
      const order = [...Array(items.length).keys()].sort(
        (a, b) =>
          Math.abs(a - resolvedCenterIndex) - Math.abs(b - resolvedCenterIndex)
      );

      order.forEach((i, seq) => {
        if (i === resolvedCenterIndex) return;
        tl.to(
          items[i],
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.85, ease: "power3.out" },
          seq === 1 ? "+=0.1" : "-=0.55"
        );
      });

      tl.fromTo(
        items[resolvedCenterIndex],
        { scale: deltas[resolvedCenterIndex].scale * 0.9 },
        { scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        "<"
      );
    });

    return () => ctx.revert();
  }, [images, resolvedCenterIndex]);

  return (
    <>
      <Navbar />

      <section className="relative rounded-4xl mx-auto w-[95vw] px-6 pt-10 md:my-1 overflow-hidden sm:px-10 lg:px-16">
        <div
          ref={bgRef}
          className="absolute inset-0"
          style={{ backgroundColor: bgColor }}
        >
          <div className="pointer-events-none absolute -top-10 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute top-0 right-1/4 h-40 w-96 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center xl:max-w-7xl">
          <p
            ref={labelRef}
            className="text-xs font-semibold tracking-[0.2em] text-white/70 xl:text-sm"
          >
            {eyebrow}
          </p>

          <h1
            ref={titleRef}
            className="mt-4 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {title}
          </h1>

          <div
            ref={imagesContainerRef}
            className="mt-14 flex items-end justify-center gap-3 sm:gap-4"
          >
            {images.map((img, i) => (
              <div
                key={img.url + i}
                ref={(el) => (imgRefs.current[i] = el)}
                className={`w-1/3 overflow-hidden rounded-t-2xl sm:w-1/5 ${
                  i >= 3 ? "hidden sm:block" : ""
                } ${heights[i] ?? "h-48"}`}
                style={{ willChange: "transform, opacity" }}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}