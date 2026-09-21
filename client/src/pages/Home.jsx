import React from 'react'
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Choose from "../components/Choose";
import Explore from "../components/Explore";
import Trips from "../components/Trips";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WhyUs from '../components/WhyUs';
import Testimonials from '../components/Testimonials';
function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Explore />
      <Choose />
      <Trips />
      <Cta />
      <WhyUs />
      <Testimonials />
        <Footer />
    </div>
  )
}

export default Home
