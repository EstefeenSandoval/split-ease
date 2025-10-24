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
      {/* Audio para notificaciones (sonido de campana simple) */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBix+zPLTgjMGHm7A7+OZUA0PVqzn7K5aGAlBm+HwwG8fBil5yvHYiToIGGS56+OdTwwOUKXi8LBnHgU7k9jvzH4qBSF0xPDckjwMElyx6OyzXBULQ5zg8L1vIgYneMnw24Y6CRZiuOnmm08OFVeu5+6vWxkJQJvh8cJxJAUrdMjw2YU4CRVhtuvkm1ARDlCl4+6xZh4FO5HY78t+KwUgdcPw3JA8DBJcsejrtFwVCUOc4PC9cCIFKHfJ8NqGOgkVYrjp5ZtQDhVXr+furVsZB0Gb4fDCcSQGK3PI8NiFOQgVYbbr5ZpQEg5RpePusGYfBTmR1+/LfywGIHXD8NuQOwwSXLHn67RbFQlDnN/wvnEiBih3yPDah jkJFGK36OSbUA4VVq/o761bGQZBnODwwXEkBSp0yPDYhDkIFWG06+WbURINUKXk77FmHwU5kNfvy34sBSB1w/DbkDsMEVux6Ou0WhYIQ53g8L5wIgYnd8jw2oY5CRRit+jkm08OE1av6O+uXBgGQJzg8MJyJAUpdMjw14U5CBVhtOvlm1ESDVCl5O+wZx4FOY/X78t+LAUgdcPw25A8DBBbsefrtFoVCEOd4PC+cSMFKHfI8NqFOQkUY7fo45pPDhNWr+nvr1sYB0Cc4PDCciQFK3TH8NeFOQgUYrTr5ZxREw5RpuTurWcfBTmO1+/LfywGH3TE8N2ROwwQW7Hm67NbFQhDneDwvm8jBSd3yPDahToIFGG15+ObUA4TVq/p761bGAdAnODwwXEjBSt0x/DXhTkIFGO06+WbUBMOUKXk7q1mHwU5jtfwzH8rBh91w/DbkDoMEVux5uuzWxQIQpve8L9vIwYod8jw2YU7CBRhtufkmk8OElev6e6tWxgHQZ3h8MFxIgUpdcfw2IQ5CBRituvlnE8SDlGm5O+uZh4FOY7X8Mx/KwYfdMPw2484DBBZs+brsVsTCEGd4PG/cCMGKHjI8dmFOQgUYbbn45pPDhJWr+nurVwZBkCd4PC/cCIFKnXH8NiEOQgUYrfr5p1QEZBQP8+Pnz8+Pj+QkJ+enp6fn/Dw8PDw8P" type="audio/wav" />
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
