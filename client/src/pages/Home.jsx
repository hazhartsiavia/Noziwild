import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Offers from '../components/Offers'
import FeaturedDestinations from '../components/FeaturedDestinations'
import Explore from '../components/Explore'
import Choose from '../components/Choose'
import Trips from '../components/Trips'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import Cta from '../components/Cta'
import Footer from '../components/Footer'
import { destinations } from './destinationsData'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Nouveau : toutes les façons de voyager */}
        <Offers />

        {/* Nouveau : destinations en vedette, lues depuis destinationsData.js */}
        <FeaturedDestinations destinations={Object.values(destinations)} />

        <Explore />
        <Choose />
        <Trips />
        <WhyUs />
        <Testimonials />

        {/* Déplacé en dernier : l'appel à l'action juste avant le footer */}
        <Cta />
      </main>
      <Footer />
    </>
  )
}

export default Home
