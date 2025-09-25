import React from 'react';
import Hero from '../components/common/Hero';
import Features from '../components/common/Features';

const HomePage = ({ onOpenModal }) => {
  return (
    <>
      <Hero onOpenModal={onOpenModal} />
      <Features />
    </>
  );
};

export default HomePage;
