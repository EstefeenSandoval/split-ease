import React, { useState, useEffect } from 'react';

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);

  const styles = {
    features: {
      padding: '4rem 0',
      background: 'white',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    title: {
      textAlign: 'center',
      fontSize: '2.5rem',
      marginBottom: '3rem',
      color: '#252627',
      fontWeight: 'bold',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    featureCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'all 0.6s ease',
      border: '2px solid #bcebcb',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    },
    featureCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
    },
    featureIcon: {
      width: '60px',
      height: '60px',
      background: '#bcebcb',
      borderRadius: '50%',
      margin: '0 auto 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#498467',
    },
    featureTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#252627',
    },
    featureDescription: {
      color: '#998888',
      lineHeight: '1.6',
      fontSize: '1rem',
    },
    // Media queries para mobile
    '@media (max-width: 768px)': {
      featuresGrid: {
        gridTemplateColumns: '1fr',
      },
      title: {
        fontSize: '2rem',
      },
    },
  };

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

  const [hoveredCards, setHoveredCards] = useState({});

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
    <section id="caracteristicas" style={styles.features}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          ¿Por qué elegir SplitEase?
        </h2>
        
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                ...styles.featureCard,
                transitionDelay: isVisible ? `${index * 200}ms` : '0ms',
                ...(hoveredCards[index] ? styles.featureCardHover : {})
              }}
              onMouseEnter={() => handleCardHover(index, true)}
              onMouseLeave={() => handleCardHover(index, false)}
            >
              <div style={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>
                {feature.title}
              </h3>
              <p style={styles.featureDescription}>
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