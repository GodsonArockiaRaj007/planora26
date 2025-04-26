// src/components/Home.jsx
import React from 'react';
import Navbar from './Navbar';
import HeroBanner from './HeroBanner';
import SearchSection from './SearchSection';
import PopularCities from './PopularCities';
import CompanyGrid from './CompanyGrid'; // 👈 Import the new component
import Footer from './Footer'; // 👈 Import Footer

const Home = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <HeroBanner />
      <SearchSection />
      <PopularCities />
      <CompanyGrid /> {/* 👈 Display all companies here */}
      <Footer /> {/* 👈 Add the Footer at the bottom */}
    </div>
  );
};

export default Home;
