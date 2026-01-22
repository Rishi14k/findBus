import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Protect from './components/Protect';
import AdminHome from './pages/Admin/AdminHome';
import DriverHome from './pages/Driver/DriverHome';
import Unauthorise from './pages/Unauthorise';

const App = () => {
  return (
    <>
      <Routes>
        {/* public  */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorise/>}/>

        {/* admin  */}
        <Route element={<Protect allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminHome />} />
        </Route>

        {/* driver  */}
        <Route element={<Protect allowedRoles={["driver"]} />}>
          <Route path="/driver/dashboard" element={<DriverHome />} />
        </Route>

      {/* user + admin  */}
        <Route element={<Protect allowedRoles={["user", "admin"]} />}>
          <Route path="/" element={<Home />} />
        </Route>

      </Routes>

      <ToastContainer />
    </>
  );
}

export default App
