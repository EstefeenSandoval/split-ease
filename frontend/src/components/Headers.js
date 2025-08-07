import React from 'react';

const Headers = ({ onOpenModal }) => {
  const styles = {
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#498467',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoImg: {
      width: '60px',
      height: '60px',
      marginRight: '0px',
    },
    navLinks: {
      display: 'flex',
      listStyle: 'none',
      gap: '2rem',
      alignItems: 'center',
      margin: 0,
      padding: 0,
    },
    navLink: {
      textDecoration: 'none',
      color: '#2e3138',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontSize: '1rem',
    },
    navLinkHover: {
      color: '#498467',
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
    // Media queries para mobile
    '@media (max-width: 768px)': {
      navLinks: {
        gap: '1rem',
      },
      logo: {
        fontSize: '1.5rem',
      },
      logoImg: {
        width: '40px',
        height: '40px',
      },
    },
  };

  const [hoveredItem, setHoveredItem] = React.useState(null);
  const [hoveredBtn, setHoveredBtn] = React.useState(false);

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
    <header style={styles.header}>
      <nav style={styles.container}>
        <div style={styles.nav}>
          <a 
            href="#" 
            style={styles.logo}
            onClick={(e) => {
              e.preventDefault();
              handleScroll('#inicio');
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>💲</span>
            SplitEase
          </a>
          
          <ul style={styles.navLinks}>
            <li>
              <a 
                href="#inicio" 
                style={{
                  ...styles.navLink,
                  ...(hoveredItem === 'inicio' ? styles.navLinkHover : {})
                }}
                onMouseEnter={() => setHoveredItem('inicio')}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('#inicio');
                }}
              >
                Inicio
              </a>
            </li>
            <li>
              <a 
                href="#como-funciona" 
                style={{
                  ...styles.navLink,
                  ...(hoveredItem === 'como-funciona' ? styles.navLinkHover : {})
                }}
                onMouseEnter={() => setHoveredItem('como-funciona')}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('#como-funciona');
                }}
              >
                Cómo Funciona
              </a>
            </li>
            <li>
              <a 
                href="#caracteristicas" 
                style={{
                  ...styles.navLink,
                  ...(hoveredItem === 'caracteristicas' ? styles.navLinkHover : {})
                }}
                onMouseEnter={() => setHoveredItem('caracteristicas')}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('#caracteristicas');
                }}
              >
                Características
              </a>
            </li>
            <li>
              <button 
                onClick={() => onOpenModal('login')} 
                style={{
                  ...styles.navLink,
                  ...(hoveredItem === 'login' ? styles.navLinkHover : {})
                }}
                onMouseEnter={() => setHoveredItem('login')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Iniciar Sesión
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenModal('register')} 
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  ...(hoveredBtn ? styles.btnPrimaryHover : {})
                }}
                onMouseEnter={() => setHoveredBtn(true)}
                onMouseLeave={() => setHoveredBtn(false)}
              >
                Registrarse
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Headers;