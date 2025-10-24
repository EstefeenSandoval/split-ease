import React from 'react';
import './NotificationItem.css';

/**
 * Componente NotificationItem - Tarjeta individual de notificación
 */
const NotificationItem = ({ notification, isPending, onMarkRead, onClick }) => {
  // Mapeo de iconos por tipo de notificación
  const iconMap = {
    'INVITACIÓN': '📬',
    'GASTO_AGREGADO': '💰',
    'PAGO_REALIZADO': '💸',
    'SALDO_CAMBIADO': '📊'
  };

  // Mapeo de títulos por tipo
  const titleMap = {
    'INVITACIÓN': 'Nueva invitación',
    'GASTO_AGREGADO': 'Gasto agregado',
    'PAGO_REALIZADO': 'Pago realizado',
    'SALDO_CAMBIADO': 'Saldo actualizado'
  };

  // Función para calcular tiempo relativo
  const getRelativeTime = (fecha) => {
    const now = new Date();
    const past = new Date(fecha);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return past.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const icon = iconMap[notification.tipo_notificacion] || '📢';
  const title = titleMap[notification.tipo_notificacion] || 'Notificación';
  const relativeTime = getRelativeTime(notification.fecha_envio);

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const handleMarkRead = (e) => {
    e.stopPropagation(); // Evitar que se dispare el onClick del contenedor
    if (onMarkRead) {
      onMarkRead(notification.id_notificacion);
    }
  };

  return (
    <div 
      className={`notification-item ${isPending ? 'pending' : 'read'}`}
      onClick={handleClick}
    >
      <div className="notification-item-header">
        <span className="notification-icon">{icon}</span>
        <span className="notification-title">{title}</span>
      </div>
      
      <div className="notification-message">
        {notification.mensaje}
      </div>
      
      <div className="notification-footer">
        <span className="notification-time">{relativeTime}</span>
        
        {isPending && onMarkRead && (
          <button 
            className="notification-mark-read-btn"
            onClick={handleMarkRead}
            aria-label="Marcar como leída"
          >
            ✓ Marcar
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
