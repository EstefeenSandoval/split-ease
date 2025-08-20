import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import './HeadersDropdown.css';
import './Headers.css';
import logo from '../assets/logo.png';
import logo2 from '../assets/logo2.png';


const Headers = ({ onOpenModal, user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [hoveredUserBtn, setHoveredUserBtn] = useState(false);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    <header className="header-section">
      <nav className="header-container">
        <div className="header-nav">
          <Link 
            to="/" 
            className="header-logo"
          >
            {/*<span style={{ fontSize: '2.5rem' }}>💲</span> */}
            <img src={logo2} alt="Logo" className="header-logo-img" />
            SplitEase
          </Link>
          <ul className="header-nav-links">
            <li>
              <Link
                to="/inicio" 
                className={`header-nav-link ${hoveredItem === 'inicio' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem('inicio')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/como-funciona" 
                className={`header-nav-link ${hoveredItem === 'como-funciona' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem('como-funciona')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Cómo Funciona
              </Link>
            </li>
            <li>
              <Link
                to="/caracteristicas"
                className={`header-nav-link ${hoveredItem === 'caracteristicas' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem('caracteristicas')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Características
              </Link>
            </li>
            
            {user ? (
              <>
                <li className="header-user-menu" ref={dropdownRef}>
                  <button 
                    className={`header-user-button ${hoveredUserBtn ? 'hovered' : ''}`}
                    onClick={toggleDropdown}
                    onMouseEnter={() => setHoveredUserBtn(true)}
                    onMouseLeave={() => setHoveredUserBtn(false)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>{userName}</span>
                    <svg 
                      className={`header-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="header-dropdown-menu dropdown-menu-animated">
                      <button 
                        className={`header-dropdown-item ${hoveredDropdownItem === 'dashboard' ? 'hovered' : ''}`}
                        onClick={() => handleMenuClick('dashboard')}
                        onMouseEnter={() => setHoveredDropdownItem('dashboard')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" className="header-menu-icon">
                          <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z" fill="currentColor"/>
                        </svg>
                        Dashboard
                      </button>
                      
                      <button 
                        className={`header-dropdown-item ${hoveredDropdownItem === 'grupos' ? 'hovered' : ''}`}
                        onClick={() => handleMenuClick('grupos')}
                        onMouseEnter={() => setHoveredDropdownItem('grupos')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" className="header-menu-icon">
                          <path d="M8 2a3 3 0 100 6 3 3 0 000-6zM2 14s0-4 6-4 6 4 6 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        Ver Grupos
                      </button>
                      
                      <hr className="header-dropdown-divider" />
                      
                      <button 
                        className={`header-dropdown-item ${hoveredDropdownItem === 'opciones' ? 'hovered' : ''}`}
                        onClick={() => handleMenuClick('opciones')}
                        onMouseEnter={() => setHoveredDropdownItem('opciones')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" className="header-menu-icon">
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
                    className={`header-btn header-btn-primary ${hoveredBtn ? 'hovered' : ''}`}
                    style={{ marginLeft: '0.5rem' }}
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
                    className={`header-nav-link ${hoveredItem === 'login' ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredItem('login')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onOpenModal('register')} 
                    className={`header-btn header-btn-primary ${hoveredBtn ? 'hovered' : ''}`}
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