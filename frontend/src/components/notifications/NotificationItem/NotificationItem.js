import React from 'react';
import './NotificationItem.css';

/**
 * Componente NotificationItem - Tarjeta individual de notificación
 */
const NotificationItem = ({ notification, isPending, onMarkRead, onClick }) => {
  // Mapeo de iconos SVG por tipo de notificación
  const iconMap = {
    'INVITACIÓN': (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" className="notification-icon-svg notification-icon-invitation">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M22 6l-10 7L2 6" />
      </svg>
    ),
    'GASTO_AGREGADO': (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" className="notification-icon-svg notification-icon-expense">
        <circle cx="12" cy="12" r="10" fill="none"/>
        <path d="M12 8v8M9 11h6" strokeLinecap="round"/>
      </svg>
    ),
    'PAGO_REALIZADO': (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9C27B0" strokeWidth="2" className="notification-icon-svg notification-icon-payment">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
        <circle cx="12" cy="12" r="3" fill="none"/>
      </svg>
    ),
    'SALDO_CAMBIADO': (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" className="notification-icon-svg notification-icon-balance">
        <polyline points="3 12 9 6 15 12 21 6"></polyline>
        <polyline points="3 20 9 14 15 20 21 14"></polyline>
      </svg>
    )
  };

  // Ícono por defecto (megáfono)
  const defaultIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" className="notification-icon-svg notification-icon-default">
      <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );

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

  const icon = iconMap[notification.tipo_notificacion] || defaultIcon;
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Marcar
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
