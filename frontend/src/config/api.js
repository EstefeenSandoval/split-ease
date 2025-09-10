const API_BASE_URL = 'http://localhost:3100/api';

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
  }
};

export default API_ENDPOINTS;
