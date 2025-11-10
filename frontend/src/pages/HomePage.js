import React from 'react';
import Hero from '../components/common/Hero';
import Features from '../components/common/Features';

function HomePage({ onOpenModal }) {
  return (
    <div className="home-page">
      <Hero onOpenModal={onOpenModal} />
      <Features />
    </div>
  );
}

export default HomePage;
