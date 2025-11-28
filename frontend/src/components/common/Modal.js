import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config/api';
import './Modal.css';

const Modal = ({ isOpen, onClose, type, onSwitchModal, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const isLogin = type === 'login';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent scrolling on mobile devices
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.overflow = 'auto';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowRegistrationSuccess(false);
  }, [type]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    
    let score = 0;
    
    // Longitud
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) score++;
    
    // Minúsculas
    if (/[a-z]/.test(password)) score++;
    
    // Números
    if (/[0-9]/.test(password)) score++;
    
    // Caracteres especiales
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
    
    if (score <= 2) return { level: 1, label: 'Débil', color: '#e74c3c' };
    if (score <= 4) return { level: 2, label: 'Media', color: '#f39c12' };
    return { level: 3, label: 'Fuerte', color: '#27ae60' };
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
    // Validar contraseña segura solo en registro
    if (!isLogin) {
      if (formData.password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      if (!/[A-Z]/.test(formData.password)) {
        toast.error('La contraseña debe tener al menos una letra mayúscula');
        return;
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
        toast.error('La contraseña debe tener al menos un carácter especial');
        return;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }
    try {
      const endpoint = isLogin ? API_ENDPOINTS.usuarios.login : API_ENDPOINTS.usuarios.registro;
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
        localStorage.setItem('usuario', JSON.stringify({
          id_usuario: data.usuario.id_usuario,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          email_verificado: data.usuario.email_verificado
        }));
        if (onLoginSuccess) {
          onLoginSuccess(data.usuario.nombre || formData.name || 'Usuario');
        }
        toast.success(data.mensaje || 'Operación exitosa');
        onClose();
      } else if (!isLogin) {
        // Registro exitoso - mostrar mensaje de verificación
        setRegisteredEmail(formData.email);
        setShowRegistrationSuccess(true);
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const handleForgotPassword = () => {
    onClose();
    navigate('/forgot-password');
  };

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={handleBackdropClick}>
      <div className="modal-content">
        {showRegistrationSuccess ? (
          // Mensaje de registro exitoso con verificación de email
          <div className="modal-success-registration">
            <div className="modal-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="modal-title">¡Cuenta creada!</h2>
            <p className="modal-subtitle">
              Hemos enviado un correo de verificación a:
            </p>
            <p className="modal-email-highlight">{registeredEmail}</p>
            <p className="modal-verification-hint">
              Revisa tu bandeja de entrada (y spam) para verificar tu cuenta.
            </p>
            <button
              onClick={() => {
                setShowRegistrationSuccess(false);
                onSwitchModal('login');
              }}
              className="modal-submit"
              type="button"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
        <>
        <div className="modal-header">
          <button
            onClick={onClose}
            className="modal-close"
            type="button"
          >
            
          </button>
          <h2 className="modal-title">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="modal-subtitle">
            {isLogin ? 'Bienvenido de vuelta a SplitEase' : 'Únete a SplitEase y comienza a dividir gastos'}
          </p>
        </div>

        <div className="modal-body">
          {!isLogin && (
            <div className="modal-form-group">
              <label className="modal-label">Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="modal-input"
                 onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
            </div>
          )}

          <div className="modal-form-group">
            <label className="modal-label">Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="modal-input"
               onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Contraseña</label>
            <input
              type="password"
              placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="modal-input"
               onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            />
            {!isLogin && formData.password && (
              <>
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{ 
                      width: `${(getPasswordStrength(formData.password).level / 3) * 100}%`,
                      backgroundColor: getPasswordStrength(formData.password).color
                    }}
                  />
                </div>
                <div className="password-strength-label" style={{ color: getPasswordStrength(formData.password).color }}>
                  Seguridad: {getPasswordStrength(formData.password).label}
                </div>
                <div className="password-requirements">
                  <span className={formData.password.length >= 8 ? 'valid' : 'invalid'}>
                    ✓ 8+ caracteres
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}>
                    ✓ Una mayúscula
                  </span>
                  <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password) ? 'valid' : 'invalid'}>
                    ✓ Un carácter especial
                  </span>
                </div>
              </>
            )}
          </div>

          {!isLogin && (
            <div className="modal-form-group">
              <label className="modal-label">Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="modal-input"
                 onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="modal-submit"
            type="button"
          >
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>

          {isLogin && (
            <button
              onClick={handleForgotPassword}
              className="modal-forgot-password"
              type="button"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <p className="modal-switch-text">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => onSwitchModal(isLogin ? 'register' : 'login')}
              className="modal-switch-link"
              type="button"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Modal;