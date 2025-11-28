import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { isNativeApp } from '../utils/platform';
import './ForgotPassword.css';

/**
 * Página de solicitud de recuperación de contraseña
 * Ruta: /forgot-password
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const isNative = isNativeApp();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.usuarios.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else if (data.requiereVerificacion) {
        setError('Debes verificar tu email antes de poder recuperar tu contraseña. Revisa tu bandeja de entrada.');
      } else {
        // Por seguridad, siempre mostramos el mismo mensaje
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error solicitando recuperación:', error);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (isNative) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`forgot-password-container ${isNative ? 'native' : ''}`}>
      <div className="forgot-password-card">
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="forgot-password-header">
              <div className="forgot-password-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="forgot-password-title">¿Olvidaste tu contraseña?</h1>
              <p className="forgot-password-subtitle">
                No te preocupes, te enviaremos instrucciones para restablecerla.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="forgot-password-field">
                <label htmlFor="email" className="forgot-password-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="forgot-password-input"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="forgot-password-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`forgot-password-submit ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="forgot-password-spinner"></span>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>
            </form>

            {/* Link para volver */}
            <div className="forgot-password-back">
              <button onClick={handleGoBack} className="forgot-password-back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a iniciar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Estado de éxito */}
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="forgot-password-title">¡Revisa tu correo!</h1>
              <p className="forgot-password-subtitle">
                Si el correo <strong>{email}</strong> está registrado en nuestra plataforma, recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="forgot-password-hint">
                El enlace expirará en 1 hora por seguridad.
              </p>

              <button onClick={handleGoBack} className="forgot-password-submit">
                Volver al inicio
              </button>

              <p className="forgot-password-resend">
                ¿No recibiste el correo?{' '}
                <button onClick={() => setIsSubmitted(false)} className="forgot-password-resend-btn">
                  Intentar de nuevo
                </button>
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="forgot-password-footer">
          <p>💰 SplitEase - Divide gastos, no amistades</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
