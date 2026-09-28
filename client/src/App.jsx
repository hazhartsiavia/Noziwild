import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Transport from "./pages/Transport";
import Hebergement from "./pages/Hebergement";
import Guides from "./pages/Guides"; 
  
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/transport" element={<Transport />} />
      <Route path="/hosting" element={<Hebergement />} />
      <Route path="/guide" element={<Guides />} />
    </Routes>
  );
}

export default App;