import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationItem from '../components/notifications/NotificationItem/NotificationItem';
import NotificationSettings from '../components/notifications/NotificationSettings/NotificationSettings';
import {
  getPendingNotifications,
  getHistoryNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  connectNotificationSSE,
  disconnectNotificationSSE
} from '../config/notificacionesApi';
import './Notificacion.css';

/**
 * Página completa de Notificaciones
 * Vista de página completa con todas las notificaciones, paginación y tiempo real
 */
const Notificacion = () => {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Obtener usuario actual del localStorage
  const getUserId = () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      return usuario?.id_usuario;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  // Cargar notificaciones pendientes
  const loadPendingNotifications = async () => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const notifications = await getPendingNotifications(userId);
      setPendingNotifications(notifications);
    } catch (err) {
      console.error('Error al cargar notificaciones pendientes:', err);
      setError('No se pudieron cargar las notificaciones pendientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar historial de notificaciones con paginación
  const loadHistoryNotifications = async (page = 1, append = false) => {
    if (!userId) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    setError(null);
    try {
      const result = await getHistoryNotifications(userId, page, 15);
      
      if (append) {
        setHistoryNotifications(prev => [...prev, ...result.data]);
      } else {
        setHistoryNotifications(result.data);
      }
      
      setHasMoreHistory(result.hasMore);
      setHistoryPage(page);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de notificaciones');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Marcar una notificación como leída
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Remover de pendientes
      setPendingNotifications(prev => 
        prev.filter(n => n.id_notificacion !== notificationId)
      );
      
      // Si estamos en la pestaña de historial, recargar
      if (activeTab === 'historial') {
        loadHistoryNotifications(1, false);
      }
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    try {
      await markAllNotificationsAsRead(userId);
      setPendingNotifications([]);
      
      // Recargar historial si estamos en esa pestaña
      if (activeTab === 'historial') {
        loadHistoryNotifications(1, false);
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  // Manejar click en notificación
  const handleNotificationClick = (notification) => {
    // Primero marcar como leída si está pendiente
    if (notification.leida === 0) {
      handleMarkAsRead(notification.id_notificacion);
    }

    // Redirigir según el tipo de notificación
    if (notification.tipo_notificacion === 'INVITACIÓN') {
      // Extraer id_grupo de la URL si existe, o usar una ruta general
      
      navigate('/grupos');
      
    } else if (notification.tipo_notificacion === 'GASTO_AGREGADO') {
      // Redirigir a la página de gastos
    
      navigate('/gastos');
      
    } else if (notification.url_destino) {
      // Para otros tipos (PAGO_REALIZADO, SALDO_CAMBIADO), usar url_destino si existe
      navigate(notification.url_destino);
    }
  };

  // Cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'historial' && historyNotifications.length === 0) {
      loadHistoryNotifications(1, false);
    }
  };

  // Cargar más del historial
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreHistory) {
      loadHistoryNotifications(historyPage + 1, true);
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

  // Configurar Intersection Observer para scroll infinito
  useEffect(() => {
    if (activeTab !== 'historial') return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreHistory && !isLoadingMore) {
        handleLoadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, hasMoreHistory, isLoadingMore]);

  // Cargar datos iniciales y conectar SSE
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    // Cargar notificaciones pendientes
    loadPendingNotifications();

    // Conectar a SSE para actualizaciones en tiempo real
    eventSourceRef.current = connectNotificationSSE(
      userId,
      handleNewNotification,
      (error) => console.error('SSE Error:', error)
    );

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        disconnectNotificationSSE(eventSourceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!userId) {
    return null; // El useEffect redirigirá a login
  }

  return (
    <div className="notificacion-page">
      {/* Header */}
      <div className="notificacion-header">
        <div className="notificacion-header-content">
          <h1 className="notificacion-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '28px', height: '28px', display: 'inline-block', marginRight: '10px', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificaciones
          </h1>
          <div className="notificacion-header-actions">
            <button 
              className="notificacion-settings-btn"
              onClick={() => setShowSettings(true)}
              aria-label="Configuración"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="notificacion-content">
        {/* Tabs */}
        <div className="notificacion-tabs">
          <button
            className={`notificacion-tab ${activeTab === 'pendientes' ? 'active' : ''}`}
            onClick={() => handleTabChange('pendientes')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Pendientes 
            {pendingNotifications.length > 0 && (
              <span className="notificacion-tab-badge">{pendingNotifications.length}</span>
            )}
          </button>
          <button
            className={`notificacion-tab ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => handleTabChange('historial')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Historial
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="notificacion-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Notifications list */}
        <div className="notificacion-list">
          {activeTab === 'pendientes' ? (
            <>
              {/* Botón marcar todas */}
              {pendingNotifications.length > 0 && (
                <div className="notificacion-mark-all-container">
                  <button 
                    className="notificacion-mark-all-btn"
                    onClick={handleMarkAllAsRead}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Marcar todas como leídas
                  </button>
                </div>
              )}

              {/* Lista de pendientes */}
              {isLoading ? (
                <div className="notificacion-loading">
                  <div className="spinner"></div>
                  <p>Cargando notificaciones...</p>
                </div>
              ) : pendingNotifications.length === 0 ? (
                <div className="notificacion-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="notificacion-empty-icon-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3>No tienes notificaciones pendientes</h3>
                  <p>Cuando recibas nuevas notificaciones, aparecerán aquí</p>
                </div>
              ) : (
                <div className="notificacion-items">
                  {pendingNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id_notificacion}
                      notification={notification}
                      isPending={true}
                      onMarkRead={handleMarkAsRead}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Lista de historial */}
              {isLoading && historyNotifications.length === 0 ? (
                <div className="notificacion-loading">
                  <div className="spinner"></div>
                  <p>Cargando historial...</p>
                </div>
              ) : historyNotifications.length === 0 ? (
                <div className="notificacion-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="notificacion-empty-icon-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3>No hay notificaciones en el historial</h3>
                  <p>Las notificaciones que marques como leídas aparecerán aquí</p>
                </div>
              ) : (
                <>
                  <div className="notificacion-items">
                    {historyNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id_notificacion}
                        notification={notification}
                        isPending={false}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>

                  {/* Sentinel para scroll infinito */}
                  {hasMoreHistory && (
                    <div ref={loadMoreRef} className="notificacion-load-more">
                      {isLoadingMore && (
                        <div className="notificacion-loading-more">
                          <div className="spinner-small"></div>
                          <span>Cargando más...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mensaje de fin */}
                  {!hasMoreHistory && historyNotifications.length > 0 && (
                    <div className="notificacion-end-message">
                      No hay más notificaciones
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de configuración */}
      {showSettings && (
        <NotificationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default Notificacion;
