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
    actualizarPerfil: `${API_BASE_URL}/usuarios/perfil`
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
  
  // Verificar si la URL ya incluye el protocolo y host
  if (ruta.startsWith('http')) {
    return ruta;
  } else {
    // Si es una ruta relativa, agregar el host
    return `${STATIC_BASE_URL}${ruta}`;
  }
};

export default API_ENDPOINTS;
