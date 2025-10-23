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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const notificationTypes = [
    { key: 'INVITACIÓN', label: 'Invitaciones a grupos', icon: '📬' },
    { key: 'GASTO_AGREGADO', label: 'Nuevos gastos', icon: '💰' },
    { key: 'PAGO_REALIZADO', label: 'Pagos realizados', icon: '💸' },
    { key: 'SALDO_CAMBIADO', label: 'Cambios de saldo', icon: '📊' }
  ];

  return (
    <>
      {/* Overlay */}
      <div className="notification-settings-overlay" onClick={handleClose}></div>

      {/* Modal */}
      <div className="notification-settings-modal">
        {/* Header */}
        <div className="notification-settings-header">
          <h2>⚙️ Configuración de Notificaciones</h2>
          <button 
            className="notification-settings-close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="notification-settings-content">
          {/* Sonido */}
          <div className="notification-settings-section">
            <h3 className="notification-settings-section-title">🔊 Sonido</h3>
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
            <h3 className="notification-settings-section-title">📢 Tipos de Notificaciones</h3>
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
