import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Transport from "./pages/Transport";
import Hebergement from "./pages/Hebergement";
import Guides from "./pages/Guides"; 
import Activities from "./pages/Activities";
import EquipmentRentals from "./pages/EquipmentRentals";
import Photography from "./pages/Photography";
import FoodDining from "./pages/FoodDining";
import Travelplanning from "./pages/Travelplanning";
import Ticketreservations from "./pages/Ticketsreservations";

  
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
      <Route path="/activities" element={<Activities/>}/>
      <Route path="/equipment-rentals" element={<EquipmentRentals />} />
      <Route path="/photography" element={<Photography />} />
      <Route path="Food-dining" element={<FoodDining/>} />
      <Route path="ticket-reservation" element={<Ticketreservations/>} />
      <Route path="travel-planning" element={<Travelplanning/>}/>

    </Routes>
  );
}

export default App;