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
import NativeAuth from './pages/NativeAuth';

const App = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'login' // 'login' o 'register'
  });

  const [user, setUser] = useState(null);
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
          });
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

  const handleLoginSuccess = (nombre) => {
    setUser({ nombre });
    
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

  // Native App Layout - No header/footer, uses bottom tabs
  if (isNative) {
    return (
      <Router>
        <div className="App native-app-container">
          <Routes>
            {/* Native Auth Screen */}
            <Route path="/" element={<NativeAuth onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/login" element={<NativeAuth onLoginSuccess={handleLoginSuccess} />} />
            
            {/* Protected routes with NativeLayout (includes BottomTabs) */}
            <Route path="/dashboard" element={
              <NativeLayout>
                <Dashboard />
              </NativeLayout>
            } />
            <Route path="/grupos" element={
              <NativeLayout>
                <Grupos />
              </NativeLayout>
            } />
            <Route path="/gastos" element={
              <NativeLayout>
                <Gastos />
              </NativeLayout>
            } />
            <Route path="/opciones" element={
              <NativeLayout>
                <Opciones onLogout={handleLogout} />
              </NativeLayout>
            } />
            <Route path="/notificaciones" element={
              <NativeLayout>
                <Notificacion />
              </NativeLayout>
            } />
            <Route path="/pagos/:idGasto" element={
              <NativeLayout>
                <Pagos />
              </NativeLayout>
            } />
            
            {/* Redirect marketing pages to auth in native */}
            <Route path="/inicio" element={<Navigate to="/" replace />} />
            <Route path="/como-funciona" element={<Navigate to="/" replace />} />
            <Route path="/caracteristicas" element={<Navigate to="/" replace />} />
          </Routes>
          
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    );
  }

  // Web Layout - Original behavior with header/footer
  return (
    <Router>
      <div className="App">
        <Headers onOpenModal={openModal} user={user} onLogout={handleLogout} />
        
        {/* Rutas principales */}
        <Routes>
          <Route path="/" element={<HomePage onOpenModal={openModal} />} />
          <Route path="/inicio" element={<HomePage onOpenModal={openModal}/>} />
          <Route path="/como-funciona" element={<ComoFunciona onOpenModal={openModal} />} />
          <Route path="/caracteristicas" element={<Caracteristica onOpenModal={openModal} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/opciones" element={<Opciones />} />
          <Route path="/notificaciones" element={<Notificacion />} />
          <Route path="/pagos/:idGasto" element={<Pagos />} />
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
        {/* ToastContainer solo para web - en nativo usamos Capacitor Toast */}
        {!isNative && (
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
        )}
      </div>
    </Router>
  );
};

export default App;
