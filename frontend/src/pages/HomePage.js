import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';

const HomePage = ({ onOpenModal }) => {
  return (
    <>
      <Hero onOpenModal={onOpenModal} />
      <Features />
    </>
  );
};

export default HomePage;
