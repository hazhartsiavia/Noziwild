import React from 'react'

const cards = [
  {
    id: 1,
    image: 'https://assets.prebuiltui.com/components/feature-sections/ai-avatar-image1.png',
    title: 'AI Character Maker',
    description: 'Generate any character or images you want.',
  },
  {
    id: 2,
    image: 'https://assets.prebuiltui.com/components/feature-sections/ai-avatar-image2.png',
    title: 'AI Influencers',
    description: 'Create a model or AI influencer to grow your brands.',
  },
  {
    id: 3,
    image: 'https://assets.prebuiltui.com/components/feature-sections/ai-avatar-image3.png',
    title: 'AI Paintings',
    description: 'Draw or make a painting with the help of AI.',
  },
  {
    id: 4,
    image: 'https://assets.prebuiltui.com/components/feature-sections/ai-avatar-image4.png',
    title: 'AI Image Upscaler',
    description: 'Upscale your low quality image to make it in high quality.',
  },
]

function Explore() {
  return (
    <>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
          * {
            font-family: "Poppins", sans-serif;
          }
        `}
      </style>

      <div className="bg-[#FAFAFA] pt-16 md:px-4 flex flex-col items-center">
        <div className="text-center mb-15">
          <h1 className="text-[30px] md:text-[40px] font-medium text-slate-900 mb-4">
            Typical travel Experiences
          </h1>
          <p className="text-base text-slate-600 max-w-lg px-4 md:px-10 md:pb-4 leading-relaxed">
            From breathtaking landscapes to cultural immersions, 
            we offer unforgettable adventures for every traveler.
          </p>
        </div>

        <div className="px-5 flex flex-wrap items-center justify-center gap-6 max-w-full w-full">
          {cards.map((card) => (
            <div
              key={card.id}
              className="w-full md:w-auto bg-white border border-zinc-200 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-lg p-4 flex flex-col items-center"
            >
              <img src={card.image} alt={card.title} className="w-full md:max-w-56 object-cover mb-6" />
              <div className="w-full md:max-w-56 flex flex-col h-full">
                <h3 className="text-base font-medium text-slate-900 mb-2">{card.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">{card.description}</p>
                <div className="flex items-end justify-end">
                  <button className="inline-flex items-center gap-2 bg-transparent border-0 text-slate-700 text-xs cursor-pointer p-0 hover:gap-2 group">
                    En savoir plus
                    <svg
                      width="22"
                      height="15"
                      viewBox="0 0 22 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path
                        d="M4.583 7.5h12.834M11 3.125 17.417 7.5 11 11.875"
                        stroke="#314158"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Explore