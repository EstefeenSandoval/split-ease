import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import './HeadersDropdown.css';
import './Headers.css';
import logo2 from '../../assets/logo2.png';
import { API_ENDPOINTS, construirURLEstatico } from '../../config/api';
import { NotificationBell } from '../notifications';


const Headers = ({ onOpenModal, user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [hoveredUserBtn, setHoveredUserBtn] = useState(false);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({
    nombre: '',
    foto_perfil: null
  });
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

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Listener para cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'usuario' && e.newValue) {
        try {
          const newUserData = JSON.parse(e.newValue);
          setUserProfile({
            nombre: newUserData.nombre || '',
            foto_perfil: newUserData.foto_perfil || null
          });
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    // Listener para eventos personalizados de actualización de perfil
    const handleProfileUpdate = () => {
      loadUserProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      // Primero intentar obtener datos del localStorage
      const userData = localStorage.getItem('usuario');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserProfile({
          nombre: parsedData.nombre || '',
          foto_perfil: parsedData.foto_perfil || null
        });
        // Establecer el userId si está disponible
        if (parsedData.id_usuario) {
          setUserId(parsedData.id_usuario);
        }
      }
      
      // Luego hacer una llamada a la API para obtener datos actualizados
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.usuarios.validar, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.usuario) {
        const profileData = {
          id_usuario: data.usuario.id_usuario,
          nombre: data.usuario.nombre,
          foto_perfil: data.usuario.foto_perfil
        };
        setUserProfile({
          nombre: profileData.nombre,
          foto_perfil: profileData.foto_perfil
        });
        setUserId(profileData.id_usuario);
        
        // Actualizar localStorage con datos frescos (incluyendo id_usuario)
        localStorage.setItem('usuario', JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Si hay error, al menos usar datos del localStorage
      const userData = localStorage.getItem('usuario');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserProfile({
          nombre: parsedData.nombre || '',
          foto_perfil: parsedData.foto_perfil || null
        });
        if (parsedData.id_usuario) {
          setUserId(parsedData.id_usuario);
        }
      }
    }
  };

  const obtenerFotoPerfilUrl = (fotoUrl) => {
    return construirURLEstatico(fotoUrl);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = (option) => {
    //console.log(`Navegando a: ${option}`);
    setIsDropdownOpen(false);
    
    // Navegación usando React Router
    switch (option) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'grupos':
        navigate('/grupos');
        break;
      case 'notificaciones':
        navigate('/notificaciones');
        break;
      case 'opciones':
        navigate('/opciones');
        break;
      default:
        console.log(`Opción no reconocida: ${option}`);
    }
  };

  let userName = '';
  try {
    userName = userProfile.nombre || '';
    // Fallback a localStorage si userProfile no tiene nombre
    if (!userName) {
      const userData = localStorage.getItem('usuario');
      if (userData) {
        userName = JSON.parse(userData).nombre || '';
      }
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
                {/* Campana de notificaciones */}
                <li className="header-notification-wrapper">
                  <NotificationBell userId={userId} />
                </li>
                
                <li className="header-user-menu" ref={dropdownRef}>
                  <button 
                    className={`header-user-button ${hoveredUserBtn ? 'hovered' : ''}`}
                    onClick={toggleDropdown}
                    onMouseEnter={() => setHoveredUserBtn(true)}
                    onMouseLeave={() => setHoveredUserBtn(false)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="header-user-avatar">
                      {userProfile.foto_perfil ? (
                        <>
                          <img 
                            src={obtenerFotoPerfilUrl(userProfile.foto_perfil)} 
                            alt="Foto de perfil" 
                            className="header-avatar-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.querySelector('.header-avatar-placeholder').style.display = 'flex';
                            }}
                          />
                          <div className="header-avatar-placeholder" style={{ display: 'none' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="header-avatar-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="header-user-name">{userName}</span>
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
                      
                      <button 
                        className={`header-dropdown-item ${hoveredDropdownItem === 'notificaciones' ? 'hovered' : ''}`}
                        onClick={() => handleMenuClick('notificaciones')}
                        onMouseEnter={() => setHoveredDropdownItem('notificaciones')}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" className="header-menu-icon">
                          <path d="M8 2a3 3 0 00-3 3v3L3 10v1h10v-1l-2-2V5a3 3 0 00-3-3zM6.5 12a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                        </svg>
                        Notificaciones
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
                    onClick={() => onLogout(navigate)}
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