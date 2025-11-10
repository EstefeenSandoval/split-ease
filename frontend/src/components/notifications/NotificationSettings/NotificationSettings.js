import React, { useState, useEffect } from 'react';
import './NotificationSettings.css';

/**
 * Componente NotificationSettings - Modal de configuración de notificaciones
 */
const NotificationSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notifications: {
      'INVITACIÓN': true,
      'GASTO_AGREGADO': true,
      'PAGO_REALIZADO': true,
      'SALDO_CAMBIADO': true
    }
  });

  // Cargar configuración guardada
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);

  // Guardar configuración
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  // Toggle sonido
  const handleSoundToggle = () => {
    const newSettings = {
      ...settings,
      soundEnabled: !settings.soundEnabled
    };
    saveSettings(newSettings);
  };

  // Toggle tipo de notificación
  const handleNotificationTypeToggle = (type) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    };
    saveSettings(newSettings);
  };

  // Cerrar modal
  const handleClose = () => {
    onClose();
  };

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const notificationTypes = [
    { 
      key: 'INVITACIÓN', 
      label: 'Invitaciones a grupos', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      )
    },
    { 
      key: 'GASTO_AGREGADO', 
      label: 'Nuevos gastos', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
          <circle cx="12" cy="12" r="10" fill="none"/>
          <path d="M12 8v8M9 11h6" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      key: 'PAGO_REALIZADO', 
      label: 'Pagos realizados', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#9C27B0" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <circle cx="12" cy="12" r="3" fill="none"/>
        </svg>
      )
    },
    { 
      key: 'SALDO_CAMBIADO', 
      label: 'Cambios de saldo', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
          <polyline points="3 12 9 6 15 12 21 6"></polyline>
          <polyline points="3 20 9 14 15 20 21 14"></polyline>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div className="notification-settings-overlay" onClick={handleClose}></div>

      {/* Modal */}
      <div className="notification-settings-modal">
        {/* Header */}
        <div className="notification-settings-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '22px', height: '22px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración de Notificaciones
          </h2>
          <button 
            className="notification-settings-close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="notification-settings-content">
          {/* Sonido */}
          <div className="notification-settings-section">
            <h3 className="notification-settings-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Sonido
            </h3>
            <div className="notification-settings-option">
              <div className="notification-settings-option-info">
                <span className="notification-settings-option-label">
                  Reproducir sonido al recibir notificaciones
                </span>
                <span className="notification-settings-option-description">
                  Se reproducirá un sonido cuando llegue una nueva notificación
                </span>
              </div>
              <label className="notification-settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={handleSoundToggle}
                />
                <span className="notification-settings-toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Tipos de notificaciones */}
          <div className="notification-settings-section">
            <h3 className="notification-settings-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Tipos de Notificaciones
            </h3>
            <p className="notification-settings-section-description">
              Selecciona qué tipos de notificaciones deseas recibir
            </p>
            
            {notificationTypes.map(type => (
              <div key={type.key} className="notification-settings-option">
                <div className="notification-settings-option-info">
                  <span className="notification-settings-option-label">
                    {type.icon} {type.label}
                  </span>
                </div>
                <label className="notification-settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications[type.key]}
                    onChange={() => handleNotificationTypeToggle(type.key)}
                  />
                  <span className="notification-settings-toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Info adicional */}
          <div className="notification-settings-info">
            <p>
              💡 <strong>Nota:</strong> Los filtros de tipo solo afectan las notificaciones 
              que se muestran. El servidor seguirá enviando todas las notificaciones.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="notification-settings-footer">
          <button 
            className="notification-settings-done-btn"
            onClick={handleClose}
          >
            Listo
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;
