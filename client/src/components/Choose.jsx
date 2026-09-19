import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

function Choose() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)

  useGSAP(() => {
    gsap.fromTo(
      bgRef.current,
      { backgroundColor: "#FFFFFF" },
      {
        backgroundColor: "#F8F0DE",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 30%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="relative w-full mt-[50px] md:mt-[150px] h-[100vh] bg-white flex items-center justify-center overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 bg-white"
      />
    </div>
  )
}

export default Choose