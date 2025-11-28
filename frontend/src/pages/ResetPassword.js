import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { API_ENDPOINTS } from '../config/api';
import { isNativeApp } from '../utils/platform';
import './ResetPassword.css';

/**
 * Página para restablecer contraseña
 * Ruta: /reset-password/:token
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const isNative = isNativeApp();
  
  const [status, setStatus] = useState('validating'); // 'validating' | 'valid' | 'invalid' | 'success'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validar el token al cargar
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.usuarios.validarTokenReset(token), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.valido) {
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (error) {
        console.error('Error validando token:', error);
        setStatus('invalid');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe tener al menos una letra mayúscula.');
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError('La contraseña debe tener al menos un carácter especial.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.usuarios.resetPassword(token), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, confirmPassword })
      });

      const data = await response.json();

      if (response.ok && data.exito) {
        setStatus('success');
        toast.success('¡Contraseña restablecida correctamente!');
      } else if (data.tokenExpirado) {
        setStatus('invalid');
      } else {
        setError(data.error || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (isNative) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  // Calcular fortaleza de contraseña
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { label: 'Muy débil', color: '#ef4444' },
      { label: 'Débil', color: '#f97316' },
      { label: 'Regular', color: '#eab308' },
      { label: 'Fuerte', color: '#22c55e' },
      { label: 'Muy fuerte', color: '#10b981' }
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className={`reset-password-container ${isNative ? 'native' : ''}`}>
      <div className="reset-password-card">
        {/* Validando token */}
        {status === 'validating' && (
          <div className="reset-password-loading">
            <div className="reset-password-spinner-large"></div>
            <p>Validando enlace...</p>
          </div>
        )}

        {/* Token inválido o expirado */}
        {status === 'invalid' && (
          <div className="reset-password-invalid">
            <div className="reset-password-icon error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="reset-password-title">Enlace Inválido</h1>
            <p className="reset-password-subtitle">
              Este enlace ha expirado o no es válido. Los enlaces de recuperación son válidos por 1 hora.
            </p>
            <button onClick={() => navigate('/forgot-password')} className="reset-password-submit">
              Solicitar nuevo enlace
            </button>
            <button onClick={handleGoToLogin} className="reset-password-back-btn">
              Volver al inicio
            </button>
          </div>
        )}

        {/* Formulario de nueva contraseña */}
        {status === 'valid' && (
          <>
            <div className="reset-password-header">
              <div className="reset-password-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="reset-password-title">Nueva Contraseña</h1>
              <p className="reset-password-subtitle">
                Ingresa tu nueva contraseña. Asegúrate de que sea segura.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="reset-password-form">
              {/* Campo de contraseña */}
              <div className="reset-password-field">
                <label htmlFor="password" className="reset-password-label">
                  Nueva contraseña
                </label>
                <div className="reset-password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="reset-password-input"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Indicador de fortaleza */}
                {password && (
                  <div className="reset-password-strength">
                    <div className="reset-password-strength-bar">
                      <div 
                        className="reset-password-strength-fill"
                        style={{ 
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <span className="reset-password-strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Campo de confirmar contraseña */}
              <div className="reset-password-field">
                <label htmlFor="confirmPassword" className="reset-password-label">
                  Confirmar contraseña
                </label>
                <div className="reset-password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="reset-password-input"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Indicador de coincidencia */}
                {confirmPassword && (
                  <div className={`reset-password-match ${password === confirmPassword ? 'match' : 'no-match'}`}>
                    {password === confirmPassword ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Las contraseñas coinciden
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Las contraseñas no coinciden
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="reset-password-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`reset-password-submit ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="reset-password-spinner"></span>
                ) : (
                  'Restablecer contraseña'
                )}
              </button>
            </form>
          </>
        )}

        {/* Éxito */}
        {status === 'success' && (
          <div className="reset-password-success">
            <div className="reset-password-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="reset-password-title">¡Contraseña Actualizada!</h1>
            <p className="reset-password-subtitle">
              Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button onClick={handleGoToLogin} className="reset-password-submit">
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="reset-password-footer">
          <p>💰 SplitEase - Divide gastos, no amistades</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
