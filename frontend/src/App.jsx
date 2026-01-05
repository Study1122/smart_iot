import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; // <-- this line is
import Dashboard from "./pages/Dashboard";
import DeviceDetails from "./pages/DeviceDetails";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/device/:id" element={<DeviceDetails />} />
    </Routes>
  );
};

export default App;