import React, { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import { API_ENDPOINTS } from '../../config/api';
import './EmailVerificationBanner.css';

/**
 * Banner de advertencia para usuarios con email no verificado
 * Muestra un banner persistente con opción de reenviar verificación
 * Incluye cooldown visual de 5 minutos entre reenvíos
 */
const EmailVerificationBanner = ({ user, onVerificationSent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Verificar si debe mostrar el banner
  useEffect(() => {
    if (user && user.email_verificado === false && !isDismissed) {
      setIsVisible(true);
      
      // Verificar si hay cooldown guardado
      const lastResend = localStorage.getItem('lastVerificationResend');
      if (lastResend) {
        const elapsed = Math.floor((Date.now() - parseInt(lastResend)) / 1000);
        const remaining = 300 - elapsed; // 5 minutos = 300 segundos
        if (remaining > 0) {
          setCooldownSeconds(remaining);
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [user, isDismissed]);

  // Contador de cooldown
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  const handleResendVerification = async () => {
    if (cooldownSeconds > 0 || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.usuarios.reenviarVerificacion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email de verificación enviado. Revisa tu bandeja de entrada.');
        // Guardar timestamp y activar cooldown
        localStorage.setItem('lastVerificationResend', Date.now().toString());
        setCooldownSeconds(300); // 5 minutos
        if (onVerificationSent) onVerificationSent();
      } else if (response.status === 429 && data.minutosRestantes) {
        setCooldownSeconds(data.minutosRestantes * 60);
        toast.warning(`Espera ${data.minutosRestantes} minutos antes de reenviar.`);
      } else {
        toast.error(data.error || 'Error al enviar email de verificación.');
      }
    } catch (error) {
      console.error('Error reenviando verificación:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="email-verification-banner">
      <div className="email-verification-banner-content">
        <div className="email-verification-banner-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div className="email-verification-banner-text">
          <p className="email-verification-banner-title">
            ⚠️ Tu email no está verificado
          </p>
          <p className="email-verification-banner-subtitle">
            Verifica tu email para poder editar tu perfil y recuperar tu contraseña.
          </p>
        </div>

        <div className="email-verification-banner-actions">
          <button
            onClick={handleResendVerification}
            disabled={isLoading || cooldownSeconds > 0}
            className="email-verification-banner-btn primary"
          >
            {isLoading ? (
              <span className="email-verification-banner-spinner"></span>
            ) : cooldownSeconds > 0 ? (
              `Reenviar en ${formatCooldown(cooldownSeconds)}`
            ) : (
              'Reenviar email'
            )}
          </button>
          
          <button
            onClick={handleDismiss}
            className="email-verification-banner-btn dismiss"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
