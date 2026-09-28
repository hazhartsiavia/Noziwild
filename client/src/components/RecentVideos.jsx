import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const defaultVideos = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
    title: ["New Zealand's", "Vast Land"],
    featured: true,
    span: "md:col-span-7",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=85",
    title: ["New York City", "Views"],
    featured: true,
    span: "md:col-span-5",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85",
    title: ["Discovering", "Greece"],
    featured: false,
    span: "md:col-span-2",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=900&q=85",
    title: ["The Most", "Beautiful Island", "in the World"],
    featured: false,
    span: "md:col-span-4",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85",
    title: ["My Vietnam Trip"],
    featured: false,
    span: "md:col-span-3",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=85",
    title: ["A Castle On an", "Island"],
    featured: false,
    span: "md:col-span-3",
  },
];

/* ------------------------------------------------------------------
   PLAY BUTTON
------------------------------------------------------------------- */

function PlayButton() {
  return (
    <span className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white transition-transform duration-300 group-hover:scale-110">
      <span
        className="ml-[3px] w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-white"
        aria-hidden="true"
      />
    </span>
  );
}

/* ------------------------------------------------------------------
   VIDEO CARD
------------------------------------------------------------------- */

function VideoCard({ video, featuredBadgeColor }) {
  return (
    <div
      className={`recent-video group relative overflow-hidden h-[280px] md:h-[330px] ${
        video.span || ""
      }`}
    >
      <img
        src={video.image}
        alt={video.title.join(" ")}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_30%)]" />

      {video.featured && (
        <span
          className="absolute top-0 right-0 z-10 text-white text-xs font-semibold px-4 py-2"
          style={{ backgroundColor: featuredBadgeColor }}
        >
          Featured
        </span>
      )}

      <h3 className="absolute top-4 left-4 z-10 text-white text-lg font-extrabold leading-snug">
        {video.title.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < video.title.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h3>

      <PlayButton />
    </div>
  );
}

/* ------------------------------------------------------------------
   RECENT VIDEOS SECTION
------------------------------------------------------------------- */

export default function RecentVideos({
  title = "Recent Videos",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  viewAllLabel = "VIEW ALL",
  onViewAll,
  videos = defaultVideos,
  topRowCount = 2,
  bgColor = "#FFFFFF",
  accentColor = "#09b8ce",
  featuredBadgeColor = "#3156e8",
}) {
  const sectionRef = useRef(null);

  const topRow = videos.slice(0, topRowCount);
  const bottomRow = videos.slice(topRowCount);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".recent-videos-header", {
        y: 70,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-videos-section",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".recent-video-row:first-of-type .recent-video", {
        y: 90,
        opacity: 0,
        scale: 0.97,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-video-row:first-of-type",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".recent-video-row:last-of-type .recent-video", {
        y: 80,
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-video-row:last-of-type",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, [videos, topRowCount]);

  return (
    <section
      ref={sectionRef}
      className="recent-videos-section relative px-6 sm:px-8 lg:pl-20 lg:pr-14 py-16 lg:py-20 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div className="recent-videos-header max-w-[720px]">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-5">
          {title}
        </h2>

        {description && (
          <p className="text-[#6b7280] text-[15px] leading-relaxed mb-5">
            {description}
          </p>
        )}

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-3 text-xs font-semibold tracking-wide text-[#9ca3af] hover:text-[#6b7280] transition"
        >
          {viewAllLabel}

          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d1d5db]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M9 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div className="hidden lg:block absolute top-0 right-4 pointer-events-none">
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" aria-hidden="true">
          <path
            d="M4 36 L48 4"
            stroke={accentColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M32 4 H48 V20"
            stroke={accentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        <span
          className="block w-2 h-2 rounded-full mt-4 ml-11"
          style={{ backgroundColor: featuredBadgeColor }}
        />
        <span
          className="block w-2.5 h-2.5 rounded-full mt-6 ml-14"
          style={{ backgroundColor: featuredBadgeColor }}
        />
      </div>

      {topRow.length > 0 && (
        <div className="recent-video-row mt-10 grid grid-cols-1 md:grid-cols-12 gap-4">
          {topRow.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              featuredBadgeColor={featuredBadgeColor}
            />
          ))}
        </div>
      )}

      {bottomRow.length > 0 && (
        <div className="recent-video-row mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          {bottomRow.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              featuredBadgeColor={featuredBadgeColor}
            />
          ))}
        </div>
      )}
    </section>
  );
}