import React, { useState, useEffect } from 'react';
import './Features.css';

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCards, setHoveredCards] = useState({});

  const features = [
    {
      icon: '👥',
      title: 'Fácil de usar',
      description: 'Interfaz intuitiva que hace que dividir gastos sea tan simple como enviar un mensaje.'
    },
    {
      icon: '💳',
      title: 'Pagos seguros',
      description: 'Integración con múltiples métodos de pago para transacciones seguras y rápidas.'
    },
    {
      icon: '📊',
      title: 'Seguimiento inteligente',
      description: 'Mantén un registro detallado de todos tus gastos compartidos y balances pendientes.'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    const featuresSection = document.querySelector('#caracteristicas');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => {
      if (featuresSection) {
        observer.unobserve(featuresSection);
      }
    };
  }, []);

  const handleCardHover = (index, isHovered) => {
    setHoveredCards(prev => ({
      ...prev,
      [index]: isHovered
    }));
  };

  return (
    <section id="caracteristicas" className="features-section">
      <div className="features-container">
        <h2 className="features-title">
          ¿Por qué elegir SplitEase?
        </h2>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${isVisible ? 'visible' : ''}`}
              style={{
                transitionDelay: isVisible ? `${index * 200}ms` : '0ms',
              }}
              onMouseEnter={() => handleCardHover(index, true)}
              onMouseLeave={() => handleCardHover(index, false)}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">
                {feature.title}
              </h3>
              <p className="feature-card-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;