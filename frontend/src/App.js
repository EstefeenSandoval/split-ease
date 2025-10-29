import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINTS } from './config/api';
import Headers from './components/common/Headers';
import Footer from './components/common/Footer';
import Modal from './components/common/Modal';
import HomePage from './pages/HomePage';
import ComoFunciona from './pages/ComoFunciona';
import Caracteristica from './pages/Caracteristica';
import Dashboard from './pages/Dashboard';
import Grupos from './pages/Grupos';
import Opciones from './pages/Opciones';
import Notificacion from './pages/Notificacion';
import Pagos from './pages/Pagos';

const App = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'login' // 'login' o 'register'
  });

  const [user, setUser] = useState(null);

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
