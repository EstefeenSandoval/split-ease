import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StatusBar, Style } from '@capacitor/status-bar';
import { API_ENDPOINTS } from './config/api';
import { isNativeApp } from './utils/platform';
import Headers from './components/common/Headers';
import Footer from './components/common/Footer';
import Modal from './components/common/Modal';
import NativeLayout from './components/common/NativeLayout';
import HomePage from './pages/HomePage';
import ComoFunciona from './pages/ComoFunciona';
import Caracteristica from './pages/Caracteristica';
import Dashboard from './pages/Dashboard';
import Grupos from './pages/Grupos';
import Gastos from './pages/Gastos';
import Opciones from './pages/Opciones';
import Notificacion from './pages/Notificacion';
import Pagos from './pages/Pagos';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyProfileChange from './pages/VerifyProfileChange';
import NativeAuth from './pages/NativeAuth';

// Wrapper component for native app pages
const NativeWrapper = ({ children }) => {
  const isNative = isNativeApp();
  
  if (isNative) {
    return <NativeLayout>{children}</NativeLayout>;
  }
  
  return children;
};

const App = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'login' // 'login' o 'register'
  });

  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const isNative = isNativeApp();

  // Configure Status Bar for native app
  useEffect(() => {
    if (isNative) {
      const configureStatusBar = async () => {
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
        } catch (e) {
          // Status bar not available
        }
      };
      configureStatusBar();
    }
  }, [isNative]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_ENDPOINTS.usuarios.validar, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.usuario) {
            setUser(data.usuario);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setUser(null);
        })
        .finally(() => {
          setIsAuthChecked(true);
        });
    } else {
      setIsAuthChecked(true);
    }
  }, []);

  // Funciones para manejar modales y usuario
  const openModal = (type) => {
    setModalState({ isOpen: true, type });
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'login' });
    document.body.style.overflow = 'auto';
  };

  const switchModal = (newType) => {
    setModalState({ isOpen: true, type: newType });
  };

  const handleLoginSuccess = (userData) => {
    // Actualizar el estado del usuario con los datos completos
    if (typeof userData === 'object') {
      setUser(userData);
    } else {
      // Si solo se pasa el nombre, intentar obtener datos del localStorage
      const storedUser = localStorage.getItem('usuario');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser({ nombre: userData });
        }
      } else {
        setUser({ nombre: userData });
      }
    }
  };

  const handleLogout = (navigate) => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && modalState.isOpen) {
        closeModal();
      }
    };

    if (modalState.isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [modalState.isOpen]);

  // Resetear overflow del body cuando se desmonta el componente
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Mostrar pantalla de carga mientras se verifica la autenticación en nativo
  if (isNative && !isAuthChecked) {
    return (
      <div className="native-loading-screen">
        <div className="native-loading-spinner"></div>
      </div>
    );
  }

  // En modo nativo, mostrar NativeAuth si no hay usuario autenticado
  if (isNative && !user) {
    return (
      <Router>
        <div className="App native-app-container">
          <Routes>
            <Route path="/" element={<NativeAuth onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verificar-email/:token" element={<VerifyEmail />} />
            <Route path="/verificar-cambio/:token" element={<VerifyProfileChange />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  // En modo nativo con usuario autenticado, mostrar las rutas de la app
  if (isNative && user) {
    return (
      <Router>
        <div className="App native-app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<NativeWrapper><Dashboard /></NativeWrapper>} />
            <Route path="/grupos" element={<NativeWrapper><Grupos /></NativeWrapper>} />
            <Route path="/gastos" element={<NativeWrapper><Gastos /></NativeWrapper>} />
            <Route path="/opciones" element={<NativeWrapper><Opciones /></NativeWrapper>} />
            <Route path="/notificaciones" element={<NativeWrapper><Notificacion /></NativeWrapper>} />
            <Route path="/pagos/:idGasto" element={<NativeWrapper><Pagos /></NativeWrapper>} />
            <Route path="/verificar-email/:token" element={<VerifyEmail />} />
            <Route path="/verificar-cambio/:token" element={<VerifyProfileChange />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  // Modo web (versión original)
  return (
    <Router>
      <div className="App">
        <Headers onOpenModal={openModal} user={user} onLogout={handleLogout} />
        
        {/* Rutas principales */}
        <Routes>
          {/* Rutas públicas (landing pages) */}
          <Route path="/" element={<HomePage onOpenModal={openModal} />} />
          <Route path="/inicio" element={<HomePage onOpenModal={openModal}/>} />
          <Route path="/como-funciona" element={<ComoFunciona onOpenModal={openModal} />} />
          <Route path="/caracteristicas" element={<Caracteristica onOpenModal={openModal} />} />
          
          {/* Rutas de la aplicación */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/opciones" element={<Opciones />} />
          <Route path="/notificaciones" element={<Notificacion />} />
          <Route path="/pagos/:idGasto" element={<Pagos />} />
          
          {/* Rutas de verificación y recuperación */}
          <Route path="/verificar-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verificar-cambio/:token" element={<VerifyProfileChange />} />
        </Routes>
        
        {/* Footer */}
        <Footer />
        
        {/* Modal para login/registro */}
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          onSwitchModal={switchModal}
          onLoginSuccess={handleLoginSuccess}
        />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
};

export default App;
