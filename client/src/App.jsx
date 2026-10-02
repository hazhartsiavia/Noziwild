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
import Circuits from "./pages/Circuits";
import LongStay from "./pages/LongStay";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import PlaceDetail from "./pages/PlaceDetail";
import Excurssions from "./pages/Excurssions";
import TailorMade from "./pages/TailorMade";

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
      <Route path="/Food-dining" element={<FoodDining/>} />
      <Route path="/ticket-reservation" element={<Ticketreservations/>} />
      <Route path="/travel-planning" element={<Travelplanning/>}/>
      <Route path="/circuits" element={< Circuits/>}/>
      <Route path="/longstay" element={< LongStay/>}/>
      <Route path="/destinations" element={< Destinations/>}/>
      <Route path="/destinations/:slug/:placeSlug" element={<PlaceDetail />} />
      <Route path="/destinations/:slug" element={<DestinationDetail />} />
      <Route path="/excurssions" element={<Excurssions/>}/>
      <Route path="/cruise-excurssion" element={<CruiseExcursions />} />
      <Route path="/tailor-made" element={<TailorMade />} />
    </Routes>
  );
}

export default App;