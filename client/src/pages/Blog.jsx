import React from 'react'
import Ramena from "../assets/images/Ramena.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Ambanja from "../assets/images/Ambanja.png";
import Deux from "../assets/images/2.jpg";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Constantes partagées : mêmes valeurs que dans Explore.jsx, Choose.jsx et Trips.jsx */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const META_TEXT = "text-xs sm:text-sm"

// Propres à cette page
const PAGE_TITLE = "text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"

/* ---------------------------- Données ---------------------------- */

// Bloc "à la une" : grande image + 3 articles avec miniature
const featured = {
  image: NosyIranja,
  imageAlt: 'A quiet infinity pool at sunset',
  posts: [
    { id: 1, date: 'November 20, 2025', title: 'Discover Offbeat Destinations Beyond The Usual Tourist Trails', thumb: Deux },
    { id: 2, date: 'November 11, 2025', title: 'From Beach Resorts To Hidden Bays, Here’s Where Families Love To Go', thumb: Ambanja },
    { id: 3, date: 'October 14, 2025', title: 'Indulge In Luxury With Our Handpicked Stays Around The Island', thumb: NosyLonjo },
  ],
}

// Grille d'articles
const posts = [
  { id: 1, image: Deux, date: 'November 17, 2023', readTime: '6 Min Read', title: 'A Wildlife Adventure In Northern Madagascar' },
  { id: 2, image: Tana, date: 'October 18, 2023', readTime: '6 Min Read', title: 'Exploring The Highlands Around Antananarivo In Winter' },
  { id: 3, image: NosyIranja, date: 'October 5, 2023', readTime: '6 Min Read', title: 'From Beaches To Baobabs, Here’s Everything' },
  { id: 4, image: Ramena, date: 'September 22, 2023', readTime: '5 Min Read', title: 'Sailing The Coast Of Ramena' },
  { id: 5, image: Ambanja, date: 'September 9, 2023', readTime: '7 Min Read', title: 'A Slow Weekend In Ambanja And Nosy Be' },
  { id: 6, image: NosyLonjo, date: 'August 27, 2023', readTime: '4 Min Read', title: 'The Complete Guide To Diego Suarez Bay' },
]

/* -------------------------- Composants --------------------------- */

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

function BlogHero() {
  return (
    <>
    <Navbar />
    <section className={`${SECTION_WIDTH} relative flex items-center overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[100px] md:min-h-[360px]`}>
        
      <img src={Ramena} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/60" />

      <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
        <h1 className={PAGE_TITLE}>Blog Page</h1>

        <hr className="my-6 md:my-8 border-white/30" />

        <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-3 text-sm md:text-base font-medium">
              <li><a href="/" className="hover:underline underline-offset-4">Home</a></li>
              <li aria-hidden="true"><ChevronRight /></li>
              <li aria-current="page">Blog</li>
            </ol>
          </nav>

          <p className="hidden md:block md:display-block md:max-w-[52%] text-sm md:text-base font-medium leading-relaxed">
            Stories, guides and travel inspiration from the island, written by the people who plan your trips.
          </p>
        </div>
      </div>
    </section>
    </>
  )
}

function FeaturedJournal() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] md:h-full xl:h-[85vh] overflow-hidden rounded-3xl bg-white">

      {/* Grande image */}
      <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-full">
        <img
          src={featured.image}
          alt={featured.imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Liste des 3 articles */}
      <ul className="flex flex-col divide-y divide-slate-200 px-5 py-2 md:px-12 md:py-6">
        {featured.posts.map((post) => (
          <li key={post.id}>
            <a href="#" className="group flex items-center justify-between gap-4 md:gap-8 py-6 md:py-8 text-slate-800">
              <div>
                <span className={BADGE}>{post.date}</span>
                <h3 className="mt-4 md:mt-5 text-lg md:text-2xl leading-snug group-hover:underline underline-offset-4">
                  {post.title}
                </h3>
              </div>
              <img
                src={post.thumb}
                alt=""
                className="shrink-0 w-24 h-24 sm:w-40 sm:h-32 lg:w-56 lg:h-30 rounded-xl object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PostCard({ post }) {
  return (
    <a href="#" className="group flex flex-col rounded-xl bg-white p-3 md:p-3.5 text-slate-800">
      <div className="aspect-[4/3] overflow-hidden rounded-md">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="px-3 md:px-4 pt-6 pb-6 md:pb-8">
        <p className={`flex items-center gap-3 ${META_TEXT} text-slate-600`}>
          <span>{post.date}</span>
          <span className="w-px h-4 bg-slate-700" aria-hidden="true" />
          <span>{post.readTime}</span>
        </p>
        <h3 className="mt-4 text-xl md:text-2xl leading-snug group-hover:underline underline-offset-4">
          {post.title}
        </h3>
      </div>
    </a>
  )
}

function Blog() {
  return (
    <>
    <main className="w-full bg-[#D5E8E2] pt-0 pb-16 md:pb-24 flex flex-col items-center">
    
      <BlogHero />

      {/* Journal */}
      <section className={`${SECTION_WIDTH} mt-[50px] md:mt-[100px]`}>
        <div className="text-center mb-8 md:mb-12">
          <p className="mb-2 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">
            From our journal
          </p>
          <h2 className={SECTION_TITLE}>From Our Travel Journal</h2>
        </div>

        <FeaturedJournal />

        {/* Grille d'articles */}
        <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

export default Blog