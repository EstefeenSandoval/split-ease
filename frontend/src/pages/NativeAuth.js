import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { API_ENDPOINTS } from '../config/api';
import logo2 from '../assets/logo2.png';
import './NativeAuth.css';

const NativeAuth = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const isLogin = activeTab === 'login';

  // Reset form when switching tabs
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, [activeTab]);

  const handleTabChange = async (tab) => {
    if (tab !== activeTab) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available
      }
      setActiveTab(tab);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    if (!isLogin && (!formData.name || !formData.confirmPassword)) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available
    }

    setIsLoading(true);

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
        setIsLoading(false);
        return;
      }
      
      if (isLogin && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify({
          id_usuario: data.usuario.id_usuario,
          nombre: data.usuario.nombre,
          email: data.usuario.email
        }));
        
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {
          // Haptics not available
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(data.usuario.nombre || formData.name || 'Usuario');
        }
        
        toast.success('¡Bienvenido de vuelta!');
        navigate('/dashboard');
      } else if (!isLogin) {
        toast.success(data.mensaje || '¡Cuenta creada exitosamente!');
        setActiveTab('login');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="native-auth">
      <div className="native-auth-container">
        {/* Logo Section */}
        <div className="native-auth-logo-section">
          <div className="native-auth-logo-wrapper">
            <img src={logo2} alt="SplitEase" className="native-auth-logo" />
          </div>
          <h1 className="native-auth-brand">SplitEase</h1>
          <p className="native-auth-tagline">Divide gastos, no amistades</p>
        </div>

        {/* Auth Card */}
        <div className="native-auth-card">
          {/* Tabs */}
          <div className="native-auth-tabs">
            <button
              type="button"
              className={`native-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`native-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => handleTabChange('register')}
            >
              Crear Cuenta
            </button>
            <div 
              className="native-auth-tab-indicator"
              style={{ transform: `translateX(${activeTab === 'login' ? '0' : '100%'})` }}
            />
          </div>

          {/* Form */}
          <form className="native-auth-form" onSubmit={handleSubmit}>
            <div className={`native-auth-form-content ${activeTab}`}>
              {!isLogin && (
                <div className="native-auth-field animate-field" style={{ animationDelay: '0ms' }}>
                  <label className="native-auth-label">Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="native-auth-input"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="native-auth-field animate-field" style={{ animationDelay: isLogin ? '0ms' : '50ms' }}>
                <label className="native-auth-label">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="native-auth-input"
                  autoComplete="email"
                />
              </div>

              <div className="native-auth-field animate-field" style={{ animationDelay: isLogin ? '50ms' : '100ms' }}>
                <label className="native-auth-label">Contraseña</label>
                <input
                  type="password"
                  placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="native-auth-input"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              {!isLogin && (
                <div className="native-auth-field animate-field" style={{ animationDelay: '150ms' }}>
                  <label className="native-auth-label">Confirmar contraseña</label>
                  <input
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="native-auth-input"
                    autoComplete="new-password"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`native-auth-submit ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="native-auth-spinner" />
                ) : (
                  isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer text */}
        <p className="native-auth-footer">
          {isLogin ? '¿Nuevo en SplitEase? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            className="native-auth-switch"
            onClick={() => handleTabChange(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Crea una cuenta' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default NativeAuth;
