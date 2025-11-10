import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationItem from '../NotificationItem/NotificationItem';
import NotificationSettings from '../NotificationSettings/NotificationSettings';
import { 
  getPendingNotifications, 
  getHistoryNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadCount,
  connectNotificationSSE,
  disconnectNotificationSSE
} from '../../../config/notificacionesApi';
import './NotificationPanel.css';

/**
 * Componente NotificationPanel - Panel dropdown de notificaciones
 */
export const NotificationPanel = ({ isOpen, onClose, userId, anchorRef, onCountUpdate }) => {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);

  // Cargar notificaciones pendientes
  const loadPendingNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const notifications = await getPendingNotifications(userId);
      setPendingNotifications(notifications);
    } catch (err) {
      console.error('Error al cargar notificaciones pendientes:', err);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar historial de notificaciones con paginación
  const loadHistoryNotifications = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getHistoryNotifications(userId, page, 15);
      
      if (page === 1) {
        setHistoryNotifications(result.data);
      } else {
        setHistoryNotifications(prev => [...prev, ...result.data]);
      }
      
      setHasMoreHistory(result.hasMore);
      setHistoryPage(page);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar una notificación como leída
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Remover de pendientes y agregar a historial
      const notification = pendingNotifications.find(n => n.id_notificacion === notificationId);
      if (notification) {
        setPendingNotifications(prev => prev.filter(n => n.id_notificacion !== notificationId));
        
        // Actualizar contador
        const newCount = await getUnreadCount(userId);
        if (onCountUpdate) {
          onCountUpdate(newCount);
        }
        
        // Si estamos en la pestaña de historial, recargar
        if (activeTab === 'historial') {
          loadHistoryNotifications(1);
        }
      }
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      setPendingNotifications([]);
      
      // Actualizar contador
      if (onCountUpdate) {
        onCountUpdate(0);
      }
      
      // Recargar historial si estamos en esa pestaña
      if (activeTab === 'historial') {
        loadHistoryNotifications(1);
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  // Cargar más del historial
  const handleLoadMore = () => {
    if (!isLoading && hasMoreHistory) {
      loadHistoryNotifications(historyPage + 1);
    }
  };

  // Manejar click en notificación
  const handleNotificationClick = (notification) => {
    // Si tiene URL de destino, navegar
    if (notification.url_destino) {
      navigate(notification.url_destino);
      onClose();
    }
    
    // Si está pendiente, marcar como leída
    if (notification.leida === 0) {
      handleMarkAsRead(notification.id_notificacion);
    }
  };

  // Cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'historial' && historyNotifications.length === 0) {
      loadHistoryNotifications(1);
    }
  };

  // Manejar nueva notificación desde SSE
  const handleNewNotification = (notification) => {
    if (notification.leida === 0) {
      setPendingNotifications(prev => {
        // Evitar duplicados
        if (prev.some(n => n.id_notificacion === notification.id_notificacion)) {
          return prev;
        }
        return [notification, ...prev];
      });
    }
  };

  // Efecto para cargar notificaciones al abrir el panel
  useEffect(() => {
    if (isOpen) {
      loadPendingNotifications();
      
      // Conectar a SSE para actualizaciones en tiempo real
      eventSourceRef.current = connectNotificationSSE(
        userId,
        handleNewNotification,
        (error) => console.error('SSE Error en panel:', error)
      );
    }
    
    return () => {
      if (eventSourceRef.current) {
        disconnectNotificationSSE(eventSourceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  // Efecto para cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <>
      <div ref={panelRef} className="notification-panel">
        {/* Header */}
        <div className="notification-panel-header">
          <h3 className="notification-panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificaciones
          </h3>
         
        </div>

        {/* Tabs */}
        <div className="notification-panel-tabs">
          <button
            className={`notification-tab ${activeTab === 'pendientes' ? 'active' : ''}`}
            onClick={() => handleTabChange('pendientes')}
          >
            Pendientes {pendingNotifications.length > 0 && `(${pendingNotifications.length})`}
          </button>
          <button
            className={`notification-tab ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => handleTabChange('historial')}
          >
            Historial
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="notification-panel-error">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="notification-panel-content">
          {activeTab === 'pendientes' ? (
            <>
              {isLoading && pendingNotifications.length === 0 ? (
                <div className="notification-panel-loading">
                  <div className="spinner"></div>
                  <p>Cargando...</p>
                </div>
              ) : pendingNotifications.length === 0 ? (
                <div className="notification-panel-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="empty-icon-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No tienes notificaciones pendientes</p>
                </div>
              ) : (
                pendingNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id_notificacion}
                    notification={notification}
                    isPending={true}
                    onMarkRead={handleMarkAsRead}
                    onClick={handleNotificationClick}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {isLoading && historyNotifications.length === 0 ? (
                <div className="notification-panel-loading">
                  <div className="spinner"></div>
                  <p>Cargando historial...</p>
                </div>
              ) : historyNotifications.length === 0 ? (
                <div className="notification-panel-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="empty-icon-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No hay notificaciones en el historial</p>
                </div>
              ) : (
                <>
                  {historyNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id_notificacion}
                      notification={notification}
                      isPending={false}
                      onClick={handleNotificationClick}
                    />
                  ))}
                  
                  {hasMoreHistory && (
                    <button 
                      className="notification-load-more-btn"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Cargando...' : 'Cargar más'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'pendientes' && pendingNotifications.length > 0 && (
          <div className="notification-panel-footer">
            <button 
              className="notification-mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </button>
          </div>
        )}
      </div>

      {/* Modal de configuración */}
      {showSettings && (
        <NotificationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default NotificationPanel;
