import React, { useState, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyIranja from "../assets/images/NosyIranja.png";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { id: 1, image: NosyLonjo, title: 'Antsiranana', description: 'Discover the beauty of Nosy Lonjo Antsiranana.' },
  { id: 2, image: Deux, title: 'Deux', description: 'Discover the beauty of Deux.' },
  { id: 3, image: Ambanja, title: 'Baie de Sakalava', description: 'Discover the beauty of Baie de Sakalava.' },
  { id: 4, image: NosyIranja, title: 'Nosy Iranja', description: 'Discover the beauty of Nosy Iranja.' },
]

function Explore() {
  const [selectedImage, setSelectedImage] = useState(cards[0])
  const rootRef = useRef(null)
  const imageWrapperRef = useRef(null)
  const imageRef = useRef(null)
  const thumbsWrapperRef = useRef(null)

  useGSAP(() => {
    // Image principale : scale de 0.25 à 1 pendant le scroll
    gsap.fromTo(
      imageRef.current,
      { scale: 0.25 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: imageWrapperRef.current,
          start: "top bottom",
          end: "top center",
          scrub: true,
        },
      }
    );
    const thumbnails = gsap.utils.toArray(".thumbnail", rootRef.current);

    gsap.fromTo(
      thumbnails,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        ease: "none",
        stagger: 0.2,
        scrollTrigger: {
          trigger: thumbsWrapperRef.current,
          start: "top 85%",
          end: "top 65%",
          scrub: true,
        },
      }
    );
  }, { scope: rootRef });

  return (
    <div ref={rootRef} className="md:px-4 flex flex-col items-center py-2">

      {/* Titre */}
      <div className="text-center mb-5">
        <h1 className="text-[25px] md:text-[50px] font-medium text-slate-900 mb-4">
          Typical Travel Experiences
        </h1>
        <p className="text-sm md:text-xl text-slate-600 max-w-2xl px-10 leading-relaxed">
          Choose from a variety your travel style and let us help you create a personalized itinerary that suits your preferences.
        </p>
      </div>

      {/* Galerie */}
      <div className="w-full max-w-[90vw] md:max-h-[80vh] flex flex-col items-center space-y-4">

        {/* Image principale */}
        <div ref={imageWrapperRef} className="relative w-full overflow-hidden rounded-lg">
          <div
            ref={imageRef}
            className="relative group"
            style={{ transformOrigin: "center center", willChange: "transform" }}
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-full h-[500px] md:h-[580px] object-cover rounded-lg"
            />
            <div className="absolute h-full inset-x-0 top-0 rounded-t-lg bg-black/50 p-5 md:p-10 md:space-y-4 text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium">{selectedImage.title}</h2>
              <p className="mt-1 text-sm text-white/80">{selectedImage.description}</p>
              <hr className='w-[200px] md:w-[200px] my-2'/>
              <p className="mt-1 text-sm text-white/80"></p>
              <div className="absolute bottom-5 md:bottom-5 md:right-10 right-5 justify-end items-end">
                <h1 className="text-base md:text-lg lg:text-xl font-medium text-white/80 mr-4 mb-4">Starting at 200$</h1>
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition">
                  Explore Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Miniatures */}
        <div ref={thumbsWrapperRef} className="grid grid-cols-4 w-full gap-4">
          {cards.map((card) => (
            <img
              key={card.id}
              src={card.image}
              alt={card.title}
              onClick={() => setSelectedImage(card)}
              className={`
                thumbnail
                w-full md:h-30 h-24 object-cover rounded-md md:rounded-lg
                cursor-pointer transition hover:opacity-80
                ${selectedImage.id === card.id ? 'ring-2 ring-slate-900' : ''}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Explore