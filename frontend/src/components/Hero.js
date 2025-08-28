import React, { useState } from 'react';
import './Hero.css';

const Hero = ({ onOpenModal }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleScroll = (targetId) => {
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="inicio" className="hero-section">
      <div className="hero-background"></div>
      
      <div className="hero-container">
        <div>
          <h1 className="hero-title">
            Divide tus{' '}
            <span className="hero-highlight">
              gastos
              <div className="hero-highlight-underline"></div>
            </span>
            <br />
            entre amigos
          </h1>
          
          <p className="hero-subtitle">
            Convierte tus gastos más grandes en pagos más manejables. SplitEase hace que dividir cuentas sea súper fácil.
          </p>
          
          <div className="hero-buttons">
            <button 
              onClick={() => onOpenModal('register')} 
              className={`hero-btn hero-btn-primary ${hoveredBtn === 'primary' ? 'hero-btn-primary-hover' : ''}`}
              onMouseEnter={() => setHoveredBtn('primary')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Comenzar Gratis
            </button>
            
            <button 
              onClick={() => handleScroll('#como-funciona')} 
              className={`hero-btn hero-btn-secondary ${hoveredBtn === 'secondary' ? 'hero-btn-secondary-hover' : ''}`}
              onMouseEnter={() => setHoveredBtn('secondary')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Ver Cómo Funciona
            </button>
          </div>

          <div className="hero-illustration">
            <div className="hero-money-stack">
              <div className="hero-bill hero-bill-1"></div>
              <div className="hero-bill hero-bill-2"></div>
              <div className="hero-bill hero-bill-3"></div>
              <div className="hero-bill hero-bill-4"></div>
              <div className="hero-split-arrow">➗</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;