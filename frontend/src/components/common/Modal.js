import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config/api';
import './Modal.css';

const Modal = ({ isOpen, onClose, type, onSwitchModal, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={handleBackdropClick}>
      <div className="modal-content">
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
      </div>
    </div>
  );
};

export default Modal;