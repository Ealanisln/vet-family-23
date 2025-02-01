// components/Navbar/index.tsx
"use client";
import Navbar from "./Navbar";
import React, { useEffect, useState } from "react";

const Navbarin: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-30 pt-3 pb-4 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#91D8D9] shadow-md' 
        : 'bg-gradient-to-r from-[#91D8D9] to-transparent'
    }`}>
      <Navbar />
    </div>
  );
};

export default Navbarin;