import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { isNativeApp } from '../utils/platform';
import './VerifyEmail.css';

/**
 * Página de verificación de email
 * Se accede mediante el link enviado por correo: /verificar-email/:token
 */
const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const isNative = isNativeApp();
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'expired'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verificarEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado.');
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.usuarios.verificarEmail(token), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.verificado) {
          setStatus('success');
          setMessage(data.mensaje || '¡Email verificado correctamente!');
        } else if (data.tokenExpirado) {
          setStatus('expired');
          setMessage('El enlace de verificación ha expirado. Por favor, solicita uno nuevo.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar el email.');
        }
      } catch (error) {
        console.error('Error verificando email:', error);
        setStatus('error');
        setMessage('Error de conexión. Por favor, intenta de nuevo.');
      }
    };

    verificarEmail();
  }, [token]);

  const handleGoToLogin = () => {
    if (isNative) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`verify-email-container ${isNative ? 'native' : ''}`}>
      <div className="verify-email-card">
        {/* Icono según estado */}
        <div className={`verify-email-icon ${status}`}>
          {status === 'loading' && (
            <div className="verify-email-spinner"></div>
          )}
          {status === 'success' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'error' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {status === 'expired' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Título */}
        <h1 className="verify-email-title">
          {status === 'loading' && 'Verificando tu email...'}
          {status === 'success' && '¡Email Verificado!'}
          {status === 'error' && 'Error de Verificación'}
          {status === 'expired' && 'Enlace Expirado'}
        </h1>

        {/* Mensaje */}
        <p className="verify-email-message">{message}</p>

        {/* Acciones */}
        <div className="verify-email-actions">
          {status === 'success' && (
            <button onClick={handleGoToLogin} className="verify-email-btn primary">
              Iniciar Sesión
            </button>
          )}
          
          {status === 'expired' && (
            <>
              <p className="verify-email-help">
                Para solicitar un nuevo enlace, inicia sesión y ve a la sección de configuración.
              </p>
              <button onClick={handleGoToLogin} className="verify-email-btn primary">
                Ir a Inicio
              </button>
            </>
          )}
          
          {status === 'error' && (
            <button onClick={handleGoToLogin} className="verify-email-btn secondary">
              Volver al Inicio
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="verify-email-footer">
          <p>💰 SplitEase - Divide gastos, no amistades</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
