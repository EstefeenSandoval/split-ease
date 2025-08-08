import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Modal = ({ isOpen, onClose, type, onSwitchModal, onLoginSuccess }) => {
  const [hoveredClose, setHoveredClose] = useState(false);
  const [hoveredSubmit, setHoveredSubmit] = useState(false);
  const [hoveredSwitch, setHoveredSwitch] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const styles = {
    modal: {
      display: isOpen ? 'block' : 'none',
      position: 'fixed',
      zIndex: 2000,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
    },
    modalContent: {
      backgroundColor: 'white',
      margin: '5% auto',
      padding: 0,
      borderRadius: '15px',
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      animation: isOpen ? 'modalSlideIn 0.3s ease-out' : '',
    },
    modalHeader: {
      padding: '2rem 2rem 1rem',
      textAlign: 'center',
      position: 'relative',
    },
    close: {
      position: 'absolute',
      right: '1rem',
      top: '1rem',
      color: '#998888',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
      background: 'none',
      border: 'none',
    },
    closeHover: {
      background: '#bcebcb',
      color: '#498467',
    },
    modalTitle: {
      color: '#498467',
      marginBottom: '0.5rem',
      fontSize: '1.8rem',
      fontWeight: 'bold',
    },
    modalSubtitle: {
      color: '#998888',
      fontSize: '1rem',
    },
    modalBody: {
      padding: '0 2rem 2rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#252627',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #bcebcb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box',
    },
    inputFocus: {
      borderColor: '#498467',
      outline: 'none',
    },
    formSubmit: {
      width: '100%',
      padding: '15px',
      background: '#498467',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
    },
    formSubmitHover: {
      background: '#3a6b55',
    },
    switchText: {
      textAlign: 'center',
      marginTop: '1rem',
      color: '#998888',
    },
    switchLink: {
      color: '#498467',
      cursor: 'pointer',
      textDecoration: 'none',
      background: 'none',
      border: 'none',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      padding: 0,
    },
    switchLinkHover: {
      textDecoration: 'underline',
    },
    // Media queries para mobile
    '@media (max-width: 768px)': {
      modalContent: {
        margin: '10% auto',
        width: '95%',
      },
    },
  };

  const isLogin = type === 'login';

  // Agregar estilos CSS para animaciones
  useEffect(() => {
    if (isOpen) {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = `
        @keyframes modalSlideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styleSheet);
      document.body.style.overflow = 'hidden';

      return () => {
        if (document.head.contains(styleSheet)) {
          document.head.removeChild(styleSheet);
        }
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  // Limpiar form data cuando cambia el tipo de modal
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, [type]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isLogin && (!formData.name || !formData.confirmPassword)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
  toast.error('Por favor ingresa un correo electrónico válido');
  return;
    }

    try {
      const endpoint = isLogin ? 'http://localhost:3100/api/usuarios/login' : 'http://localhost:3100/api/usuarios/registro';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { nombre: formData.name, email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
  toast.error(data.error || 'Error en la petición');
  return;
      }

      if (isLogin && data.token) {
        localStorage.setItem('token', data.token);
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify({ nombre: data.usuario.nombre }));
        if (onLoginSuccess) {
          onLoginSuccess(data.usuario.nombre || formData.name || 'Usuario');
        }
      }
  toast.success(data.mensaje || 'Operación exitosa');
  onClose();
    } catch (err) {
  toast.error('Error de conexión con el servidor');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modal} onClick={handleBackdropClick}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <button
            onClick={onClose}
            style={{
              ...styles.close,
              ...(hoveredClose ? styles.closeHover : {})
            }}
            onMouseEnter={() => setHoveredClose(true)}
            onMouseLeave={() => setHoveredClose(false)}
          >
            ×
          </button>
          <h2 style={styles.modalTitle}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={styles.modalSubtitle}>
            {isLogin ? 'Bienvenido de vuelta a SplitEase' : 'Únete a SplitEase y comienza a dividir gastos'}
          </p>
        </div>
        
        <div style={styles.modalBody}>
          <div>
            {!isLogin && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#498467'}
                  onBlur={(e) => e.target.style.borderColor = '#bcebcb'}
                />
              </div>
            )}
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#498467'}
                onBlur={(e) => e.target.style.borderColor = '#bcebcb'}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#498467'}
                onBlur={(e) => e.target.style.borderColor = '#bcebcb'}
              />
            </div>
            
            {!isLogin && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#498467'}
                  onBlur={(e) => e.target.style.borderColor = '#bcebcb'}
                />
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              style={{
                ...styles.formSubmit,
                ...(hoveredSubmit ? styles.formSubmitHover : {})
              }}
              onMouseEnter={() => setHoveredSubmit(true)}
              onMouseLeave={() => setHoveredSubmit(false)}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </div>
          
          <p style={styles.switchText}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => onSwitchModal(isLogin ? 'register' : 'login')}
              style={{
                ...styles.switchLink,
                ...(hoveredSwitch ? styles.switchLinkHover : {})
              }}
              onMouseEnter={() => setHoveredSwitch(true)}
              onMouseLeave={() => setHoveredSwitch(false)}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Modal;