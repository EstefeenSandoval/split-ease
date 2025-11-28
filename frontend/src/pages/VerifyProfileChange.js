import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { isNativeApp } from '../utils/platform';
import './VerifyEmail.css'; // Reutilizamos estilos

/**
 * Página de verificación de cambios de perfil
 * Se accede mediante el link enviado por correo: /verificar-cambio/:token
 */
const VerifyProfileChange = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const isNative = isNativeApp();
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'expired'
  const [message, setMessage] = useState('');
  const [cambios, setCambios] = useState(null);

  useEffect(() => {
    const verificarCambio = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado.');
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.usuarios.verificarCambioPerfil(token), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.exito) {
          setStatus('success');
          setMessage('¡Cambios aplicados correctamente!');
          setCambios(data.cambiosAplicados);
        } else if (data.tokenExpirado) {
          setStatus('expired');
          setMessage('El enlace de verificación ha expirado. Por favor, realiza los cambios nuevamente.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar los cambios.');
        }
      } catch (error) {
        console.error('Error verificando cambios:', error);
        setStatus('error');
        setMessage('Error de conexión. Por favor, intenta de nuevo.');
      }
    };

    verificarCambio();
  }, [token]);

  const handleGoToOptions = () => {
    navigate('/opciones');
  };

  const handleGoHome = () => {
    if (isNative) {
      navigate('/dashboard');
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
          {status === 'loading' && 'Aplicando cambios...'}
          {status === 'success' && '¡Perfil Actualizado!'}
          {status === 'error' && 'Error de Verificación'}
          {status === 'expired' && 'Enlace Expirado'}
        </h1>

        {/* Mensaje */}
        <p className="verify-email-message">{message}</p>

        {/* Mostrar cambios aplicados */}
        {status === 'success' && cambios && (
          <div style={{
            background: '#f0fdf4',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#166534' }}>
              Cambios aplicados:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803d' }}>
              {cambios.nombre && <li>Nombre actualizado a: <strong>{cambios.nombre}</strong></li>}
              {cambios.email && <li>Email actualizado a: <strong>{cambios.email}</strong></li>}
            </ul>
          </div>
        )}

        {/* Acciones */}
        <div className="verify-email-actions">
          {status === 'success' && (
            <button onClick={handleGoToOptions} className="verify-email-btn primary">
              Ir a Configuración
            </button>
          )}
          
          {status === 'expired' && (
            <>
              <p className="verify-email-help">
                Para realizar cambios en tu perfil, ve a la sección de configuración.
              </p>
              <button onClick={handleGoToOptions} className="verify-email-btn primary">
                Ir a Configuración
              </button>
            </>
          )}
          
          {status === 'error' && (
            <button onClick={handleGoHome} className="verify-email-btn secondary">
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

export default VerifyProfileChange;
