import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Explore from './components/Explore'
import Choose from './components/Choose'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Navbar />
      <Hero />
      <Explore />
      <Choose />
    </div>
  )
}

export default App
