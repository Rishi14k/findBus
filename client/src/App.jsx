import React, { useEffect, useState } from "react";
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Protect from "./components/Protect";
import AdminHome from "./pages/Admin/AdminHome";
import DriverHome from "./pages/Driver/DriverHome";
import Unauthorise from "./pages/Unauthorise";
import MagicLinkLogin from "./components/driver/MagicLinkLogin";
import SelectBus from "./pages/Driver/SelectBus";
import BusDetailsPage from "./components/user/BusDetailsPage";
import TrackingPage from "./pages/TrackingPage";

 export const usePWAInstall = () => {
   const [deferredPrompt, setDeferredPrompt] = useState(null);

   useEffect(() => {
     window.addEventListener("beforeinstallprompt", (e) => {
       e.preventDefault();
       setDeferredPrompt(e);
     });
   }, []);

   const installApp = async () => {
     if (!deferredPrompt) return;
     deferredPrompt.prompt();
     const {outcome} = await deferredPrompt.userChoice;
     if (outcome === "accepted") setDeferredPrompt(null);
   };

   return {isInstallable: !!deferredPrompt, installApp};
 };

const App = () => {

  return (
    <>
      <Routes>
        {/* public  */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorise />} />
        <Route path="/magic-link" element={<MagicLinkLogin />} />

        {/* admin  */}
        <Route element={<Protect allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminHome />} />
        </Route>

        {/* driver  */}
        <Route element={<Protect allowedRoles={["driver"]} />}>
          <Route path="/driver/select-bus" element={<SelectBus />} />
          <Route path="/driver/dashboard" element={<DriverHome />} />
        </Route>

        {/* user + admin  */}
        <Route element={<Protect allowedRoles={["user", "admin"]} />}>
          <Route path="/" element={<Home />} />
          <Route path="/bus/:busId" element={<BusDetailsPage />} />
          <Route path="/bus/live/:busId" element={<TrackingPage />} />
        </Route>
      </Routes>

      <ToastContainer />
    </>
  );
};

export default App;
