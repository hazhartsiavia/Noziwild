import React, { useState } from 'react'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyIranja from "../assets/images/NosyIranja.png";

const cards = [
  {
    id: 1,
    image: NosyLonjo,
    title: 'Nosy Lonjo Antsiranana',
    description: 'Discover the beauty of Nosy Lonjo Antsiranana.',
  },
  {
    id: 2,
    image: Deux,
    title: 'Deux',
    description: 'Discover the beauty of Deux.',
  },
  {
    id: 3,
    image: Ambanja,
    title: 'Baie de Sakalava',
    description: 'Discover the beauty of Baie de Sakalava.',
  },
  {
    id: 4,
    image: NosyIranja,
    title: 'Nosy Iranja',
    description: 'Discover the beauty of Nosy Iranja.',
  },
]

function Explore() {
  const [selectedImage, setSelectedImage] = useState(cards[0])

  return (
    <div className="  md:px-4 flex flex-col items-center py-2">

      {/* Titre */}
      <div className="text-center mb-5">
        <h1 className="text-[25px] md:text-[50px] font-medium text-slate-900 mb-4">
          Typical Travel Experiences
        </h1>

        <p className="text-sm md:text-xl text-slate-600 max-w-2xl px-10 leading-relaxed">
          From breathtaking landscapes to cultural immersions,
          we offer unforgettable adventures for every traveler.
        </p>
      </div>

      {/* Galerie */}
      <div className="w-full max-w-[90vw] flex flex-col items-center space-y-4">

        {/* Image principale */}
        <div className="relative w-full group">
          <img
            src={selectedImage.image}
            alt={selectedImage.title}
            className="w-full h-[300px] md:h-[580px] object-cover rounded-lg"
          />
          <div className="absolute h-full inset-x-0 top-0 rounded-t-lg bg-black/50 p-10 space-y-4 text-white">
            <h2 className="text-5xl font-medium">{selectedImage.title}</h2>
            <p className="mt-1 text-sm text-white/80">{selectedImage.description}</p>
            <div className="absolute bottom-5 right-10 justify-end flex">
              <button className="bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition">
                Explore Now
              </button>
            </div>
          </div>
        </div>
        {/* Miniatures */}
        <div className="grid grid-cols-4 w-full gap-4">

          {cards.map((card) => (
            <img
              key={card.id}
              src={card.image}
              alt={card.title}
              onClick={() => setSelectedImage(card)}
              className={`
                w-full md:h-44 h-14 object-cover rounded-lg
                cursor-pointer transition
                hover:opacity-80
                ${
                  selectedImage.id === card.id
                    ? 'ring-2 ring-slate-900'
                    : ''
                }
              `}
            />
          ))}

        </div>
      </div>
    </div>
  )
}

export default Explore