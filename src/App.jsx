import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Nitttrc from "./pages/Nitttrc";
import SsnLab from "./pages/SsnLab";
import Head from "./pages/Head";
import Login from "./pages/Login";
import CoursePage from "./pages/CoursePage";
import AwardPage from "./pages/AwardPage";
import PublicationPage from "./pages/PublicationPage";
import GalleryPage from "./pages/GalleryPage";
import OutsideWorld from "./pages/OutsideWorld";
import NetworkIncharge from "./pages/NetworkIncharge";
import AudioIncharge from "./pages/AudioIncharge";
import Dc from "./pages/Dc";
import InvitedTalks from "./pages/InvitedTalks";

/* ✅ NEW IMPORTS */
import AsCoordinator from "./pages/AsCoordinator";
import PdpResource from "./pages/PdpResource";

/* ✅ NEW PAGES (SAME TEMPLATE STYLE) */
import Pg from "./pages/Pg";
import Itec from "./pages/Itec";
import HostInstitution from "./pages/HostInstitution";
import Workshops from "./pages/Workshops";
import InternationalCollaboration from "./pages/InternationalCollaboration";
import GuestLectures from "./pages/GuestLectures";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nitttrc" element={<Nitttrc />} />
        <Route path="/ssnlab" element={<SsnLab />} />
        <Route path="/head" element={<Head />} />
        <Route path="/login" element={<Login />} />

        {/* Course Main Page */}
        <Route path="/course" element={<CoursePage />} />
        <Route path="/course/pdp" element={<CoursePage />} />

        {/* ✅ EXISTING */}
        <Route path="/as-coordinator" element={<AsCoordinator />} />
        <Route path="/pdp-resource" element={<PdpResource />} />
        <Route path="/invited-talks" element={<InvitedTalks />} />

        {/* ✅ NEW ROUTES */}
        <Route path="/pg" element={<Pg />} />
        <Route path="/itec" element={<Itec />} />
        <Route path="/host-institution" element={<HostInstitution />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route
          path="/international-collaboration"
          element={<InternationalCollaboration />}
        />
        <Route path="/guest-lectures" element={<GuestLectures />} />

        <Route path="/award" element={<AwardPage />} />
        <Route path="/publication" element={<PublicationPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/outsideworld" element={<OutsideWorld />} />
        <Route path="/network" element={<NetworkIncharge />} />
        <Route path="/audioincharge" element={<AudioIncharge />} />
        <Route path="/dc" element={<Dc />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;