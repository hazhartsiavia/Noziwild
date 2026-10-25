import { Routes, Route, Navigate } from "react-router-dom";
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
import CircuitDetail from "./pages/CircuitDetail";
import LongStay from "./pages/LongStay";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import PlaceDetail from "./pages/PlaceDetail";
import Excurssions from "./pages/Excurssions";
import CruiseExcursions from "./pages/CruiseExcurssions";
import TailorMade from "./pages/TailorMade";
import MyTrip from "./pages/MyTrip";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminCircuits from "./pages/admin/AdminCircuits";
import CircuitEditor from "./pages/admin/CircuitEditor";
import AdminInbox from "./pages/admin/AdminInbox";
import AdminOffers from "./pages/admin/AdminOffers";
import OfferEditor from "./pages/admin/OfferEditor";
import AdminTexts from "./pages/admin/AdminTexts";
import TextsEditor from "./pages/admin/TextsEditor";

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
      <Route path="/circuits/:slug" element={<CircuitDetail />} />
      <Route path="/longstay" element={< LongStay/>}/>
      <Route path="/destinations" element={< Destinations/>}/>
      <Route path="/destinations/:slug/:placeSlug" element={<PlaceDetail />} />
      <Route path="/destinations/:slug" element={<DestinationDetail />} />
      <Route path="/excurssions" element={<Excurssions/>}/>
      <Route path="/cruise-excurssion" element={<CruiseExcursions />} />
      <Route path="/tailor-made" element={<TailorMade />} />
      <Route path="/my-trip" element={<MyTrip />} />
      <Route path="/login" element={<Auth key="login" mode="login" />} />
      <Route path="/register" element={<Auth key="register" mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="circuits" replace />} />
        <Route path="circuits" element={<AdminCircuits />} />
        <Route path="circuits/new" element={<CircuitEditor key="new" />} />
        <Route path="circuits/:slug" element={<CircuitEditor />} />
        <Route path="offers" element={<Navigate to="activity" replace />} />
        <Route path="offers/:kind" element={<AdminOffers />} />
        <Route path="offers/:kind/new" element={<OfferEditor key="new" />} />
        <Route path="offers/:kind/:id" element={<OfferEditor />} />
        <Route path="texts" element={<AdminTexts />} />
        <Route path="texts/:namespace" element={<TextsEditor />} />
        <Route path="inbox" element={<AdminInbox />} />
      </Route>
    </Routes>
  );
}

export default App;