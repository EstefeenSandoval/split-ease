import React, { useState, useEffect } from 'react';
import Header from './components/Headers';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Modal from './components/Modal';

const App = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'login' // 'login' o 'register'
  });

  const styles = {
    app: {
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      lineHeight: 1.6,
    }
  };

  // Funciones para manejar modales
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

  // Smooth scrolling para los enlaces de navegación
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target;
      const href = target.getAttribute('href');
      
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    // Agregar event listener para links con href que empiecen con #
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', handleClick);
    });

    // Cleanup
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleClick);
      });
    };
  }, []);

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
    <div style={styles.app}>
      {/* Header con navegación */}
      <Header onOpenModal={openModal} />
      
      {/* Sección Hero principal */}
      <Hero onOpenModal={openModal} />
      
      {/* Sección de características */}
      <Features />
      
      {/* Footer */}
      <Footer />
      
      {/* Modal para login/registro */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        onSwitchModal={switchModal}
      />
    </div>
  );
};

export default App;