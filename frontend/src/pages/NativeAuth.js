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
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
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
    setShowRegistrationSuccess(false);
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
        const userData = {
          id_usuario: data.usuario.id_usuario,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          email_verificado: data.usuario.email_verificado || false
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {
          // Haptics not available
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        
        toast.success('¡Bienvenido de vuelta!');
        navigate('/dashboard');
      } else if (!isLogin) {
        setRegisteredEmail(formData.email);
        setShowRegistrationSuccess(true);
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {
          // Haptics not available
        }
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleGoToLogin = () => {
    setShowRegistrationSuccess(false);
    setActiveTab('login');
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  // Show registration success screen
  if (showRegistrationSuccess) {
    return (
      <div className="native-auth">
        <div className="native-auth-container">
          <div className="native-auth-logo-section">
            <div className="native-auth-logo-wrapper">
              <img src={logo2} alt="SplitEase" className="native-auth-logo" />
            </div>
          </div>

          <div className="native-auth-card">
            <div className="native-auth-success">
              <div className="success-icon">📧</div>
              <h2>¡Cuenta creada!</h2>
              <p>Te hemos enviado un correo de verificación a:</p>
              <div className="email-highlight">{registeredEmail}</div>
              <p>Por favor revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.</p>
              <p className="success-note">Si no ves el correo, revisa tu carpeta de spam.</p>
              <button 
                type="button"
                className="native-auth-submit"
                onClick={handleGoToLogin}
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

              {isLogin && (
                <button
                  type="button"
                  className="native-auth-forgot"
                  onClick={handleForgotPassword}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
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
