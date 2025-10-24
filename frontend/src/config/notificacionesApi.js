// ============================================================================
// API DE NOTIFICACIONES - SplitEase
// Funciones para interactuar con los endpoints de notificaciones
// ============================================================================

import API_ENDPOINTS from './api';

/**
 * Obtener notificaciones pendientes (no leídas) del usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} - Array de notificaciones no leídas
 */
export const getPendingNotifications = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.notificaciones.obtenerNoLeidas(userId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener notificaciones pendientes');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error en getPendingNotifications:', error);
    throw error;
  }
};

/**
 * Obtener historial de notificaciones (leídas) con paginación
 * @param {number} userId - ID del usuario
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados (default: 15)
 * @returns {Promise<Object>} - Objeto con data, hasMore y total
 */
export const getHistoryNotifications = async (userId, page = 1, limit = 15) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.notificaciones.obtenerPorUsuario(userId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener historial de notificaciones');
    }

    // Filtrar solo las leídas y aplicar paginación manualmente
    const readNotifications = (data.data || []).filter(n => n.leida === 1);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: readNotifications.slice(start, end),
      hasMore: end < readNotifications.length,
      total: readNotifications.length
    };
  } catch (error) {
    console.error('Error en getHistoryNotifications:', error);
    throw error;
  }
};

/**
 * Obtener contador de notificaciones no leídas
 * @param {number} userId - ID del usuario
 * @returns {Promise<number>} - Cantidad de notificaciones no leídas
 */
export const getUnreadCount = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.notificaciones.contarNoLeidas(userId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener contador de notificaciones');
    }

    return data.total || 0;
  } catch (error) {
    console.error('Error en getUnreadCount:', error);
    throw error;
  }
};

/**
 * Marcar una notificación como leída
 * @param {number} notificationId - ID de la notificación
 * @returns {Promise<Object>} - Notificación actualizada
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.notificaciones.marcarLeida(notificationId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar notificación como leída');
    }

    return data.data;
  } catch (error) {
    console.error('Error en markNotificationAsRead:', error);
    throw error;
  }
};

/**
 * Marcar todas las notificaciones de un usuario como leídas
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.notificaciones.marcarTodasLeidas(userId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar todas las notificaciones como leídas');
    }

    return {
      success: data.success,
      count: data.affectedRows || 0
    };
  } catch (error) {
    console.error('Error en markAllNotificationsAsRead:', error);
    throw error;
  }
};

/**
 * Eliminar una notificación específica
 * @param {number} notificationId - ID de la notificación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.notificaciones.eliminar(notificationId), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar notificación');
    }

    return { success: data.success };
  } catch (error) {
    console.error('Error en deleteNotification:', error);
    throw error;
  }
};

/**
 * Conecta al stream de Server-Sent Events para recibir notificaciones en tiempo real
 * @param {number} userId - ID del usuario
 * @param {function} onNewNotification - Callback cuando llega una notificación nueva
 * @param {function} onError - Callback cuando hay un error (opcional)
 * @returns {EventSource} - Objeto EventSource para poder cerrar la conexión
 */
export const connectNotificationSSE = (userId, onNewNotification, onError) => {
  const token = localStorage.getItem('token');
  const url = `${API_ENDPOINTS.notificaciones.stream(userId)}?token=${token}`;
  
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // El backend envía un objeto con type, count y data
      if (data.type === 'notificaciones' && data.data) {
        // Procesar cada notificación
        data.data.forEach(notification => {
          onNewNotification(notification);
        });
      }
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    if (onError) onError(error);
    
    // Si la conexión se cierra, intentar reconectar después de 5 segundos
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('SSE connection closed. Will attempt to reconnect...');
    }
  };
  
  eventSource.onopen = () => {
    console.log('SSE connection established');
  };
  
  // Enviar ping cada 30 segundos para mantener la conexión
  const pingInterval = setInterval(() => {
    if (eventSource.readyState === EventSource.CLOSED) {
      clearInterval(pingInterval);
    }
  }, 30000);
  
  // Guardar referencia al intervalo para limpiarlo después
  eventSource.pingInterval = pingInterval;
  
  return eventSource;
};

/**
 * Desconecta el stream de SSE
 * @param {EventSource} eventSource - La conexión SSE activa
 */
export const disconnectNotificationSSE = (eventSource) => {
  if (eventSource) {
    if (eventSource.pingInterval) {
      clearInterval(eventSource.pingInterval);
    }
    eventSource.close();
    console.log('SSE connection disconnected');
  }
};

// Exportar todas las funciones como objeto por defecto también
const notificacionesApi = {
  getPendingNotifications,
  getHistoryNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  connectNotificationSSE,
  disconnectNotificationSSE
};

export default notificacionesApi;
