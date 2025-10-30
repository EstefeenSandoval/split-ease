import React, { useState, useEffect, useRef } from 'react';
import NotificationPanel from './NotificationPanel';
import { getUnreadCount, connectNotificationSSE, disconnectNotificationSSE } from '../../config/notificacionesApi';
import './NotificationBell.css';

/**
 * Componente NotificationBell - Icono de campana con badge
 * Muestra el contador de notificaciones no leídas y maneja la conexión SSE
 */
const NotificationBell = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bellRef = useRef(null);
  const eventSourceRef = useRef(null);
  const audioRef = useRef(null);

  // Cargar configuración de sonido
  const getSoundEnabled = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      return settings.soundEnabled !== false; // Por defecto habilitado
    } catch {
      return true;
    }
  };

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    if (getSoundEnabled() && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('No se pudo reproducir el sonido:', err);
      });
    }
  };

  // Cargar contador inicial
  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  };

  // Manejar nueva notificación desde SSE
  const handleNewNotification = (notification) => {
    console.log('Nueva notificación recibida:', notification);
    
    // Incrementar contador si la notificación no está leída
    if (notification.leida === 0) {
      setUnreadCount(prev => prev + 1);
      
      // Activar animación del badge
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      
      // Reproducir sonido
      playNotificationSound();
    }
  };

  // Manejar error de SSE
  const handleSSEError = (error) => {
    console.error('Error en conexión SSE:', error);
  };

  // Toggle del panel
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // Cerrar panel
  const closePanel = () => {
    setIsPanelOpen(false);
  };

  // Actualizar contador cuando se marca como leída
  const handleCountUpdate = (newCount) => {
    setUnreadCount(newCount);
  };

  // Efecto para cargar contador inicial y conectar SSE
  useEffect(() => {
    if (!userId) return;

    // Cargar contador inicial
    loadUnreadCount();

    // Conectar a SSE
    eventSourceRef.current = connectNotificationSSE(
      userId,
      handleNewNotification,
      handleSSEError
    );

    // Cleanup: desconectar SSE al desmontar
    return () => {
      if (eventSourceRef.current) {
        disconnectNotificationSSE(eventSourceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="notification-bell-container">
      {/* Audio para notificaciones (sonido de campana suave y placentero) */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" type="audio/wav" />
      </audio>

      {/* Icono de campana */}
      <button 
        ref={bellRef}
        className="notification-bell-button"
        onClick={togglePanel}
        aria-label={`Notificaciones (${unreadCount} no leídas)`}
      >
        <span className="bell-icon">🔔</span>
        
        {/* Badge con contador */}
        {unreadCount > 0 && (
          <span className={`notification-badge ${isAnimating ? 'bounce' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isPanelOpen && (
        <NotificationPanel
          isOpen={isPanelOpen}
          onClose={closePanel}
          userId={userId}
          anchorRef={bellRef}
          onCountUpdate={handleCountUpdate}
        />
      )}
    </div>
  );
};

export default NotificationBell;
