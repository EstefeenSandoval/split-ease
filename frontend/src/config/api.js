// Configuración dinámica basada en el entorno
// Detecta automáticamente si estás en desarrollo o producción

// Detectar si estamos en Capacitor (app móvil)
const isCapacitor = () => {
  return window.Capacitor !== undefined;
};

// Determinar la URL base según el entorno
const BASE_URL = process.env.REACT_APP_API_URL || 
  (isCapacitor() || process.env.NODE_ENV === 'production' 
    ? 'https://backend-split-ease.up.railway.app' 
    : 'http://localhost:3100');

const API_BASE_URL = `${BASE_URL}/api`;

// Configuración para URLs de archivos estáticos (imágenes, uploads, etc.)
export const STATIC_BASE_URL = BASE_URL;

export const API_ENDPOINTS = {
  usuarios: {
    login: `${API_BASE_URL}/usuarios/login`,
    registro: `${API_BASE_URL}/usuarios/registro`,
    perfil: `${API_BASE_URL}/usuarios/perfil`,
    validar: `${API_BASE_URL}/usuarios/validar`,
    actualizarPerfil: `${API_BASE_URL}/usuarios/perfil`,
    // Endpoints de verificación de email
    verificarEmail: (token) => `${API_BASE_URL}/usuarios/verificar-email/${token}`,
    reenviarVerificacion: `${API_BASE_URL}/usuarios/reenviar-verificacion`,
    // Endpoints de recuperación de contraseña
    forgotPassword: `${API_BASE_URL}/usuarios/forgot-password`,
    resetPassword: (token) => `${API_BASE_URL}/usuarios/reset-password/${token}`,
    validarTokenReset: (token) => `${API_BASE_URL}/usuarios/reset-password/${token}`,
    // Endpoint de verificación de cambio de perfil
    verificarCambioPerfil: (token) => `${API_BASE_URL}/usuarios/verificar-cambio/${token}`
  },
  grupos: {
    crear: `${API_BASE_URL}/grupos/crear`,
    obtener: `${API_BASE_URL}/grupos/mostrar`,
    obtenerPorId: (id) => `${API_BASE_URL}/grupos/${id}`,
    actualizar: `${API_BASE_URL}/grupos/actualizar`,
    eliminar: `${API_BASE_URL}/grupos/eliminar`,
    obtenerParticipantes: (id) => `${API_BASE_URL}/grupos/${id}/participantes`,
    eliminarParticipante: (idGrupo, idUsuario) => `${API_BASE_URL}/grupos/${idGrupo}/participantes/${idUsuario}`,
    unirse: `${API_BASE_URL}/grupos/unirse`
  },
  gastos: {
    crear: `${API_BASE_URL}/gastos`,
    obtenerPorGrupo: (idGrupo) => `${API_BASE_URL}/gastos/grupo/${idGrupo}`,
    obtenerPorId: (idGasto) => `${API_BASE_URL}/gastos/${idGasto}`,
    actualizar: (idGasto) => `${API_BASE_URL}/gastos/${idGasto}`,
    eliminar: (idGasto) => `${API_BASE_URL}/gastos/${idGasto}`,
    marcarPagado: (idGasto) => `${API_BASE_URL}/gastos/${idGasto}/pagar`,
    categorias: `${API_BASE_URL}/gastos/categorias`,
    crearCategoria: `${API_BASE_URL}/gastos/categorias`
  },
  dashboard: {
    personal: `${API_BASE_URL}/dashboard/personal`,
    actividad: `${API_BASE_URL}/dashboard/actividad`,
    saldarDeuda: `${API_BASE_URL}/dashboard/pagos/saldar`,
    historialPagos: (idGasto) => `${API_BASE_URL}/dashboard/pagos/historial/${idGasto}`
  },
  notificaciones: {
    crear: `${API_BASE_URL}/notificaciones`,
    obtenerPorUsuario: (idUsuario) => `${API_BASE_URL}/notificaciones/usuario/${idUsuario}`,
    obtenerNoLeidas: (idUsuario) => `${API_BASE_URL}/notificaciones/usuario/${idUsuario}/no-leidas`,
    contarNoLeidas: (idUsuario) => `${API_BASE_URL}/notificaciones/usuario/${idUsuario}/count`,
    stream: (idUsuario) => `${API_BASE_URL}/notificaciones/usuario/${idUsuario}/stream`,
    obtenerPorId: (idNotificacion) => `${API_BASE_URL}/notificaciones/${idNotificacion}`,
    marcarLeida: (idNotificacion) => `${API_BASE_URL}/notificaciones/${idNotificacion}/marcar-leida`,
    marcarTodasLeidas: (idUsuario) => `${API_BASE_URL}/notificaciones/usuario/${idUsuario}/marcar-todas-leidas`,
    eliminar: (idNotificacion) => `${API_BASE_URL}/notificaciones/${idNotificacion}`,
    eliminarLeidas: (idUsuario) => `${API_BASE_URL}/notificaciones/usuario/${idUsuario}/eliminar-leidas`
  }
};

// Función auxiliar para construir URLs de archivos estáticos
export const construirURLEstatico = (ruta) => {
  if (!ruta) return null;
  
  // Si es un data URL (para preview), devolverlo directamente
  if (ruta.startsWith('data:')) {
    return ruta;
  }
  
  let url;
  
  // Verificar si la URL ya incluye el protocolo y host
  if (ruta.startsWith('http')) {
    // Si tiene localhost, extraer solo la ruta relativa y reconstruir con el host correcto
    // Esto corrige URLs antiguas que se guardaron con host completo
    try {
      const urlObj = new URL(ruta);
      if (urlObj.hostname === 'localhost' || urlObj.hostname.includes('127.0.0.1')) {
        // Extraer la ruta relativa y reconstruir
        url = `${STATIC_BASE_URL}${urlObj.pathname}`;
      } else {
        url = ruta;
      }
    } catch (e) {
      url = ruta;
    }
  } else {
    // Si es una ruta relativa, agregar el host
    url = `${STATIC_BASE_URL}${ruta}`;
  }
  
  // Forzar HTTPS solo en Capacitor o producción, pero NUNCA para localhost
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  if (!isLocalhost && (isCapacitor() || process.env.NODE_ENV === 'production') && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  return url;
};

export default API_ENDPOINTS;
