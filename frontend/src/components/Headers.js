import React, { useState, useRef, useEffect } from 'react';
import './HeadersDropdown.css';

const Headers = ({ onOpenModal, user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = (option) => {
    console.log(`Navegando a: ${option}`);
    setIsDropdownOpen(false);
    // Aquí puedes agregar la lógica de navegación
    // Por ejemplo, usando React Router
  };
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
    userMenu: {
      position: 'relative',
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(73, 132, 103, 0.1)',
      border: '1px solid rgba(73, 132, 103, 0.2)',
      color: '#498467',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.9rem',
      fontWeight: 'bold',
    },
    userButtonHover: {
      background: 'rgba(73, 132, 103, 0.2)',
      transform: 'translateY(-1px)',
    },
    dropdownArrow: {
      transition: 'transform 0.3s ease',
    },
    dropdownArrowOpen: {
      transform: 'rotate(180deg)',
    },
    dropdownMenu: {
      position: 'absolute',
      top: 'calc(100% + 0.5rem)',
      right: 0,
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      padding: '0.5rem 0',
      minWidth: '200px',
      zIndex: 1000,
      animation: 'fadeInDown 0.3s ease',
    },
    dropdownItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      border: 'none',
      background: 'none',
      color: '#374151',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      textAlign: 'left',
    },
    dropdownItemHover: {
      background: '#f3f4f6',
    },
    menuIcon: {
      color: '#6b7280',
      flexShrink: 0,
    },
    dropdownDivider: {
      margin: '0.5rem 0',
      border: 'none',
      height: '1px',
      background: '#e5e7eb',
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
  const [hoveredUserBtn, setHoveredUserBtn] = React.useState(false);
  const [hoveredDropdownItem, setHoveredDropdownItem] = React.useState(null);
  const handleScroll = (targetId) => {
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  let userName = '';
  try {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      userName = JSON.parse(userData).nombre || '';
    }
  } catch (e) {
    userName = '';
  }

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
            
            {user ? (
              <>
                <li style={styles.userMenu} ref={dropdownRef}>
                  <button 
                    style={{
                      ...styles.userButton,
                      ...(hoveredUserBtn ? styles.userButtonHover : {})
                    }}
                    onClick={toggleDropdown}
                    onMouseEnter={() => setHoveredUserBtn(true)}
                    onMouseLeave={() => setHoveredUserBtn(false)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>{userName}</span>
                    <svg 
                      style={{
                        ...styles.dropdownArrow,
                        ...(isDropdownOpen ? styles.dropdownArrowOpen : {})
                      }}
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div style={styles.dropdownMenu} className="dropdown-menu-animated">
                      <button 
                        style={{
                          ...styles.dropdownItem,
                          ...(hoveredDropdownItem === 'dashboard' ? styles.dropdownItemHover : {})
                        }}
                        onClick={() => handleMenuClick('dashboard')}
                        onMouseEnter={() => setHoveredDropdownItem('dashboard')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" style={styles.menuIcon}>
                          <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z" fill="currentColor"/>
                        </svg>
                        Dashboard
                      </button>
                      
                      <button 
                        style={{
                          ...styles.dropdownItem,
                          ...(hoveredDropdownItem === 'grupos' ? styles.dropdownItemHover : {})
                        }}
                        onClick={() => handleMenuClick('grupos')}
                        onMouseEnter={() => setHoveredDropdownItem('grupos')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" style={styles.menuIcon}>
                          <path d="M8 2a3 3 0 100 6 3 3 0 000-6zM2 14s0-4 6-4 6 4 6 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        Ver Grupos
                      </button>
                      
                      <hr style={styles.dropdownDivider} />
                      
                      <button 
                        style={{
                          ...styles.dropdownItem,
                          ...(hoveredDropdownItem === 'opciones' ? styles.dropdownItemHover : {})
                        }}
                        onClick={() => handleMenuClick('opciones')}
                        onMouseEnter={() => setHoveredDropdownItem('opciones')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" style={styles.menuIcon}>
                          <path d="M8 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 6.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="currentColor"/>
                        </svg>
                        Opciones
                      </button>
                    </div>
                  )}
                </li>
                <li>
                  <button
                    onClick={onLogout}
                    style={{
                      ...styles.btn,
                      ...styles.btnPrimary,
                      ...(hoveredBtn ? styles.btnPrimaryHover : {}),
                      marginLeft: '0.5rem',
                    }}
                    onMouseEnter={() => setHoveredBtn(true)}
                    onMouseLeave={() => setHoveredBtn(false)}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
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
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Headers;