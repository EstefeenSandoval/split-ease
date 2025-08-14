import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = ({ onOpenModal }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const styles = {
    hero: {
      padding: '4rem 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #bcebcb 0%, #f0f9f2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    },
    heroBackground: {
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(188, 235, 203, 0.3) 0%, transparent 70%)',
      animation: 'float 6s ease-in-out infinite',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      position: 'relative',
      zIndex: 2,
    },
    title: {
      fontSize: '3.5rem',
      marginBottom: '1rem',
      color: '#252627',
      fontWeight: '800',
    },
    highlight: {
      color: '#498467',
      position: 'relative',
    },
    highlightUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: '#bcebcb',
      transformOrigin: 'left',
      animation: 'underline 2s ease-out 1s forwards',
      transform: 'scaleX(0)',
    },
    subtitle: {
      fontSize: '1.3rem',
      marginBottom: '2rem',
      color: '#998888',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    heroButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: '3rem',
    },
    btn: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      fontSize: '1rem',
    },
    btnPrimary: {
      background: '#498467',
      color: 'white',
    },
    btnPrimaryHover: {
      background: '#3a6b55',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(73, 132, 103, 0.3)',
    },
    btnSecondary: {
      background: 'transparent',
      color: '#498467',
      border: '2px solid #498467',
    },
    btnSecondaryHover: {
      background: '#498467',
      color: 'white',
    },
    heroIllustration: {
      maxWidth: '400px',
      margin: '0 auto',
      position: 'relative',
    },
    moneyStack: {
      width: '300px',
      height: '300px',
      margin: '0 auto',
      position: 'relative',
      animation: 'bounce 2s ease-in-out infinite',
    },
    bill: {
      position: 'absolute',
      width: '80px',
      height: '40px',
      background: 'linear-gradient(45deg, #bcebcb, #498467)',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
    bill1: {
      top: '50px',
      left: '50px',
      transform: 'rotate(-15deg)',
    },
    bill2: {
      top: '70px',
      left: '80px',
      transform: 'rotate(10deg)',
    },
    bill3: {
      top: '90px',
      left: '60px',
      transform: 'rotate(-5deg)',
    },
    bill4: {
      top: '110px',
      left: '90px',
      transform: 'rotate(20deg)',
    },
    splitArrow: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '3rem',
      color: '#498467',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    // Media queries para mobile
    '@media (max-width: 768px)': {
      title: {
        fontSize: '2.5rem',
      },
      heroButtons: {
        flexDirection: 'column',
        alignItems: 'center',
      },
      moneyStack: {
        width: '250px',
        height: '250px',
      },
    },
  };

  // Agregar estilos CSS para animaciones
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      @keyframes underline {
        to { transform: scaleX(1); }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
    <section id="inicio" style={styles.hero}>
      <div style={styles.heroBackground}></div>
      
      <div style={styles.container}>
        <div>
          <h1 style={styles.title}>
            Divide tus{' '}
            <span style={styles.highlight}>
              gastos
              <div style={styles.highlightUnderline}></div>
            </span>
            <br />
            entre amigos
          </h1>
          
          <p style={styles.subtitle}>
            Convierte tus gastos más grandes en pagos más manejables. SplitEase hace que dividir cuentas sea súper fácil.
          </p>
          
          <div style={styles.heroButtons}>
            <button 
              onClick={() => onOpenModal('register')} 
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                ...(hoveredBtn === 'primary' ? styles.btnPrimaryHover : {})
              }}
              onMouseEnter={() => setHoveredBtn('primary')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Comenzar Gratis
            </button>
            
            <button 
              onClick={() => handleScroll('#como-funciona')} 
              style={{
                ...styles.btn,
                ...styles.btnSecondary,
                ...(hoveredBtn === 'secondary' ? styles.btnSecondaryHover : {})
              }}
              onMouseEnter={() => setHoveredBtn('secondary')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Ver Cómo Funciona
            </button>
          </div>

          <div style={styles.heroIllustration}>
            <div style={styles.moneyStack}>
              <div style={{...styles.bill, ...styles.bill1}}></div>
              <div style={{...styles.bill, ...styles.bill2}}></div>
              <div style={{...styles.bill, ...styles.bill3}}></div>
              <div style={{...styles.bill, ...styles.bill4}}></div>
              <div style={styles.splitArrow}>➗</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;