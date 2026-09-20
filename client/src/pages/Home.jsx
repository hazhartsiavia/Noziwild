import React from 'react'
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Choose from "../components/Choose";
import Explore from "../components/Explore";
import Trips from "../components/Trips";
import Testimaonials from "../components/Testimaonials";
import Footer from "../components/Footer";
import WhyUs from '../components/WhyUs';
function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Explore />
      <Choose />
      <Trips />
      <Testimaonials />
      <WhyUs />
        <Footer />
    </div>
  )
}

export default Home
