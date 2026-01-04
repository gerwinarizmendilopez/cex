import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Catalogo } from "./pages/Catalogo";
import { BeatDetail } from "./pages/BeatDetail";
import { Licencias } from "./pages/Licencias";
import { Admin } from "./pages/Admin";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/beat/:id" element={<BeatDetail />} />
          <Route path="/licencias" element={<Licencias />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
