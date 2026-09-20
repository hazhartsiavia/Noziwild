import React from 'react'
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Choose from "../components/Choose";
import Explore from "../components/Explore";
import Trips from "../components/Trips";
import Testimaonials from "../components/Testimaonials";

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Explore />
      <Choose />
      <Trips />
      <Testimaonials />
    </div>
  )
}

export default Home
