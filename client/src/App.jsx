import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Protect from './components/Protect';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Protect />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App
